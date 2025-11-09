"use client";

import React, { useState } from "react";

interface Item {
  id: string;
  label: string;
  hasInput?: boolean;
}

interface ChecklistWithInputProps {
  items: Item[];
  onChange?: (checked: string[], inputs: Record<string, string>) => void;
  className?: string;
}

export const ChecklistWithInput: React.FC<ChecklistWithInputProps> = ({
  items,
  onChange,
  className = "",
}) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    onChange &&
      onChange(
        Object.keys(next).filter((k) => next[k]),
        inputs
      );
  };

  const onInput = (id: string, value: string) => {
    const nextInputs = { ...inputs, [id]: value };
    setInputs(nextInputs);
    onChange &&
      onChange(
        Object.keys(checked).filter((k) => checked[k]),
        nextInputs
      );
  };

  return (
    <div className={className}>
      {items.map((it) => (
        <div key={it.id} className="flex items-start gap-3 mb-3">
          <div>
            <input
              id={it.id}
              type="checkbox"
              checked={!!checked[it.id]}
              onChange={() => toggle(it.id)}
              className="mt-1 h-4 w-4 text-stone-900 rounded border-gray-300 focus:ring-0"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor={it.id}
              className="text-sm font-medium text-gray-700"
            >
              {it.label}
            </label>
            {it.hasInput && checked[it.id] && (
              <div className="mt-2">
                <input
                  type="text"
                  value={inputs[it.id] || ""}
                  onChange={(e) => onInput(it.id, e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  placeholder="Escribe aquí..."
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChecklistWithInput;
