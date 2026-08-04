import { supabase } from '../lib/supabaseClient.js';

/**
 * IMPORTANT — read this before wiring up signup in production.
 *
 * The `users` table has its own `password_hash` column, but Supabase Auth already stores
 * password credentials securely (hashed, salted) in its internal `auth.users` table, which
 * this app also uses for the actual login check. That means `password_hash` here is redundant
 * with what Supabase already does — it is NOT used to verify logins anywhere in this app.
 * We still populate it (with a client-side SHA-256 digest) purely so the NOT NULL constraint
 * on that column doesn't block inserts. This is not meaningful security — a client-side hash
 * with no server-side salt/verification is not a real credential store. If you don't need this
 * column for anything, the cleanest fix is to drop it from the schema and rely on Supabase
 * Auth entirely, which is what this app effectively already does.
 */
async function weakClientSideDigest(password) {
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sign up a new user. `userType` is 'student' or 'company'.
 * Flow:
 *  1. supabase.auth.signUp() creates the real auth identity (Supabase manages the password).
 *  2. We insert a matching row into public.users using the SAME id as the auth user
 *     (auth.uid()), which is what every RLS policy in the schema assumes.
 *  3. We insert the role-specific profile row (student or company).
 *
 * NOTE: as shipped, the schema's RLS policies do not include an INSERT policy that lets a
 * newly authenticated (non-admin) user write their own rows into `users`, `student`, or
 * `company`. Steps 2 and 3 below will fail with a permission-denied error until you apply the
 * additive policies in supabase/recommended-fixes.sql (see the README for why).
 */
export async function signUpStudent({ email, password, name, surname, sex, age, courseField, cellNo, personalEmail }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;
  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Sign-up succeeded but no user id was returned — check if email confirmation is required.');
  }

  const password_hash = await weakClientSideDigest(password);

  const { error: userRowError } = await supabase
    .from('users')
    .insert({ user_id: userId, password_hash, user_type: 'student' });
  if (userRowError) throw userRowError;

  const { data: studentRow, error: studentError } = await supabase
    .from('student')
    .insert({ user_id: userId, name, surname, sex: sex || null, age: age ? Number(age) : null })
    .select()
    .single();
  if (studentError) throw studentError;

  const { error: detailsError } = await supabase.from('stud_details').insert({
    stud_id: studentRow.stud_id,
    student_email: email,
    personal_email: personalEmail || null,
    course_field: courseField || null,
    cell_no: cellNo || null,
  });
  if (detailsError) throw detailsError;

  return { userId, studId: studentRow.stud_id };
}

export async function signUpCompany({ email, password, compName, compDescription }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;
  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Sign-up succeeded but no user id was returned — check if email confirmation is required.');
  }

  const password_hash = await weakClientSideDigest(password);

  const { error: userRowError } = await supabase
    .from('users')
    .insert({ user_id: userId, password_hash, user_type: 'company' });
  if (userRowError) throw userRowError;

  const { data: companyRow, error: companyError } = await supabase
    .from('company')
    .insert({ user_id: userId, comp_name: compName, comp_email: email, comp_description: compDescription || null })
    .select()
    .single();
  if (companyError) throw companyError;

  return { userId, compId: companyRow.comp_id };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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
    .from('users')
    .select('user_id, user_type, date_created')
    .eq('user_id', userId)
    .single();
  if (userError) throw userError;

  if (userRow.user_type === 'student') {
    const { data: student, error } = await supabase.from('student').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return { ...userRow, profile: student };
  }
  if (userRow.user_type === 'company') {
    const { data: company, error } = await supabase.from('company').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return { ...userRow, profile: company };
  }
  return { ...userRow, profile: null };
}
