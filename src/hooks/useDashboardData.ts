'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  dashboardApi,
  DashboardSummary,
  Movement,
  MovementType,
  normalizeMovement,
  normalizeSummary,
  normalizeTopCategory,
  normalizeTopUsedProduct,
  RecentMovementsParams,
  TopCategory,
  TopCategoryParams,
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
  topCategories: {
    params: TopCategoryParams;
    items: TopCategory[];
    isLoading: boolean;
  };
  topUsedProducts: {
    params: TopUsedParams;
    items: TopUsedProduct[];
    isLoading: boolean;
  };
  lastUpdated: string | null;
  error?: string;
}

export type DashboardReloadOverrides = {
  movements?: RecentMovementsParams;
  topUsed?: TopUsedParams;
  topCategories?: TopCategoryParams;
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
  limit: 10,
};

const DEFAULT_TOP_CATEGORY_PARAMS: TopCategoryParams = {
  days: 30,
  limit: 10,
};

const INITIAL_STATE: DashboardState = {
  kpis: EMPTY_SUMMARY,
  movements: { filters: DEFAULT_MOVEMENTS_FILTERS, items: [], total: 0, isLoading: true },
  topCategories: { params: DEFAULT_TOP_CATEGORY_PARAMS, items: [], isLoading: true },
  topUsedProducts: { params: DEFAULT_TOP_USED_PARAMS, items: [], isLoading: true },
  lastUpdated: null,
  error: undefined,
};

export const useDashboardData = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(INITIAL_STATE);
  const filtersRef = useRef({
    movements: DEFAULT_MOVEMENTS_FILTERS,
    topUsed: DEFAULT_TOP_USED_PARAMS,
    topCategories: DEFAULT_TOP_CATEGORY_PARAMS,
  });
  const requestIdRef = useRef(0);

  const loadDashboard = useCallback(
    async (overrides?: DashboardReloadOverrides) => {
      const mergedFilters = {
        movements: { ...filtersRef.current.movements, ...(overrides?.movements ?? {}) },
        topUsed: { ...filtersRef.current.topUsed, ...(overrides?.topUsed ?? {}) },
        topCategories: { ...filtersRef.current.topCategories, ...(overrides?.topCategories ?? {}) },
      };

      filtersRef.current = mergedFilters;
      const requestId = ++requestIdRef.current;

      setDashboardState((prev) => ({
        ...prev,
        movements: { ...prev.movements, filters: mergedFilters.movements, isLoading: true },
        topCategories: {
          ...prev.topCategories,
          params: mergedFilters.topCategories,
          isLoading: true,
        },
        topUsedProducts: { ...prev.topUsedProducts, params: mergedFilters.topUsed, isLoading: true },
        error: undefined,
      }));

      try {
        const summaryRaw = await dashboardApi.getSummary();

        const [movementsRes, topUsedRes, topCategoriesRes] = await Promise.allSettled([
          dashboardApi.getRecentMovements(mergedFilters.movements),
          dashboardApi.getTopUsedProducts(mergedFilters.topUsed),
          dashboardApi.getTopCategories(mergedFilters.topCategories),
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

        const topUsedItems = topUsedRes.status === 'fulfilled' ? topUsedRes.value.items ?? [] : undefined;
        const normalizedTopUsed = topUsedItems?.map(normalizeTopUsedProduct);
        const topUsedResolvedParams =
          topUsedRes.status === 'fulfilled'
            ? {
                days: topUsedRes.value.days ?? mergedFilters.topUsed.days,
                limit: topUsedRes.value.limit ?? mergedFilters.topUsed.limit,
              }
            : undefined;

        const topCategoriesItems =
          topCategoriesRes.status === 'fulfilled' ? topCategoriesRes.value.items ?? [] : undefined;
        const normalizedTopCategories = topCategoriesItems?.map(normalizeTopCategory);
        const topCategoriesResolvedParams =
          topCategoriesRes.status === 'fulfilled'
            ? {
                days: topCategoriesRes.value.days ?? mergedFilters.topCategories.days,
                limit: topCategoriesRes.value.limit ?? mergedFilters.topCategories.limit,
              }
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
          topUsedProducts: {
            params: topUsedResolvedParams ?? mergedFilters.topUsed,
            items: normalizedTopUsed ?? prev.topUsedProducts.items,
            isLoading: false,
          },
          topCategories: {
            params: topCategoriesResolvedParams ?? mergedFilters.topCategories,
            items: normalizedTopCategories ?? prev.topCategories.items,
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
          topUsedProducts: { ...prev.topUsedProducts, isLoading: false },
          topCategories: { ...prev.topCategories, isLoading: false },
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

export type { Movement, MovementType, TopCategory, TopUsedProduct };
