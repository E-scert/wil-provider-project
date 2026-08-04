import { supabase } from '../lib/supabaseClient.js';

const BUCKET = 'student-vault';

/**
 * Uploads a document for a student into documents/{studentId}/{docType}-{filename}.
 * docType is one of 'id' | 'wil' | 'academic', used only to make the storage path
 * self-describing — the actual stud_docs row update is a separate step (see below),
 * since the schema's auto_link_student_docs trigger (attached to stud_docs, not
 * storage.objects) references a `NEW.name` column that doesn't exist on stud_docs
 * and will error if relied upon. This app updates stud_docs directly instead.
 */
export async function uploadStudentDocument(studentId, docType, file) {
  const path = `documents/${studentId}/${docType}-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const column = docType === 'id' ? 'id_doc_path' : docType === 'wil' ? 'wil_doc_path' : 'academic_doc_path';

  const { data: existing } = await supabase.from('stud_docs').select('docs_id').eq('stud_id', studentId).maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('stud_docs')
      .update({ [column]: path, updated_at: new Date().toISOString() })
      .eq('stud_id', studentId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('stud_docs').insert({ stud_id: studentId, [column]: path });
    if (error) throw error;
  }

  return path;
}

/** Generates a short-lived signed URL so a student/company can view a private document. */
export async function getSignedDocUrl(path, expiresInSeconds = 300) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
