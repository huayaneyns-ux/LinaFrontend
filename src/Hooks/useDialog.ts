import { useState, useCallback } from 'react';

export type DialogMode = 'create' | 'edit' | 'view' | 'delete';

export interface DialogState<T> {
  isOpen: boolean;
  mode: DialogMode;
  record: T | null;
}

export interface UseDialogResult<T> {
  dialogState: DialogState<T>;
  openCreate: () => void;
  openEdit: (record: T) => void;
  openView: (record: T) => void;
  openDelete: (record: T) => void;
  closeDialog: () => void;
}

const INITIAL_STATE = <T>(): DialogState<T> => ({
  isOpen: false,
  mode: 'create',
  record: null,
});

export function useDialog<T>(): UseDialogResult<T> {
  const [dialogState, setDialogState] = useState<DialogState<T>>(INITIAL_STATE<T>());

  const openCreate = useCallback(() => {
    setDialogState({ isOpen: true, mode: 'create', record: null });
  }, []);

  const openEdit = useCallback((record: T) => {
    setDialogState({ isOpen: true, mode: 'edit', record });
  }, []);

  const openView = useCallback((record: T) => {
    setDialogState({ isOpen: true, mode: 'view', record });
  }, []);

  const openDelete = useCallback((record: T) => {
    setDialogState({ isOpen: true, mode: 'delete', record });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState(INITIAL_STATE<T>());
  }, []);

  return { dialogState, openCreate, openEdit, openView, openDelete, closeDialog };
}
