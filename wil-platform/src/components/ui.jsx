import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-tut-line bg-tut-panel/80 p-5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] ${className}`}>
      {children}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-white/55 font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-white/30">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`rounded-md border border-tut-line bg-tut-black px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-tut-red ${props.className || ''}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`rounded-md border border-tut-line bg-tut-black px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-tut-red ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`rounded-md border border-tut-line bg-tut-black px-3 py-2 text-sm text-white outline-none transition-colors focus:border-tut-red ${props.className || ''}`}
    />
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-tut-red text-white hover:bg-red-600 hover:shadow-redGlow active:scale-[0.97]',
    ghost: 'border border-tut-line text-white/80 hover:border-tut-red/60 hover:text-white active:scale-[0.97]',
    gold: 'bg-tut-gold text-black hover:brightness-95 active:scale-[0.97]',
    danger: 'border border-tut-red/60 text-red-300 hover:bg-tut-red/10 active:scale-[0.97]',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-tut-line text-white/60',
    pending: 'border-amber-500/40 text-amber-300',
    accepted: 'border-emerald-500/40 text-emerald-300',
    rejected: 'border-tut-red/50 text-red-300',
    reviewed: 'border-sky-500/40 text-sky-300',
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-6 animate-fadeUp">
      {eyebrow && <p className="mb-1 font-mono text-xs uppercase tracking-widest text-tut-red">{eyebrow}</p>}
      <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-white/50">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="animate-fadeUp rounded-xl border border-dashed border-tut-line py-14 text-center">
      <p className="font-display text-base text-white/70">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-white/40">{subtitle}</p>}
    </div>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/40">
      <span className="h-2 w-2 animate-pulse rounded-full bg-tut-red" />
      {label}
    </div>
  );
}
