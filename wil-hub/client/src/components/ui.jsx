import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-hub-line bg-hub-panel/80 p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] ${className}`}>
      {children}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-hub-muted font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-hub-muted/70">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`rounded-md border border-hub-line bg-hub-bg px-3 py-2 text-sm text-hub-ink placeholder:text-hub-muted/50 outline-none transition-colors focus:border-hub-indigo ${props.className || ''}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`rounded-md border border-hub-line bg-hub-bg px-3 py-2 text-sm text-hub-ink placeholder:text-hub-muted/50 outline-none transition-colors focus:border-hub-indigo ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`rounded-md border border-hub-line bg-hub-bg px-3 py-2 text-sm text-hub-ink outline-none transition-colors focus:border-hub-indigo ${props.className || ''}`}
    />
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-hub-indigo text-white hover:brightness-110 hover:shadow-glow active:scale-[0.97]',
    emerald: 'bg-hub-emerald text-hub-bg hover:brightness-110 hover:shadow-glowGreen active:scale-[0.97]',
    ghost: 'border border-hub-line text-hub-ink/80 hover:border-hub-indigo/60 hover:text-white active:scale-[0.97]',
    danger: 'border border-hub-rose/50 text-rose-300 hover:bg-hub-rose/10 active:scale-[0.97]',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-hub-line text-hub-muted',
    pending: 'border-hub-amber/40 text-amber-300',
    approved: 'border-hub-emerald/40 text-emerald-300',
    verified: 'border-hub-emerald/40 text-emerald-300',
    provisional: 'border-hub-amber/40 text-amber-300',
    rejected: 'border-hub-rose/40 text-rose-300',
    closed: 'border-hub-line text-hub-muted',
    ongoing: 'border-hub-indigo/40 text-indigo-300',
    completed: 'border-hub-emerald/40 text-emerald-300',
    failed: 'border-hub-rose/40 text-rose-300',
    selected: 'border-hub-emerald/40 text-emerald-300',
    shortlisted: 'border-sky-500/40 text-sky-300',
    indigo: 'border-hub-indigo/40 text-indigo-300',
    amber: 'border-hub-amber/40 text-amber-300',
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-6 flex animate-fadeUp items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 font-mono text-xs uppercase tracking-widest text-hub-indigo">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-semibold text-hub-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-hub-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="animate-fadeUp rounded-xl border border-dashed border-hub-line py-14 text-center">
      <p className="font-display text-base text-hub-ink/70">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-hub-muted">{subtitle}</p>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-hub-muted">
      <span className="h-2 w-2 animate-pulse rounded-full bg-hub-indigo" />
      {label}
    </div>
  );
}

export function StatCard({ label, value, tone = 'indigo' }) {
  const tones = { indigo: 'text-hub-indigo', emerald: 'text-hub-emerald', amber: 'text-hub-amber' };
  return (
    <Card className="animate-fadeUp">
      <p className="font-mono text-xs uppercase tracking-widest text-hub-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold tabular ${tones[tone]}`}>{value}</p>
    </Card>
  );
}

export function SkillChips({ skills = [] }) {
  if (!skills.length) return <span className="text-xs text-hub-muted">No skills listed</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <span key={s} className="rounded-full border border-hub-line bg-hub-bg px-2 py-0.5 text-xs text-hub-ink/75">
          {s}
        </span>
      ))}
    </div>
  );
}
