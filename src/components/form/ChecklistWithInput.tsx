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
    onChange?.(Object.keys(next).filter((k) => next[k]), inputs);
  };

  const onInput = (id: string, value: string) => {
    const nextInputs = { ...inputs, [id]: value };
    setInputs(nextInputs);
    onChange?.(Object.keys(checked).filter((k) => checked[k]), nextInputs);
  };

  return (
    <div className={className}>
      {items.map((it) => (
        <div key={it.id} className="mb-3 flex items-start gap-3">
          <div>
            <input
              id={it.id}
              type="checkbox"
              checked={!!checked[it.id]}
              onChange={() => toggle(it.id)}
              className="mt-1 h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--accent))] focus:ring-0"
            />
          </div>
          <div className="flex-1">
            <label
              htmlFor={it.id}
              className="text-sm font-semibold text-[hsl(var(--muted-strong))]"
            >
              {it.label}
            </label>
            {it.hasInput && checked[it.id] && (
              <div className="mt-2">
                <input
                  type="text"
                  value={inputs[it.id] || ""}
                  onChange={(e) => onInput(it.id, e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-[hsl(var(--foreground))] shadow-sm transition focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
                  placeholder="Escribe aqui..."
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
