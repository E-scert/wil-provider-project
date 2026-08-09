import React, { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import { listUsers } from '../../api/admin.js';
import { Card, SectionHeading, Spinner, EmptyState, Badge } from '../../components/ui.jsx';

const ROLE_TONE = { student: 'default', company_admin: 'indigo', institution_admin: 'emerald', super_admin: 'amber' };

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading eyebrow="Super Admin" title="Accounts" subtitle="Every login on the platform, across all roles." />

      {loading ? (
        <Spinner />
      ) : (
        <Card className="!p-0 animate-riseIn overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hub-line text-xs uppercase tracking-wide text-hub-muted">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b border-hub-line/60 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-hub-ink/80">{u.email}</td>
                  <td className="px-4 py-3"><Badge tone={ROLE_TONE[u.role] || 'default'}>{u.role.replace('_', ' ')}</Badge></td>
                  <td className="px-4 py-3 text-xs text-hub-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="p-6"><EmptyState title="No users yet" /></div>}
        </Card>
      )}
    </div>
  );
}
