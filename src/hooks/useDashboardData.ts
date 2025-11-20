'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdjustmentsParams,
  AdjustmentTopLocation,
  AdjustmentTopProduct,
  dashboardApi,
  DashboardSummary,
  Movement,
  MovementType,
  normalizeAdjustmentLocation,
  normalizeAdjustmentProduct,
  normalizeMovement,
  normalizeStockByLocation,
  normalizeSummary,
  normalizeTopUsedProduct,
  RecentMovementsParams,
  StockByLocationItem,
  TopUsedParams,
  TopUsedProduct,
} from '@/services/dashboardApi';

export interface DashboardState {
  kpis: DashboardSummary;
  movements: {
    filters: RecentMovementsParams;
    items: Movement[];
    total: number;
    isLoading: boolean;
  };
  stockByLocation: {
    items: StockByLocationItem[];
    isLoading: boolean;
  };
  topUsedProducts: {
    params: TopUsedParams;
    items: TopUsedProduct[];
    isLoading: boolean;
  };
  adjustmentsMonitor: {
    params: AdjustmentsParams;
    totalAdjustments: number;
    topProducts: AdjustmentTopProduct[];
    topLocations: AdjustmentTopLocation[];
    isLoading: boolean;
  };
  lastUpdated: string | null;
  error?: string;
}

export type DashboardReloadOverrides = {
  movements?: RecentMovementsParams;
  topUsed?: TopUsedParams;
  adjustments?: AdjustmentsParams;
};

const EMPTY_SUMMARY: DashboardSummary = {
  totalMovementsLast7d: 0,
  distinctProductsLast7d: 0,
  usageVsIngress: {
    ingreso: { count: 0, percentage: 0 },
    uso: { count: 0, percentage: 0 },
  },
  adjustmentsLast30d: 0,
};

const DEFAULT_MOVEMENTS_FILTERS: RecentMovementsParams = {
  limit: 25,
  offset: 0,
};

const DEFAULT_TOP_USED_PARAMS: TopUsedParams = {
  days: 30,
  limit: 5,
};

const DEFAULT_ADJUSTMENTS_PARAMS: AdjustmentsParams = {
  days: 30,
  top: 5,
};

const INITIAL_STATE: DashboardState = {
  kpis: EMPTY_SUMMARY,
  movements: { filters: DEFAULT_MOVEMENTS_FILTERS, items: [], total: 0, isLoading: true },
  stockByLocation: { items: [], isLoading: true },
  topUsedProducts: { params: DEFAULT_TOP_USED_PARAMS, items: [], isLoading: true },
  adjustmentsMonitor: {
    params: DEFAULT_ADJUSTMENTS_PARAMS,
    totalAdjustments: 0,
    topProducts: [],
    topLocations: [],
    isLoading: true,
  },
  lastUpdated: null,
  error: undefined,
};

