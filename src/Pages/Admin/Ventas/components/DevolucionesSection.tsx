import { useState, useCallback, useMemo } from 'react';

import { DevolucionService } from '../../../../Services/Admin/Ventas/Devolucion';
import type {
  DevolucionSelectDto,
  DevolucionInsertDto,
  DevolucionUpdateDto,
} from '../../../../Types/Admin/Ventas/Devolucion';

import { useAdminCrud } from '../../../../Hooks/useAdminCrud';
import { useDataTable } from '../../../../Hooks/useDataTable';
import { useDialog } from '../../../../Hooks/useDialog';
import { formatDate } from '../../../../Utils/formatters';
import Toolbar from '../../../../Components/ERP/Toolbar';
import DataTable from '../../../../Components/ERP/DataTable';
import Pagination from '../../../../Components/ERP/Pagination';
import CrudDialog from '../../../../Components/ERP/CrudDialog';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import IconButton from '../../../../Components/ERP/IconButton';
import SubmoduleTwoTabsLayout from '../../../../Components/ERP/SubmoduleTwoTabsLayout';
import {
  FiCornerUpLeft,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
} from 'react-icons/fi';

interface DevolucionFilters {
  estado: string;
}

const DEFAULT_FILTERS: DevolucionFilters = { estado: '' };

const EMPTY_FORM: Partial<DevolucionSelectDto> = {
  codigo: '',
  ventaCodigo: '',
  cliente: '',
  motivo: '',
  total: 0,
  estado: 'PENDIENTE',
};

const devolucionCrudService = {
  getAll: () => DevolucionService.getDevoluciones(),
  getById: (id: number) => DevolucionService.getDevolucionById(id),
  create: (data: DevolucionInsertDto) => DevolucionService.createDevolucion(data),
  update: (data: DevolucionUpdateDto) => DevolucionService.updateDevolucion(data),
  delete: (id: number) => DevolucionService.deleteDevolucion(id),
};

