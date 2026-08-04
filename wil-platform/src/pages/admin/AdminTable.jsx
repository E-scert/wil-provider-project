import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ADMIN_TABLES, listRows, updateRow, deleteRow } from '../../api/admin.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card, SectionHeading, Spinner, EmptyState, Button, Input } from '../../components/ui.jsx';

export default function AdminTable() {
  const { table } = useParams();
  const toast = useToast();
  const meta = ADMIN_TABLES[table];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    listRows(table)
      .then(setRows)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [table]); // eslint-disable-line

  if (!meta) return <Navigate to="/admin" replace />;

  function startEdit(row) {
    setEditingId(row[meta.idKey]);
    const initial = {};
    meta.editable.forEach((col) => { initial[col] = row[col] ?? ''; });
    setEditValues(initial);
  }

  async function saveEdit(row) {
    const id = row[meta.idKey];
    setBusyId(id);
    try {
      await updateRow(table, meta.idKey, id, editValues);
      toast.success('Row updated.');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(row) {
    const id = row[meta.idKey];
    if (!confirm(`Delete this row from ${meta.label}? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await deleteRow(table, meta.idKey, id);
      toast.success('Row deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <SectionHeading eyebrow="Admin" title={meta.label} subtitle={`${rows.length} row(s) · table: ${table}`} />

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState title="No rows found" />
      ) : (
        <div className="overflow-x-auto">
          <Card className="animate-riseIn !p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-tut-line text-xs uppercase tracking-wide text-white/40">
                  {meta.columns.map((col) => (
                    <th key={col} className="px-4 py-3 font-medium">{col}</th>
                  ))}
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = row[meta.idKey];
                  const isEditing = editingId === id;
                  return (
                    <tr key={id} className="border-b border-tut-line/60 last:border-0">
                      {meta.columns.map((col) => (
                        <td key={col} className="px-4 py-3 align-top text-white/75">
                          {isEditing && meta.editable.includes(col) ? (
                            <Input
                              value={editValues[col]}
                              onChange={(e) => setEditValues((v) => ({ ...v, [col]: e.target.value }))}
                              className="py-1"
                            />
                          ) : (
                            <span className="font-mono text-xs">{String(row[col] ?? '—')}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button onClick={() => saveEdit(row)} disabled={busyId === id}>Save</Button>
                            <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {meta.editable.length > 0 && (
                              <Button variant="ghost" onClick={() => startEdit(row)}>Edit</Button>
                            )}
                            <Button variant="danger" onClick={() => handleDelete(row)} disabled={busyId === id}>Delete</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
