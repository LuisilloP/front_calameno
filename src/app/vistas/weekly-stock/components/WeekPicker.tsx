"use client";

import React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getMonday, formatDate, parseDate } from "../utils";

interface WeekPickerProps {
  selectedWeek: string;
  onChange: (weekStart: string) => void;
}

export const WeekPicker: React.FC<WeekPickerProps> = ({
  selectedWeek,
  onChange,
}) => {
  const currentDate = parseDate(selectedWeek);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    onChange(formatDate(getMonday(prev)));
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    onChange(formatDate(getMonday(next)));
  };

  const handleToday = () => {
    onChange(formatDate(getMonday(new Date())));
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(`${e.target.value}T00:00:00`);
    onChange(formatDate(getMonday(selectedDate)));
  };

  const weekEnd = new Date(currentDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDateShort = (date: Date) =>
    date.toLocaleDateString("es", { day: "2-digit", month: "short" });

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrevWeek}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-3 text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))]"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-[200px] rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-3 text-center shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[hsl(var(--muted))]">
            Intervalo
          </p>
          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {formatDateShort(currentDate)} - {formatDateShort(weekEnd)}
          </p>
        </div>

        <button
          onClick={handleNextWeek}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-3 text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))]"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-4 py-2 text-sm text-[hsl(var(--muted))]">
          <CalendarDays className="h-4 w-4 text-[hsl(var(--muted))]" />
          <input
            type="date"
            value={selectedWeek}
            onChange={handleDateInput}
            className="flex-1 bg-transparent text-xs text-[hsl(var(--foreground))] outline-none"
          />
        </label>

        <button
          onClick={handleToday}
          className="rounded-2xl border border-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.12)] px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:bg-[hsla(var(--accent)/0.2)]"
        >
          Semana actual
        </button>
      </div>
    </div>
  );
};
