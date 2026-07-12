import { useState, useCallback, useEffect } from 'react';

export interface AdminCrudService<T, TInsert, TUpdate> {
  getAll: () => Promise<T[]>;
  getById: (id: number) => Promise<T>;
  create: (data: TInsert) => Promise<unknown>;
  update: (data: TUpdate) => Promise<unknown>;
  delete: (id: number) => Promise<unknown>;
}

export function useAdminCrud<T extends { id: number }, TInsert, TUpdate>(
  service: AdminCrudService<T, TInsert, TUpdate>
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getAll();
      setItems(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const fetchById = useCallback(
    async (id: number, fallback?: T): Promise<T> => {
      try {
        return await service.getById(id);
      } catch {
        return fallback ?? ({} as T);
      }
    },
    [service]
  );

  const createItem = useCallback(
    async (data: TInsert) => {
      setSaving(true);
      setError(null);
      try {
        await service.create(data);
        await loadItems();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al crear';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [service, loadItems]
  );

  const updateItem = useCallback(
    async (data: TUpdate) => {
      setSaving(true);
      setError(null);
      try {
        await service.update(data);
        await loadItems();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al actualizar';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [service, loadItems]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      setSaving(true);
      setError(null);
      try {
        const result = await service.delete(id);
        await loadItems();
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al eliminar';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [service, loadItems]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    items,
    loading,
    saving,
    error,
    loadItems,
    fetchById,
    createItem,
    updateItem,
    deleteItem,
    clearError,
  };
}
