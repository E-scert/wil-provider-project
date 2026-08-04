import { supabase } from "../lib/supabaseClient.js";

async function weakClientSideDigest(password) {
  const enc = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- SIGNUP: only creates the auth identity ---
export async function signUp({ email, password }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;
  return authData.user; // profile rows will be created later
}

// --- LOGIN: ensures profile rows exist ---
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  const userId = data.user.id;
  await ensureProfile(userId, email, password); // bootstrap profile if missing
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

// --- PROFILE LOADER ---
export async function loadProfile(userId) {
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("user_id, user_type, date_created")
    .eq("user_id", userId)
    .maybeSingle(); // use maybeSingle to avoid 406
  if (userError) throw userError;
  if (!userRow) return null;

  if (userRow.user_type === "student") {
    const { data: student } = await supabase
      .from("student")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return { ...userRow, profile: student };
  }
  if (userRow.user_type === "company") {
    const { data: company } = await supabase
      .from("company")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return { ...userRow, profile: company };
  }
  return { ...userRow, profile: null };
}

// --- PROFILE BOOTSTRAP ---
async function ensureProfile(userId, email, password) {
  const existing = await loadProfile(userId);
  if (existing) return; // already has rows

  const password_hash = await weakClientSideDigest(password);

  // Insert into users
  const { error: userRowError } = await supabase
    .from("users")
    .insert({ user_id: userId, password_hash, user_type: "student" }); // or 'company'
  if (userRowError) throw userRowError;

  // Insert into student/company depending on your app flow
  const { data: studentRow, error: studentError } = await supabase
    .from("student")
    .insert({ user_id: userId })
    .select()
    .single();
  if (studentError) throw studentError;

  // Insert details
  await supabase.from("stud_details").insert({
    stud_id: studentRow.stud_id,
    student_email: email,
  });
}
