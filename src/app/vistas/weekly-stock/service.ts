/**
 * Servicios API para vistas de stock semanal
 */
import { WeeklyStockResponse, Category } from './types';

const API_BASE = 'http://localhost:8000/api/v1';

export const WeeklyStockService = {
  /**
   * Obtiene lista de categorías
   */
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE}/categorias/`);
    if (!response.ok) {
      throw new Error('Error obteniendo categorías');
    }
    return response.json();
  },

  /**
   * Obtiene stock semanal por categorías
   */
  async getWeeklyStock(
    weekStart: string,
    categoryIds?: number[]
  ): Promise<WeeklyStockResponse> {
    const params = new URLSearchParams({
      week_start: weekStart,
    });

    if (categoryIds && categoryIds.length > 0) {
      params.append('categories', categoryIds.join(','));
    }

    const response = await fetch(
      `${API_BASE}/weekly-stock?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Error obteniendo stock semanal');
    }

    return response.json();
  },

  /**
   * Genera URL para exportar CSV
   */
  getCSVExportUrl(weekStart: string, categoryIds?: number[]): string {
    const params = new URLSearchParams({
      week_start: weekStart,
    });

    if (categoryIds && categoryIds.length > 0) {
      params.append('categories', categoryIds.join(','));
    }

    return `${API_BASE}/weekly-stock/csv?${params.toString()}`;
  },

  /**
   * Descarga CSV
   */
  async downloadCSV(weekStart: string, categoryIds?: number[]): Promise<void> {
    const url = this.getCSVExportUrl(weekStart, categoryIds);
    window.open(url, '_blank');
  },
};
