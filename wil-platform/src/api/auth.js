import { supabase } from "../lib/supabaseClient.js";

/**
 * IMPORTANT — read this before wiring up signup in production.
 *
 * The `users` table has its own `password_hash` column, but Supabase Auth already stores
 * password credentials securely (hashed, salted) in its internal `auth.users` table, which
 * this app also uses for the actual login check. That means `password_hash` here is redundant
 * with what Supabase already does — it is NOT used to verify logins anywhere in this app.
 * We still populate it (with a client-side SHA-256 digest) purely so the NOT NULL constraint
 * on that column doesn't block inserts. This is not meaningful security — a client-side hash
 * with no server-side salt/verification, sitting in auth metadata the client itself can read
 * (see below), is not a real credential store. If you don't need this column for anything, the
 * cleanest fix is to drop it from the schema and rely on Supabase Auth entirely, which is what
 * this app effectively already does.
 */
async function weakClientSideDigest(password) {
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Why "pending_profile" metadata exists at all:
 *
 * If your Supabase project requires email confirmation, `supabase.auth.signUp()` creates the
 * auth user but returns NO active session — auth.uid() is null until the user clicks the
 * confirmation link and logs in. That means we CANNOT insert into `users`/`student`/`company`
 * right after signUp(), because RLS has nothing to check auth.uid() against yet, and the
 * insert will be silently rejected.
 *
 * Instead, we stash the profile fields the user typed into Supabase Auth's user_metadata
 * (via signUp's `options.data`), which is saved regardless of confirmation status. Then, on
 * every login (see AuthContext.jsx -> provisionProfileIfNeeded), we check: does a `users` row
 * already exist for this account? If not, create it now — using the metadata — while we DO
 * have a valid, authenticated session. This makes signup work correctly whether or not email
 * confirmation is turned on, without you having to toggle that setting.
 */
// De-duplicates concurrent provisioning attempts for the same user. AuthContext calls
// provisionProfileIfNeeded on every auth state change, and both React 18 StrictMode (in dev)
// and Supabase itself (separate INITIAL_SESSION / SIGNED_IN events) can trigger more than one
// of those in quick succession. Without this, two calls can both see "no users row yet" before
// either has inserted, and both start writing — since `student.user_id` has no uniqueness
// constraint in the schema, that can create a duplicate `student` row before the second call
// finally fails later on `stud_details.student_email`'s unique constraint. Keying in-flight
// calls by user id means the second caller just awaits the first call's own promise instead of
// starting a second, independent attempt.
const provisioningInFlight = new Map();

export async function provisionProfileIfNeeded(user) {
  if (provisioningInFlight.has(user.id)) {
    return provisioningInFlight.get(user.id);
  }
  const promise = provisionProfileNow(user).finally(() =>
    provisioningInFlight.delete(user.id),
  );
  provisioningInFlight.set(user.id, promise);
  return promise;
}

async function provisionProfileNow(user) {
  const { data: existingUserRow } = await supabase
    .from("users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existingUserRow) return; // already provisioned, nothing to do

  const meta = user.user_metadata || {};
  const role = meta.pending_role;
  const p = meta.pending_profile;

  // eslint-disable-next-line no-console
  console.log(
    "[provisionProfileIfNeeded] metadata for",
    user.email,
    "->",
    meta,
  );

  if (!role || !p) {
    // Account exists in Supabase Auth but has no pending_profile metadata at all — most likely
    // it was created by an older version of the signup code (before pending_profile existed),
    // or directly via the Supabase dashboard. There's nothing to auto-provision from.
    throw new Error(
      `This account (${user.email}) has no signup data attached, so its profile can't be created automatically. ` +
        `Delete it in Supabase Dashboard -> Authentication -> Users and sign up again.`,
    );
  }

  if (role === "student") {
    const missing = ["name", "surname"].filter((field) => !p[field]);
    if (missing.length) {
      throw new Error(
        `Signup data for ${user.email} is missing required field(s): ${missing.join(", ")}. ` +
          `Delete this account in Supabase Dashboard -> Authentication -> Users and sign up again with those fields filled in.`,
      );
    }
  }
  if (role === "company" && !p.compName) {
    throw new Error(
      `Signup data for ${user.email} is missing the company name. ` +
        `Delete this account in Supabase Dashboard -> Authentication -> Users and sign up again.`,
    );
  }

  const { error: userRowError } = await supabase.from("users").insert({
    user_id: user.id,
    password_hash: p.password_hash,
    user_type: role,
  });
  if (userRowError) {
    if (userRowError.code === "23505") return; // a concurrent call already provisioned this user — fine
    throw userRowError;
  }

  if (role === "student") {
    const { data: studentRow, error: studentError } = await supabase
      .from("student")
      .insert({
        user_id: user.id,
        name: p.name,
        surname: p.surname,
        sex: p.sex || null,
        age: p.age ? Number(p.age) : null,
      })
      .select()
      .single();
    if (studentError) throw studentError;

    const { error: detailsError } = await supabase.from("stud_details").insert({
      stud_id: studentRow.stud_id,
      student_email: p.studentEmail,
      personal_email: p.personalEmail || null,
      course_field: p.courseField || null,
      cell_no: p.cellNo || null,
    });
    if (detailsError) throw detailsError;
  } else if (role === "company") {
    const { error: companyError } = await supabase.from("company").insert({
      user_id: user.id,
      comp_name: p.compName,
      comp_email: p.compEmail,
      comp_description: p.compDescription || null,
    });
    if (companyError) throw companyError;
  }
}

/**
 * Sign up a new student. Stores form data as pending_profile metadata (see above), and
 * provisions the actual `users`/`student`/`stud_details` rows immediately ONLY if signUp()
 * returned an active session (i.e. your project doesn't require email confirmation). Otherwise
 * provisioning happens automatically on first login.
 */
export async function signUpStudent(form) {
  const password_hash = await weakClientSideDigest(form.password);
  const pendingProfile = {
    name: form.name,
    surname: form.surname,
    sex: form.sex,
    age: form.age,
    courseField: form.courseField,
    cellNo: form.cellNo,
    personalEmail: form.personalEmail,
    studentEmail: form.email,
    password_hash,
  };

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: { pending_role: "student", pending_profile: pendingProfile },
    },
  });
  if (authError) throw authError;
  if (!authData.user)
    throw new Error("Sign-up did not return a user — please try again.");

  if (authData.session) {
    await provisionProfileIfNeeded(authData.user);
    return { emailConfirmationRequired: false };
  }
  return { emailConfirmationRequired: true };
}

export async function signUpCompany(form) {
  const password_hash = await weakClientSideDigest(form.password);
  const pendingProfile = {
    compName: form.compName,
    compEmail: form.email,
    compDescription: form.compDescription,
    password_hash,
  };

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: { pending_role: "company", pending_profile: pendingProfile },
    },
  });
  if (authError) throw authError;
  if (!authData.user)
    throw new Error("Sign-up did not return a user — please try again.");

  if (authData.session) {
    await provisionProfileIfNeeded(authData.user);
    return { emailConfirmationRequired: false };
  }
  return { emailConfirmationRequired: true };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Look up the app-level role + profile id for the current auth user. */
export async function loadProfile(userId) {
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("user_id, user_type, date_created")
    .eq("user_id", userId)
    .single();
  if (userError) throw userError;

  if (userRow.user_type === "student") {
    const { data: student, error } = await supabase
      .from("student")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return { ...userRow, profile: student };
  }
  if (userRow.user_type === "company") {
    const { data: company, error } = await supabase
      .from("company")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return { ...userRow, profile: company };
  }
  return { ...userRow, profile: null };
}
