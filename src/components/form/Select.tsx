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
          className="text-sm font-medium text-gray-700"
        >
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
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
