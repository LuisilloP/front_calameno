/**
 * Utilidades para manejo de fechas y datos de stock semanal
 */
import { DayName } from './types';

/**
 * Obtiene el lunes de la semana de una fecha dada
 */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Formatea fecha a YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatWeekRange(startIso: string): string {
  const start = parseDate(startIso);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const formatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

/**
 * Parsea fecha desde YYYY-MM-DD
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Obtiene el nombre del día en español
 */
export function getDayLabel(dayName: DayName): string {
  const labels: Record<DayName, string> = {
    monday: 'Lun',
    tuesday: 'Mar',
    wednesday: 'Mié',
    thursday: 'Jue',
    friday: 'Vie',
    saturday: 'Sáb',
    sunday: 'Dom',
  };
  return labels[dayName];
}

/**
 * Lista de días de la semana
 */
export const WEEK_DAYS: DayName[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

/**
 * Determina el color de una celda según umbrales de stock
 */
export function getStockColor(value: number, thresholds = { high: 100, low: 20 }): string {
  if (value >= thresholds.high) {
    return "bg-[hsla(var(--success)/0.15)] text-[hsl(var(--success))]";
  }
  if (value >= thresholds.low) {
    return "bg-[hsla(var(--accent)/0.15)] text-[hsl(var(--accent))]";
  }
  return "bg-[hsla(var(--danger)/0.15)] text-[hsl(var(--danger))]";
}

/**
 * Formatea número con signo para movimientos
 */
export function formatMovement(value: number | null): string {
  if (value === null) return '-';
  if (value === 0) return '0';
  return value > 0 ? `+${value}` : `${value}`;
}

/**
 * Suma todos los movimientos de la semana
 */
export function sumWeekMovements(movements: Record<DayName, number | null>): number {
  return WEEK_DAYS.reduce((sum, day) => {
    const value = movements[day];
    return sum + (value !== null ? value : 0);
  }, 0);
}