export const useDashboardData = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(INITIAL_STATE);
  const filtersRef = useRef({
    movements: DEFAULT_MOVEMENTS_FILTERS,
    topUsed: DEFAULT_TOP_USED_PARAMS,
    adjustments: DEFAULT_ADJUSTMENTS_PARAMS,
  });
  const requestIdRef = useRef(0);

  const loadDashboard = useCallback(
    async (overrides?: DashboardReloadOverrides) => {
      const mergedFilters = {
        movements: { ...filtersRef.current.movements, ...(overrides?.movements ?? {}) },
        topUsed: { ...filtersRef.current.topUsed, ...(overrides?.topUsed ?? {}) },
        adjustments: { ...filtersRef.current.adjustments, ...(overrides?.adjustments ?? {}) },
      };

      filtersRef.current = mergedFilters;
      const requestId = ++requestIdRef.current;

      setDashboardState((prev) => ({
        ...prev,
        movements: { ...prev.movements, filters: mergedFilters.movements, isLoading: true },
        stockByLocation: { ...prev.stockByLocation, isLoading: true },
        topUsedProducts: { ...prev.topUsedProducts, params: mergedFilters.topUsed, isLoading: true },
        adjustmentsMonitor: {
          ...prev.adjustmentsMonitor,
          params: mergedFilters.adjustments,
          isLoading: true,
        },
        error: undefined,
      }));

      try {
        const summaryRaw = await dashboardApi.getSummary();

        const [movementsRes, stockRes, topUsedRes, adjustmentsRes] = await Promise.allSettled([
          dashboardApi.getRecentMovements(mergedFilters.movements),
          dashboardApi.getStockByLocation(),
          dashboardApi.getTopUsedProducts(mergedFilters.topUsed),
          dashboardApi.getAdjustmentsMonitor(mergedFilters.adjustments),
        ]);

        if (requestIdRef.current !== requestId) {
          return;
        }

        const movementsItems =
          movementsRes.status === 'fulfilled' ? movementsRes.value.items ?? [] : undefined;
        const movementsTotal =
          movementsRes.status === 'fulfilled'
            ? typeof movementsRes.value.total === 'number'
              ? movementsRes.value.total
              : (movementsRes.value.items ?? []).length
            : undefined;
        const normalizedMovements = movementsItems?.map(normalizeMovement);

        const stockItems = stockRes.status === 'fulfilled' ? stockRes.value.items ?? [] : undefined;
        const normalizedStock = stockItems?.map(normalizeStockByLocation);

        const topUsedItems = topUsedRes.status === 'fulfilled' ? topUsedRes.value.items ?? [] : undefined;
        const normalizedTopUsed = topUsedItems?.map(normalizeTopUsedProduct);
        const topUsedResolvedParams =
          topUsedRes.status === 'fulfilled'
            ? {
                days: topUsedRes.value.days ?? mergedFilters.topUsed.days,
                limit: topUsedRes.value.limit ?? mergedFilters.topUsed.limit,
              }
            : undefined;

        const adjustmentsTopProducts =
          adjustmentsRes.status === 'fulfilled' ? adjustmentsRes.value.top_products ?? [] : undefined;
        const normalizedAdjustmentsProducts = adjustmentsTopProducts?.map(normalizeAdjustmentProduct);
        const adjustmentsTopLocations =
          adjustmentsRes.status === 'fulfilled' ? adjustmentsRes.value.top_locations ?? [] : undefined;
        const normalizedAdjustmentsLocations = adjustmentsTopLocations?.map(normalizeAdjustmentLocation);
        const adjustmentsResolvedParams =
          adjustmentsRes.status === 'fulfilled'
            ? {
                days: adjustmentsRes.value.days ?? mergedFilters.adjustments.days,
                top: adjustmentsRes.value.top ?? mergedFilters.adjustments.top,
              }
            : undefined;

        const adjustmentsResolvedTotal =
          adjustmentsRes.status === 'fulfilled'
            ? adjustmentsRes.value.total_adjustments
            : undefined;

        setDashboardState((prev) => ({
          ...prev,
          kpis: normalizeSummary(summaryRaw),
          movements: {
            filters: mergedFilters.movements,
            items: normalizedMovements ?? prev.movements.items,
            total: movementsTotal ?? prev.movements.total,
            isLoading: false,
          },
          stockByLocation: {
            items: normalizedStock ?? prev.stockByLocation.items,
            isLoading: false,
          },
          topUsedProducts: {
            params: topUsedResolvedParams ?? mergedFilters.topUsed,
            items: normalizedTopUsed ?? prev.topUsedProducts.items,
            isLoading: false,
          },
          adjustmentsMonitor: {
            params: adjustmentsResolvedParams ?? mergedFilters.adjustments,
            totalAdjustments: adjustmentsResolvedTotal ?? prev.adjustmentsMonitor.totalAdjustments,
            topProducts: normalizedAdjustmentsProducts ?? prev.adjustmentsMonitor.topProducts,
            topLocations: normalizedAdjustmentsLocations ?? prev.adjustmentsMonitor.topLocations,
            isLoading: false,
          },
          lastUpdated: new Date().toISOString(),
        }));
      } catch (error) {
        console.warn('[Dashboard] No fue posible cargar los datos', error);
        if (requestIdRef.current !== requestId) {
          return;
        }
        setDashboardState((prev) => ({
          ...prev,
          error: 'No pudimos cargar el dashboard. Intenta nuevamente.',
          movements: { ...prev.movements, isLoading: false },
          stockByLocation: { ...prev.stockByLocation, isLoading: false },
          topUsedProducts: { ...prev.topUsedProducts, isLoading: false },
          adjustmentsMonitor: { ...prev.adjustmentsMonitor, isLoading: false },
        }));
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { dashboardState, reload: loadDashboard };
};

export type { Movement, MovementType, StockByLocationItem, TopUsedProduct };
