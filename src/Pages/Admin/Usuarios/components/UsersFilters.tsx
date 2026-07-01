import type { FiltersState } from '../../../../Hooks/useFilters';
import { SUCURSALES } from '../../../../Constantes/Data/MockData';
import '../../../../Styles/ERP/erp-toolbar.css';

const ESTADOS = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE'];
const ROLES = ['ADMINISTRADOR', 'SUPERVISOR', 'TRABAJADOR', 'CAJERO', 'CLIENTE'];

interface UsersFiltersProps {
  filters: FiltersState;
  onChange: <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => void;
}

const UsersFilters = ({ filters, onChange }: UsersFiltersProps) => {
  return (
    <>
      {/* Estado */}
      <div className="erp-filter-group">
        <span className="erp-filter-label">Estado</span>
        <select
          className="erp-filter-select"
          value={filters.estado}
          onChange={e => onChange('estado', e.target.value)}
          id="filter-estado"
        >
          <option value="">Todos</option>
          {ESTADOS.map(e => (
            <option key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Rol */}
      <div className="erp-filter-group">
        <span className="erp-filter-label">Rol</span>
        <select
          className="erp-filter-select"
          value={filters.rol}
          onChange={e => onChange('rol', e.target.value)}
          id="filter-rol"
        >
          <option value="">Todos</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Sucursal */}
      <div className="erp-filter-group">
        <span className="erp-filter-label">Sucursal</span>
        <select
          className="erp-filter-select"
          value={filters.sucursal}
          onChange={e => onChange('sucursal', e.target.value)}
          id="filter-sucursal"
        >
          <option value="">Todas</option>
          {SUCURSALES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Fecha Desde */}
      <div className="erp-filter-group">
        <span className="erp-filter-label">Registro desde</span>
        <input
          type="date"
          className="erp-filter-date"
          value={filters.fechaDesde}
          onChange={e => onChange('fechaDesde', e.target.value)}
          id="filter-fecha-desde"
        />
      </div>

      {/* Fecha Hasta */}
      <div className="erp-filter-group">
        <span className="erp-filter-label">Registro hasta</span>
        <input
          type="date"
          className="erp-filter-date"
          value={filters.fechaHasta}
          onChange={e => onChange('fechaHasta', e.target.value)}
          id="filter-fecha-hasta"
        />
      </div>
    </>
  );
};

export default UsersFilters;
