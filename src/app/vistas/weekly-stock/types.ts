/**
 * Tipos para vistas de stock semanal
 */

export type DayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DailyMovements {
  monday: number | null;
  tuesday: number | null;
  wednesday: number | null;
  thursday: number | null;
  friday: number | null;
  saturday: number | null;
  sunday: number | null;
}

export interface WeeklyProduct {
  id: number;
  name: string;
  brand?: string | null;
  supplier?: string | null;
  initial_stock: number;
  daily_movements: DailyMovements;
  final_stock_realtime: number;
}

export interface WeeklyCategory {
  category_id: number;
  category_name: string;
  products: WeeklyProduct[];
}

export interface WeeklyStockResponse {
  week_start: string;
  categories: WeeklyCategory[];
}

export interface Category {
  id: number;
  nombre: string;
}
