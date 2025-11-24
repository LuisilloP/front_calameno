"use client";

import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  options: Option[];
  onChange?: (v: string) => void;
  required?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  id,
  name,
  label,
  value,
  options,
  onChange,
  required = false,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="text-sm font-semibold text-[hsl(var(--muted-strong))]"
        >
          {label} {required ? <span className="text-[hsl(var(--danger))]">*</span> : null}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-base text-[hsl(var(--foreground))] shadow-sm transition focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
      >
        <option value="">Seleccionar...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
