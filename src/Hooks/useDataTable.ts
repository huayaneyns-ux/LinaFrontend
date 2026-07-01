import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}

export interface UseDataTableResult<T> {
  // Data
  processedData: T[];
  totalItems: number;
  totalPages: number;
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Sort
  sortConfig: SortConfig<T>;
  handleSort: (key: keyof T) => void;
  // Pagination
  pagination: PaginationConfig;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

interface UseDataTableOptions<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  defaultPageSize?: number;
  externalFilter?: (item: T) => boolean;
}

export function useDataTable<T extends Record<string, any>>({
  data,
  searchKeys = [],
  defaultPageSize = 10,
  externalFilter,
}: UseDataTableOptions<T>): UseDataTableResult<T> {
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({ key: null, direction: null });
  const [pagination, setPagination] = useState<PaginationConfig>({ page: 1, pageSize: defaultPageSize });

  // Debounce-like: reset to page 1 on search change
  const setSearchQuery = useCallback((q: string) => {
    setSearchQueryRaw(q);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        const next: SortDirection = prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc';
        return { key: next === null ? null : key, direction: next };
      }
      return { key, direction: 'asc' };
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination({ page: 1, pageSize: size });
  }, []);

  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search
    if (searchQuery.trim() && searchKeys.length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item =>
        searchKeys.some(key => {
          const val = item[key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // External filter (from FilterPanel)
    if (externalFilter) {
      result = result.filter(externalFilter);
    }

    // Sort
    if (sortConfig.key && sortConfig.direction) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), 'es', { sensitivity: 'base' });
        return direction === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, searchKeys, externalFilter, sortConfig]);

  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));

  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return processedData.slice(start, start + pagination.pageSize);
  }, [processedData, pagination]);

  return {
    processedData: paginatedData,
    totalItems,
    totalPages,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    pagination,
    setPage,
    setPageSize,
  };
}
