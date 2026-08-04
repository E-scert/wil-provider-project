import { supabase } from '../lib/supabaseClient.js';

export async function getCompanyByUserId(userId) {
  const { data, error } = await supabase.from('company').select('*').eq('user_id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateCompanyProfile(compId, { compName, compEmail, compDescription }) {
  const { data, error } = await supabase
    .from('company')
    .update({ comp_name: compName, comp_email: compEmail, comp_description: compDescription })
    .eq('comp_id', compId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCompanyAddress(compId) {
  const { data, error } = await supabase.from('company_address').select('*').eq('comp_id', compId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertCompanyAddress(compId, address) {
  const payload = {
    comp_id: compId,
    recipient_name: address.recipientName || null,
    building_street_name: address.buildingStreetName,
    unit: address.unit || null,
    suburb: address.suburb || null,
    city: address.city,
    postal_code: address.postalCode,
    country: address.country,
  };
  const { data: existing } = await supabase.from('company_address').select('address_id').eq('comp_id', compId).maybeSingle();
  if (existing) {
    const { data, error } = await supabase
      .from('company_address')
      .update(payload)
      .eq('address_id', existing.address_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('company_address').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function listCompanyPrograms(compId) {
  const { data, error } = await supabase
    .from('wil_program')
    .select('*')
    .eq('comp_id', compId)
    .order('date_created', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProgram(compId, program) {
  const { data, error } = await supabase
    .from('wil_program')
    .insert({
      comp_id: compId,
      program_name: program.programName,
      program_desc: program.programDesc || null,
      duration_months: Number(program.durationMonths),
      program_field: program.programField,
      open_date: program.openDate,
      close_date: program.closeDate,
      slots_open: Number(program.slotsOpen),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listApplicantsForCompany(compId) {
  const { data, error } = await supabase
    .from('student_app')
    .select('app_id, status, date_applied, wil_program!inner(program_id, program_name, comp_id), student(stud_id, name, surname)')
    .eq('wil_program.comp_id', compId)
    .order('date_applied', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(appId, status) {
  const { data, error } = await supabase.from('student_app').update({ status }).eq('app_id', appId).select().single();
  if (error) throw error;
  return data;
}
