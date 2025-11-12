const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toUtcDate = (value: string): Date => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    const [year, month, day] = value.split("-").map(Number);
    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      Number.isFinite(day)
    ) {
      return new Date(Date.UTC(year, month - 1, day));
    }
    throw new Error("Fecha invalida");
  }
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
};

const formatIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

export const normalizeToMonday = (date: Date): Date => {
  const cloned = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = cloned.getUTCDay(); // 0 sunday ... 6 saturday
  const diff = (day + 6) % 7; // monday ->0, tuesday ->1, ...
  cloned.setUTCDate(cloned.getUTCDate() - diff);
  return cloned;
};

export const normalizeIsoToMonday = (value: string): string => {
  const date = toUtcDate(value);
  return formatIsoDate(normalizeToMonday(date));
};

export const getCurrentWeekStartISO = (): string => {
  return formatIsoDate(normalizeToMonday(new Date()));
};

export const getWeekDates = (weekStartIso: string) => {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
  });
  const startDate = toUtcDate(weekStartIso);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(startDate.getTime() + index * MS_PER_DAY);
    const [weekdayLabel, dayLabel] = formatter
      .format(current)
      .replace(".", "")
      .split(" ");
    return {
      iso: formatIsoDate(current),
      label: `${weekdayLabel ?? ""} ${dayLabel ?? ""}`.trim(),
      weekday: weekdayLabel?.trim().toLowerCase() ?? "",
    };
  });
};