export const DevolucionesSection = () => {
  const { items: returns, loading, saving, error, fetchById, createItem, updateItem, deleteItem } =
    useAdminCrud<DevolucionSelectDto, DevolucionInsertDto, DevolucionUpdateDto>(devolucionCrudService);

  const { dialogState, openDelete, closeDialog } = useDialog<DevolucionSelectDto>();

  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [filters, setFilters] = useState<DevolucionFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [formState, setFormState] = useState<Partial<DevolucionSelectDto>>(EMPTY_FORM);

  const filterCount = useMemo(
    () => Object.values(filters).filter(v => v !== '').length,
    [filters]
  );

  const externalFilter = useCallback(
    (dev: DevolucionSelectDto) => {
      if (filters.estado && dev.estado !== filters.estado) return false;
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
  } = useDataTable<DevolucionSelectDto>({
    data: returns,
    searchKeys: ['codigo', 'ventaCodigo', 'cliente', 'motivo'],
    defaultPageSize: 8,
    externalFilter,
  });

  const indicators = useMemo(() => {
    const total = returns.length;
    const procesados = returns.filter(r => r.estado === 'ACTIVO').length;
    const pendientes = total - procesados;
    const montoReembolsado = returns.reduce((sum, r) => sum + r.total, 0);
    return { total, procesados, pendientes, montoReembolsado };
  }, [returns]);

  const handleStartCreate = () => {
    setFormState({ ...EMPTY_FORM });
    setSelectedId(null);
    setFormMode('create');
    setActiveTab('form');
  };

  const handleStartEdit = async (record: DevolucionSelectDto) => {
    setSelectedId(record.id);
    setFormMode('edit');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
  };

  const handleStartView = async (record: DevolucionSelectDto) => {
    setSelectedId(record.id);
    setFormMode('view');
    setActiveTab('form');
    const detail = await fetchById(record.id, record);
    setFormState({ ...detail });
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formMode === 'view') return;

    try {
      if (formMode === 'create') {
        const payload: DevolucionInsertDto = {
          codigo: formState.codigo || '',
          ventaCodigo: formState.ventaCodigo || '',
          cliente: formState.cliente || '',
          motivo: formState.motivo || '',
          total: Number(formState.total) || 0,
        };
        await createItem(payload);
      } else if (formMode === 'edit' && selectedId) {
        const payload: DevolucionUpdateDto = {
          id: selectedId,
          codigo: formState.codigo || '',
          ventaCodigo: formState.ventaCodigo || '',
          cliente: formState.cliente || '',
          motivo: formState.motivo || '',
          total: Number(formState.total) || 0,
          estado: formState.estado || 'PENDIENTE',
        };
        await updateItem(payload);
      }
      setActiveTab('list');
    } catch {
      // error shown via hook
    }
  };

  const handleConfirmDelete = async () => {
    if (dialogState.record) {
      await deleteItem(dialogState.record.id);
      closeDialog();
    }
  };

  const isReadOnly = formMode === 'view';

  const columns = [
    {
      key: 'codigo',
      header: 'Nota Devolución',
      sortable: true,
      width: '130px',
      render: (row: DevolucionSelectDto) => (
        <strong style={{ color: 'var(--erp-text-primary)' }}>{row.codigo}</strong>
      ),
    },
    {
      key: 'ventaCodigo',
      header: 'Doc. Venta Ref.',
      sortable: true,
      width: '120px',
      render: (row: DevolucionSelectDto) => (
        <span style={{ fontWeight: 600 }}>{row.ventaCodigo}</span>
      ),
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row: DevolucionSelectDto) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.cliente}</div>
          <div style={{ fontSize: '11px', color: 'var(--erp-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
            Motivo: {row.motivo}
          </div>
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      sortable: true,
      width: '120px',
      render: (row: DevolucionSelectDto) => formatDate(row.fecha),
    },
    {
      key: 'total',
      header: 'Monto Devol.',
      sortable: true,
      align: 'right' as const,
      width: '110px',
      render: (row: DevolucionSelectDto) => <strong>S/ {(row.total || 0).toFixed(2)}</strong>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      width: '56px',
      align: 'center' as const,
      className: 'col-status',
      render: (row: DevolucionSelectDto) => (
        <StatusBadge status={row.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      width: '112px',
      className: 'col-actions',
      render: (row: DevolucionSelectDto) => (
        <div className="erp-table-actions">
          <IconButton icon={<FiEye />} tooltip="Ver detalle" variant="primary" onClick={() => handleStartView(row)} />
          <IconButton icon={<FiEdit2 />} tooltip="Editar" variant="warning" onClick={() => handleStartEdit(row)} />
          <IconButton icon={<FiTrash2 />} tooltip="Eliminar" variant="danger" onClick={() => openDelete(row)} />
        </div>
      ),
    },
  ];

  const listContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="erp-indicators-grid">
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiCornerUpLeft /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.total}</span>
            <span className="erp-indicator-label">Total Devoluciones</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success"><FiCheckCircle /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.procesados}</span>
            <span className="erp-indicator-label">Aprobadas / Procesadas</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon warning"><FiClock /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{indicators.pendientes}</span>
            <span className="erp-indicator-label">Pendiente Revisión</span>
          </div>
        </div>
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon"><FiActivity /></div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">S/ {indicators.montoReembolsado.toFixed(2)}</span>
            <span className="erp-indicator-label">Total Reembolsado</span>
          </div>
        </div>
      </div>

      <Toolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por código, comprobante o cliente..."
        onNew={handleStartCreate}
        newLabel="Nueva Devolución"
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(prev => !prev)}
        filterCount={filterCount}
        onResetFilters={filterCount > 0 ? () => setFilters(DEFAULT_FILTERS) : undefined}
        alwaysShowFilters={true}
        filterPanel={
          <div className="erp-filter-group">
            <label className="erp-filter-label">Estado</label>
            <select
              className="erp-filter-select"
              value={filters.estado}
              onChange={e => setFilters(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Todos los estados</option>
              <option value="ACTIVO">Aprobada / Procesada</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
        }
      />

      {error && (
        <div style={{ padding: '8px 12px', backgroundColor: 'var(--erp-danger-light)', color: 'var(--erp-danger)', borderRadius: '0px', fontSize: '13px', border: '1px solid var(--erp-danger)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--erp-text-muted)' }}>Cargando devoluciones...</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={processedData}
            sortConfig={sortConfig}
            onSort={handleSort}
            rowKey={row => row.id}
            emptyMessage="No se encontraron devoluciones registradas"
          />
          <Pagination
            page={pagination.page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pagination.pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );

  const formContent = (
    <form onSubmit={handleSaveForm} className="erp-form erp-form-simple">
      <div className="erp-form-section">
        <h3 className="erp-form-section-title">
          {formMode === 'create' && 'Nueva Solicitud de Devolución'}
          {formMode === 'edit' && `Editando Devolución #${selectedId}`}
          {formMode === 'view' && `Detalle de Devolución #${selectedId}`}
        </h3>

        <div className="erp-form-fields">
          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Código Devolución / Nota <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.codigo || ''}
                onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
                disabled={isReadOnly}
                placeholder="Ej: DEV-2026-001"
                required
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Comprobante de Venta Ref. <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.ventaCodigo || ''}
                onChange={e => setFormState(prev => ({ ...prev, ventaCodigo: e.target.value }))}
                disabled={isReadOnly}
                placeholder="Ej: B001-00045"
                required
              />
            </div>
          </div>

          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Cliente <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.cliente || ''}
                onChange={e => setFormState(prev => ({ ...prev, cliente: e.target.value }))}
                disabled={isReadOnly}
                placeholder="Nombre del cliente o razón social"
                required
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Monto de Devolución (S/) <span className="required-star">*</span></label>
              <input
                type="number"
                step="0.01"
                className="erp-input"
                value={formState.total || ''}
                onChange={e => setFormState(prev => ({ ...prev, total: parseFloat(e.target.value) || 0 }))}
                disabled={isReadOnly}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="erp-form-group">
            <label className="erp-form-label">Motivo de la Devolución <span className="required-star">*</span></label>
            <textarea
              className="erp-input"
              style={{ minHeight: '60px', height: 'auto' }}
              value={formState.motivo || ''}
              onChange={e => setFormState(prev => ({ ...prev, motivo: e.target.value }))}
              disabled={isReadOnly}
              placeholder="Describa el motivo de devolución del producto..."
              required
            />
          </div>

          {(formMode === 'edit' || formMode === 'view') && (
            <div className="erp-form-group">
              <label className="erp-form-label">Estado</label>
              {isReadOnly ? (
                <div className="erp-form-status-value">
                  <StatusBadge status={formState.estado === 'ACTIVO' ? 'ACTIVO' : 'PENDIENTE'} showText />
                </div>
              ) : (
                <select
                  className="erp-input"
                  value={formState.estado || 'PENDIENTE'}
                  onChange={e => setFormState(prev => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="ACTIVO">Aprobada / Procesada</option>
                  <option value="PENDIENTE">Pendiente</option>
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="erp-form-actions">
          <button
            type="button"
            className="erp-btn erp-btn-secondary"
            onClick={() => setActiveTab('list')}
          >
            <FiX />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            className="erp-btn erp-btn-primary"
            disabled={saving}
          >
            <FiSave />
            <span>{saving ? 'Guardando...' : formMode === 'create' ? 'Registrar Devolución' : 'Guardar Cambios'}</span>
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      <SubmoduleTwoTabsLayout
        title="Devoluciones y Notas de Crédito"
        subtitle="Gestiona solicitudes de devolución, reembolsos y cancelaciones de ventas"
        entityName="Devolución"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        formMode={formMode}
        onNew={handleStartCreate}
        listContent={listContent}
        formContent={formContent}
      />

      <CrudDialog
        isOpen={dialogState.isOpen && dialogState.mode === 'delete'}
        mode="delete"
        onClose={closeDialog}
        onConfirm={handleConfirmDelete}
        loading={saving}
        title="Eliminar Devolución"
        size="sm"
        deleteMessage={
          dialogState.record ? (
            <>¿Está seguro de eliminar el registro de devolución <strong>{dialogState.record.codigo}</strong>?</>
          ) : undefined
        }
      />
    </>
  );
};

export default DevolucionesSection;
