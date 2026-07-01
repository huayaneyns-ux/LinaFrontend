import { useState, useCallback, useMemo } from 'react';
import type { Usuario, UsuarioFormData } from '../../../Types/Usuario';
import { mockUsuarios } from '../../../Constantes/Data/MockData';
import { useDataTable } from '../../../Hooks/useDataTable';
import { useDialog } from '../../../Hooks/useDialog';
import { useFilters } from '../../../Hooks/useFilters';
import { generateId, nowISO, isInDateRange } from '../../../Utils/formatters';

import Toolbar from '../../../Components/ERP/Toolbar';
import UsersTable from './components/UsersTable';
import UsersFilters from './components/UsersFilters';
import UsersDialog from './components/UsersDialog';
import '../../../Styles/ERP/erp-variables.css';
import '../../../Styles/ERP/erp-toolbar.css';
import '../../../Styles/ERP/erp-table.css';
import '../../../Styles/ERP/erp-badges.css';
import '../../../Styles/ERP/erp-dialog.css';
import '../../../Styles/ERP/erp-form.css';
import '../../../Styles/ERP/erp-pagination.css';

const UsuariosPage = () => {
  const [users, setUsers] = useState<Usuario[]>(mockUsuarios);
  const { dialogState, openCreate, openEdit, openView, openDelete, closeDialog } = useDialog<Usuario>();
  const { filters, setFilter, resetFilters, hasActiveFilters, showFilters, toggleFilters } = useFilters();

  // Count active filters
  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  // External filter function from filter panel
  const externalFilter = useCallback(
    (user: Usuario) => {
      if (filters.estado && user.estado !== filters.estado) return false;
      if (filters.rol && user.rol !== filters.rol) return false;
      if (filters.sucursal && user.sucursal !== filters.sucursal) return false;
      if (!isInDateRange(user.createdAt, filters.fechaDesde, filters.fechaHasta)) return false;
      return true;
    },
    [filters]
  );

  const {
    processedData,
    totalItems,
    totalPages,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    pagination,
    setPage,
    setPageSize,
  } = useDataTable<Usuario>({
    data: users,
    searchKeys: ['username', 'nombres', 'apellidos', 'email', 'sucursal'],
    defaultPageSize: 10,
    externalFilter,
  });

  /* ── CRUD Handlers ── */
  const handleCreate = useCallback((data: UsuarioFormData) => {
    const newUser: Usuario = {
      ...data,
      id: generateId(),
      password: data.password,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
    setUsers(prev => [newUser, ...prev]);
  }, []);

  const handleUpdate = useCallback((id: string, data: UsuarioFormData) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id
          ? { ...u, ...data, updatedAt: nowISO() }
          : u
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      {/* Module Header */}
      <div className="erp-module-header">
        <div>
          <h1 className="erp-module-title">Usuarios</h1>
          <p className="erp-module-subtitle">
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, usuario, email o sucursal..."
        onNew={openCreate}
        newLabel="Nuevo usuario"
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        filterCount={filterCount}
        onResetFilters={hasActiveFilters ? resetFilters : undefined}
        filterPanel={
          <UsersFilters
            filters={filters}
            onChange={setFilter}
          />
        }
      />

      {/* Table */}
      <UsersTable
        data={processedData}
        totalItems={totalItems}
        sortConfig={sortConfig}
        onSort={handleSort}
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onView={openView}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* Dialog */}
      <UsersDialog
        isOpen={dialogState.isOpen}
        mode={dialogState.mode}
        record={dialogState.record}
        onClose={closeDialog}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UsuariosPage;
