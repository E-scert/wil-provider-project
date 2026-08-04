import { supabase } from '../lib/supabaseClient.js';

/** Public listing of open WIL programs, newest first. */
export async function listOpenPrograms() {
  const { data, error } = await supabase
    .from('wil_program')
    .select('program_id, program_name, program_desc, duration_months, program_field, open_date, close_date, slots_open, comp_id, company(comp_name)')
    .gt('slots_open', 0)
    .order('date_created', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProgram(programId) {
  const { data, error } = await supabase
    .from('wil_program')
    .select('*, company(comp_name, comp_description)')
    .eq('program_id', programId)
    .single();
  if (error) throw error;
  return data;
}
