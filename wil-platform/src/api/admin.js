import { supabase } from '../lib/supabaseClient.js';

/**
 * Table registry for the admin dashboard's generic data-table UI.
 * `idKey` is each table's primary key column, `columns` drives which fields
 * render as editable inputs (kept intentionally close to the schema — no
 * invented columns).
 */
export const ADMIN_TABLES = {
  users: { label: 'Users', idKey: 'user_id', columns: ['user_id', 'user_type', 'date_created'], editable: ['user_type'] },
  student: { label: 'Students', idKey: 'stud_id', columns: ['stud_id', 'user_id', 'name', 'surname', 'sex', 'age'], editable: ['name', 'surname', 'sex', 'age'] },
  stud_details: { label: 'Student Details', idKey: 'details_id', columns: ['details_id', 'stud_id', 'student_email', 'personal_email', 'course_field', 'cell_no'], editable: ['personal_email', 'course_field', 'cell_no'] },
  stud_docs: { label: 'Student Documents', idKey: 'docs_id', columns: ['docs_id', 'stud_id', 'id_doc_path', 'wil_doc_path', 'academic_doc_path', 'updated_at'], editable: [] },
  stud_skill_map: { label: 'Student Skills', idKey: 'map_id', columns: ['map_id', 'stud_id', 'skill_name'], editable: ['skill_name'] },
  company: { label: 'Companies', idKey: 'comp_id', columns: ['comp_id', 'user_id', 'comp_name', 'comp_email', 'comp_description'], editable: ['comp_name', 'comp_email', 'comp_description'] },
  company_address: { label: 'Company Addresses', idKey: 'address_id', columns: ['address_id', 'comp_id', 'city', 'postal_code', 'country'], editable: ['city', 'postal_code', 'country'] },
  wil_program: { label: 'WIL Programs', idKey: 'program_id', columns: ['program_id', 'comp_id', 'program_name', 'program_field', 'duration_months', 'slots_open', 'open_date', 'close_date'], editable: ['program_name', 'program_field', 'duration_months', 'slots_open', 'open_date', 'close_date'] },
  student_app: { label: 'Applications', idKey: 'app_id', columns: ['app_id', 'stud_id', 'program_id', 'status', 'date_applied'], editable: ['status'] },
};

export async function listRows(table) {
  const { data, error } = await supabase.from(table).select('*').limit(200);
  if (error) throw error;
  return data;
}

export async function updateRow(table, idKey, idValue, patch) {
  const { data, error } = await supabase.from(table).update(patch).eq(idKey, idValue).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table, idKey, idValue) {
  const { error } = await supabase.from(table).delete().eq(idKey, idValue);
  if (error) throw error;
}
