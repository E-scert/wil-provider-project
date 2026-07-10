import { createClient } from '@supabase/supabase-js'

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

async function handleStudentDocumentUpload(studentId, idFile, wilFile, academicFile) {
  try {
    // 1. Upload ID PDF into the student's unique folder
    await supabase.storage
      .from('student-vault')
      .upload(documents/${studentId}/id_doc.pdf, idFile, { upsert: true })

    // 2. Upload WIL PDF
    await supabase.storage
      .from('student-vault')
      .upload(documents/${studentId}/wil_doc.pdf, wilFile, { upsert: true })

    // 3. Upload Academic PDF
    await supabase.storage
      .from('student-vault')
      .upload(documents/${studentId}/academic_doc.pdf, academicFile, { upsert: true })

    console.log("All documents uploaded successfully. Database linked via Postgres trigger.")
  } catch (error) {
    console.error("Upload failed:", error)
  }
}