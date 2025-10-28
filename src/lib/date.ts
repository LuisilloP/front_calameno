import { format as formatDateFns, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(value?: string | Date | null, pattern = "dd/MM/yyyy") {
  if (!value) return "";
  const date = value instanceof Date ? value : parseISO(value);
  return formatDateFns(date, pattern, { locale: es });
}

export function formatDateTime(value?: string | Date | null) {
  return formatDate(value, "dd/MM/yyyy HH:mm");
}

export function toIsoDate(value: Date): string {
  return value.toISOString();
}
