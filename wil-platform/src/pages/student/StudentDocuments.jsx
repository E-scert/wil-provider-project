import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getStudentDocs } from '../../api/students.js';
import { uploadStudentDocument, getSignedDocUrl } from '../../api/storage.js';
import { Card, SectionHeading, Button, Spinner } from '../../components/ui.jsx';

const DOC_TYPES = [
  { key: 'id', label: 'ID Document', pathField: 'id_doc_path' },
  { key: 'wil', label: 'WIL Letter', pathField: 'wil_doc_path' },
  { key: 'academic', label: 'Academic Record', pathField: 'academic_doc_path' },
];

export default function StudentDocuments() {
  const { profile } = useAuth();
  const toast = useToast();
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);

  useEffect(() => {
    if (!profile) return;
    getStudentDocs(profile.stud_id)
      .then(setDocs)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [profile?.stud_id]); // eslint-disable-line

  async function handleUpload(docType, file) {
    if (!file) return;
    setUploadingKey(docType);
    try {
      await uploadStudentDocument(profile.stud_id, docType, file);
      const refreshed = await getStudentDocs(profile.stud_id);
      setDocs(refreshed);
      toast.success('Document uploaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleView(path) {
    try {
      const url = await getSignedDocUrl(path);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <SectionHeading
        eyebrow="Student"
        title="Documents"
        subtitle="Upload your ID, WIL letter, and academic record. Files are stored privately in the student-vault bucket."
      />

      {loading ? (
        <Spinner />
      ) : (
        <div className="stagger flex flex-col gap-4">
          {DOC_TYPES.map((doc) => {
            const path = docs?.[doc.pathField];
            return (
              <Card key={doc.key} className="animate-fadeUp flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-white">{doc.label}</p>
                  <p className="text-xs text-white/40">{path ? 'Uploaded' : 'Not uploaded yet'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {path && (
                    <Button variant="ghost" onClick={() => handleView(path)}>View</Button>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleUpload(doc.key, e.target.files?.[0])}
                    />
                    <span className="inline-flex items-center justify-center rounded-md bg-tut-red px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 hover:shadow-redGlow">
                      {uploadingKey === doc.key ? 'Uploading…' : path ? 'Replace' : 'Upload'}
                    </span>
                  </label>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
