"use client";

import React from "react";

interface DateInputProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (v: string) => void;
  required?: boolean;
  className?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  name,
  label,
  value = "",
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
      <input
        id={id || name}
        name={name}
        type="date"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        required={required}
        className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--foreground))] shadow-sm transition focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
      />
    </div>
  );
};

export default DateInput;
