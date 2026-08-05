import { supabase } from "../lib/supabaseClient.js";

export async function getStudentByUserId(userId) {
  const { data, error } = await supabase
    .from("student")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getStudentDetails(studId) {
  const { data, error } = await supabase
    .from("stud_details")
    .select("*")
    .eq("stud_id", studId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateStudentProfile(
  studId,
  { name, surname, sex, age },
) {
  const { data, error } = await supabase
    .from("student")
    .update({ name, surname, sex, age: age ? Number(age) : null })
    .eq("stud_id", studId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertStudentDetails(
  studId,
  { studentEmail, personalEmail, courseField, cellNo },
) {
  const { data: existing } = await supabase
    .from("stud_details")
    .select("details_id")
    .eq("stud_id", studId)
    .maybeSingle();
  if (existing) {
    const { data, error } = await supabase
      .from("stud_details")
      .update({
        student_email: studentEmail,
        personal_email: personalEmail,
        course_field: courseField,
        cell_no: cellNo,
      })
      .eq("stud_id", studId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("stud_details")
    .insert({
      stud_id: studId,
      student_email: studentEmail,
      personal_email: personalEmail,
      course_field: courseField,
      cell_no: cellNo,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listSkills(studId) {
  const { data, error } = await supabase
    .from("stud_skill_map")
    .select("*")
    .eq("stud_id", studId)
    .order("skill_name");
  if (error) throw error;
  return data;
}

export async function addSkill(studId, skillName) {
  const { data, error } = await supabase
    .from("stud_skill_map")
    .insert({ stud_id: studId, skill_name: skillName })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSkill(mapId) {
  const { error } = await supabase
    .from("stud_skill_map")
    .delete()
    .eq("map_id", mapId);
  if (error) throw error;
}

export async function getStudentDocs(studId) {
  const { data, error } = await supabase
    .from("stud_docs")
    .select("*")
    .eq("stud_id", studId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listApplications(studId) {
  const { data, error } = await supabase
    .from("student_app")
    .select(
      "app_id, status, date_applied, wil_program(program_id, program_name, program_field, comp_id, company(comp_name))",
    )
    .eq("stud_id", studId)
    .order("date_applied", { ascending: false });
  if (error) throw error;
  return data;
}

export async function applyToProgram(studId, programId) {
  const { data, error } = await supabase
    .from("student_app")
    .insert({ stud_id: studId, program_id: programId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStudentProfile(studId) {
  const res = await fetch(`/api/students/${studId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete profile");
  return await res.json();
}
