import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS_BY_ROLE = {
  student: [
    { to: '/student', label: 'Dashboard', end: true },
    { to: '/student/matches', label: 'Matches' },
    { to: '/student/applications', label: 'Applications' },
    { to: '/student/placements', label: 'Placement' },
    { to: '/programs', label: 'Browse Programs' },
  ],
  company_admin: [
    { to: '/company', label: 'Dashboard', end: true },
    { to: '/company/programs', label: 'Programs' },
    { to: '/company/applicants', label: 'Applicants' },
    { to: '/company/placements', label: 'Placements' },
  ],
  institution_admin: [
    { to: '/institution', label: 'Overview', end: true },
    { to: '/institution/students', label: 'Students' },
    { to: '/institution/programs', label: 'Postings' },
    { to: '/institution/matches', label: 'Matches' },
    { to: '/institution/placements', label: 'Placements' },
    { to: '/institution/reports', label: 'Reports' },
  ],
  super_admin: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/companies', label: 'Companies' },
    { to: '/admin/institutions', label: 'Institutions' },
    { to: '/admin/users', label: 'Users' },
  ],
};

const ROLE_LABEL = {
  student: 'Student',
  company_admin: 'Company',
  institution_admin: 'Institution',
  super_admin: 'Super Admin',
};

export default function Navbar() {
  const { user, entity, role, logout } = useAuth();
  const navigate = useNavigate();
  const links = LINKS_BY_ROLE[role] || [];

  const displayName = entity?.name || user?.email;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hub-line/80 bg-hub-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-hub-emerald shadow-glowGreen" />
          <span className="font-display text-lg font-semibold tracking-tight text-hub-ink">
            WIL<span className="text-hub-indigo">HUB</span>
          </span>
        </div>

        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                [
                  'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-200',
                  isActive ? 'bg-hub-indigo/15 text-white' : 'text-hub-muted hover:text-hub-ink hover:bg-hub-panel2',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-hub-line bg-hub-panel px-3 py-1.5 text-xs text-hub-muted sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-hub-emerald" />
            {displayName} · <span className="text-hub-indigo">{ROLE_LABEL[role]}</span>
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full border border-hub-line px-3 py-1.5 text-xs text-hub-muted transition-colors hover:border-hub-indigo/60 hover:text-hub-ink"
          >
            Log out
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-hub-line/70 px-4 py-2 md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              ['whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium', isActive ? 'bg-hub-indigo/15 text-white' : 'text-hub-muted'].join(' ')
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
