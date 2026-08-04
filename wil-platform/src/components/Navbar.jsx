import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { signOut } from '../api/auth.js';
import { useToast } from '../context/ToastContext.jsx';

const LINKS_BY_ROLE = {
  student: [
    { to: '/student', label: 'Dashboard', end: true },
    { to: '/student/documents', label: 'Documents' },
    { to: '/student/applications', label: 'Applications' },
    { to: '/programs', label: 'Browse Programs' },
  ],
  company: [
    { to: '/company', label: 'Dashboard', end: true },
    { to: '/company/programs', label: 'Programs' },
    { to: '/company/applicants', label: 'Applicants' },
  ],
  admin: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/table/users', label: 'Users' },
    { to: '/admin/table/company', label: 'Companies' },
    { to: '/admin/table/wil_program', label: 'Programs' },
    { to: '/admin/table/student_app', label: 'Applications' },
  ],
};

export default function Navbar() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const links = LINKS_BY_ROLE[role] || [];

  async function handleLogout() {
    try {
      await signOut();
      toast.success('Logged out.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-tut-line/80 bg-tut-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-tut-red shadow-redGlow" />
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            WIL CONNECT<span className="text-tut-red">.</span>
          </span>
        </div>

        <nav className="hidden gap-1 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                [
                  'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-200',
                  isActive ? 'bg-tut-red/15 text-white' : 'text-white/60 hover:text-white hover:bg-tut-panel',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-tut-line bg-tut-panel px-3 py-1.5 text-xs text-white/60 sm:inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {user?.email} · <span className="text-tut-gold">{role}</span>
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-tut-line px-3 py-1.5 text-xs text-white/50 transition-colors hover:border-tut-red/60 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-tut-line/70 px-4 py-2 sm:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              ['whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium', isActive ? 'bg-tut-red/15 text-white' : 'text-white/60'].join(' ')
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
