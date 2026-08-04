import React from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_TABLES } from '../../api/admin.js';
import { Card, SectionHeading } from '../../components/ui.jsx';

export default function AdminOverview() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <SectionHeading eyebrow="Admin" title="Overview" subtitle="Full CRUD access to every table in the schema." />
      <div className="stagger grid gap-3 sm:grid-cols-2">
        {Object.entries(ADMIN_TABLES).map(([table, meta]) => (
          <Link key={table} to={`/admin/table/${table}`}>
            <Card className="animate-fadeUp transition-colors hover:border-tut-red/60">
              <p className="font-display text-sm font-semibold text-white">{meta.label}</p>
              <p className="mt-1 text-xs text-white/40">{table}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
