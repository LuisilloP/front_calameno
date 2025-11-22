import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { normalizeIsoToMonday } from "../utils/date";

type WeekPickerProps = {
  weekStart: string;
  onWeekChange: (nextWeekStart: string) => void;
};

const shiftWeek = (isoDate: string, offsetDays: number) => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return normalizeIsoToMonday(date.toISOString());
};

const formatRange = (weekStart: string) => {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  });
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

export const WeekPicker = ({ weekStart, onWeekChange }: WeekPickerProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-4 shadow-sm shadow-black/5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-strong))]">
            Semana
          </p>
          <p className="text-base font-semibold text-[hsl(var(--foreground))]">
            {formatRange(weekStart)}
          </p>
        </div>
        <CalendarIcon
          className="text-[hsl(var(--muted))]"
          size={20}
          aria-hidden
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Semana anterior"
          onClick={() => onWeekChange(shiftWeek(weekStart, -7))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
        >
          <ChevronLeftIcon size={18} />
        </button>
        <input
          type="date"
          value={weekStart}
          onChange={(event) => {
            if (!event.target.value) return;
            onWeekChange(normalizeIsoToMonday(event.target.value));
          }}
          className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
        />
        <button
          type="button"
          aria-label="Semana siguiente"
          onClick={() => onWeekChange(shiftWeek(weekStart, 7))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>
    </div>
  );
};
