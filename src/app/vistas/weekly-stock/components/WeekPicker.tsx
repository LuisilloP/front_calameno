"use client";

import React from 'react';
import { getMonday, formatDate, parseDate } from '../utils';

interface WeekPickerProps {
  selectedWeek: string; // YYYY-MM-DD (lunes)
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
    const selectedDate = new Date(e.target.value + 'T00:00:00');
    onChange(formatDate(getMonday(selectedDate)));
  };

  // Calcular rango de la semana
  const weekEnd = new Date(currentDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('es', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevWeek}
          className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
          aria-label="Semana anterior"
        >
          ←
        </button>
        
        <div className="flex flex-col items-center gap-1 min-w-[180px]">
          <div className="text-sm font-semibold text-foreground">
            {formatDateShort(currentDate)} - {formatDateShort(weekEnd)}
          </div>
          <input
            type="date"
            value={selectedWeek}
            onChange={handleDateInput}
            className="text-xs px-2 py-1 rounded bg-muted border border-border text-foreground cursor-pointer"
          />
        </div>

        <button
          onClick={handleNextWeek}
          className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
          aria-label="Semana siguiente"
        >
          →
        </button>
      </div>

      <button
        onClick={handleToday}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        Semana actual
      </button>
    </div>
  );
};
