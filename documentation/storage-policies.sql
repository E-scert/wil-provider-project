-- =====================================================================
-- STORAGE SETUP — student-vault bucket + access policies.
--
-- Run in the Supabase SQL editor (or create the bucket via
-- Dashboard > Storage > New bucket, named exactly "student-vault",
-- set to Private, then run just the two `CREATE POLICY` statements
-- below against `storage.objects`).
--
-- Path convention used by this app (src/api/storage.js):
--   documents/{stud_id}/{docType}-{timestamp}-{filename}
--
-- Note the folder segment is the student's `stud_id` (the app-level
-- profile id), not their Supabase auth uid — so the policies below
-- resolve stud_id -> auth.uid() via the `student` table, same pattern
-- used throughout recommended-fixes.sql.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('student-vault', 'student-vault', false)
on conflict (id) do nothing;

-- Students can upload into their own folder
CREATE POLICY "Students can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-vault'
  AND (storage.foldername(name))[1] = 'documents'
  AND (storage.foldername(name))[2] IN (
    SELECT stud_id::text FROM student WHERE user_id = auth.uid()
  )
);

-- Students can read (and therefore generate signed URLs for) their own documents
CREATE POLICY "Students can read own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-vault'
  AND (storage.foldername(name))[1] = 'documents'
  AND (storage.foldername(name))[2] IN (
    SELECT stud_id::text FROM student WHERE user_id = auth.uid()
  )
);

-- Students can replace/delete their own documents
CREATE POLICY "Students can manage own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'student-vault'
  AND (storage.foldername(name))[2] IN (SELECT stud_id::text FROM student WHERE user_id = auth.uid())
)
WITH CHECK (
  bucket_id = 'student-vault'
  AND (storage.foldername(name))[2] IN (SELECT stud_id::text FROM student WHERE user_id = auth.uid())
);

CREATE POLICY "Students can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-vault'
  AND (storage.foldername(name))[2] IN (SELECT stud_id::text FROM student WHERE user_id = auth.uid())
);
