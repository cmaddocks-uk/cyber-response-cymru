// Shared form-field components for the Plan Builder. Mirrors the v1.x
// `field()` helper output: label + optional hint + input. Sections pass
// `value` + `onChange` explicitly so each section subscribes to the store
// once at the top, not per field.

import type { ReactNode } from 'react';

interface BaseFieldProps {
  label: string;
  hint?: string;
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'date';
  placeholder?: string;
}

export function TextField({ label, hint, value, onChange, type = 'text', placeholder }: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({ label, hint, value, onChange, placeholder, rows }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
      />
    </FieldShell>
  );
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** First option should be the empty / "— select —" placeholder if needed. */
  options: string[];
}

export function SelectField({ label, hint, value, onChange, options }: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === '' ? '— select —' : opt}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function FieldShell({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mb-3.5 block">
      <span className="mb-1 block text-sm font-semibold text-navy-2">{label}</span>
      <span className="mb-1.5 block min-h-[16px] text-xs text-muted">{hint ?? ' '}</span>
      {children}
    </label>
  );
}

/** Two-column field grid that collapses to one column on narrow viewports. */
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 items-start gap-x-3.5 md:grid-cols-2">{children}</div>;
}
