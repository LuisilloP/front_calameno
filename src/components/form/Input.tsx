"use client";

import React from "react";

interface InputProps {
  id?: string;
  name?: string;
  label?: string;
  value?: string;
  type?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  name,
  label,
  value = "",
  type = "text",
  placeholder,
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
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        required={required}
        className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900"
      />
    </div>
  );
};

export default Input;
