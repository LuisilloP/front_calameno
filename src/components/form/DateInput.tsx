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
          className="text-sm font-medium text-gray-700"
        >
          {label} {required ? <span className="text-red-500">*</span> : null}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type="date"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        required={required}
        className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900"
      />
    </div>
  );
};

export default DateInput;
