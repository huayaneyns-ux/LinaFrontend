import { useState, useCallback } from 'react';

export interface FiltersState {
  estado: string;
  rol: string;
  sucursal: string;
  fechaDesde: string;
  fechaHasta: string;
}

const DEFAULT_FILTERS: FiltersState = {
  estado: '',
  rol: '',
  sucursal: '',
  fechaDesde: '',
  fechaHasta: '',
};

export interface UseFiltersResult {
  filters: FiltersState;
  setFilter: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  showFilters: boolean;
  toggleFilters: () => void;
}

export function useFilters(): UseFiltersResult {
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const setFilter = useCallback(<K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters };
}
