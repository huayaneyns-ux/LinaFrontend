import { useState, useMemo, useEffect } from 'react';
import type { SunatTransmissionItemDto } from '../../../../../Types/Admin/Comprobantes/Comprobante';
import { SunatTransmissionService } from '../../../../../Services/Admin/Comprobantes/SunatTransmissionService';
import { SunatResponseTimeChart } from './SunatResponseTimeChart';
import { SunatTransmissionDetailModal } from './SunatTransmissionDetailModal';
import ComprobanteStatusBadge from '../ComprobanteStatusBadge';
import Toolbar from '../../../../../Components/ERP/Toolbar';
import Pagination from '../../../../../Components/ERP/Pagination';
import {
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye,
  FiZap,
  FiLayers,
  FiSend,
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown,
  FiCode,
} from 'react-icons/fi';

interface FiltersState {
  search: string;
  operationType: string;
  sunatStatus: string;
  transmissionStatus: string;
  rangoVelocidad: 'TODOS' | 'RAPIDO' | 'MODERADO' | 'LENTO' | 'SIN_RESPUESTA';
  tipoComprobante: string;
  fechaDesde: string;
  fechaHasta: string;
}

const DEFAULT_FILTERS: FiltersState = {
  search: '',
  operationType: '',
  sunatStatus: '',
  transmissionStatus: '',
  rangoVelocidad: 'TODOS',
  tipoComprobante: '',
  fechaDesde: '',
  fechaHasta: '',
};

type SortField = 'createdAt' | 'responseTimeMs' | 'attemptNumber' | 'httpStatus' | 'series';
type SortOrder = 'asc' | 'desc';

export const ComprobanteTiemposSection = () => {
  const [transmissions, setTransmissions] = useState<SunatTransmissionItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransmission, setSelectedTransmission] = useState<SunatTransmissionItemDto | null>(null);

  // Ordenamiento
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadTransmissions = async () => {
    try {
      setLoading(true);
      const data = await SunatTransmissionService.getTransmisiones();
      setTransmissions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTransmissions();
  }, []);

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Conteo de filtros activos
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.operationType) count++;
    if (filters.sunatStatus) count++;
    if (filters.transmissionStatus) count++;
    if (filters.rangoVelocidad !== 'TODOS') count++;
    if (filters.tipoComprobante) count++;
    if (filters.fechaDesde) count++;
    if (filters.fechaHasta) count++;
    return count;
  }, [filters]);

  // Filtrado de transmisiones
  const filteredData = useMemo(() => {
    return transmissions.filter((item) => {
      // Búsqueda textual
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim();
        const matchesSeries = item.series?.toLowerCase().includes(query);
        const matchesNumber = item.number?.toLowerCase().includes(query);
        const matchesFullNumber = `${item.series}-${item.number}`.toLowerCase().includes(query);
        const matchesCustomer = item.customerName?.toLowerCase().includes(query);
        const matchesDocId = item.sunatDocumentId?.toLowerCase().includes(query);
        const matchesError = item.errorMessage?.toLowerCase().includes(query);

        if (!matchesSeries && !matchesNumber && !matchesFullNumber && !matchesCustomer && !matchesDocId && !matchesError) {
          return false;
        }
      }

      // Filtro Operación
      if (filters.operationType && item.operationType !== filters.operationType) {
        return false;
      }

      // Filtro Estado SUNAT
      if (filters.sunatStatus && item.sunatStatus !== filters.sunatStatus) {
        return false;
      }

      // Filtro Estado Técnico
      if (filters.transmissionStatus && item.transmissionStatus !== filters.transmissionStatus) {
        return false;
      }

      // Filtro Tipo de Comprobante
      if (filters.tipoComprobante && item.voucherTypeCode !== filters.tipoComprobante) {
        return false;
      }

      // Filtro por Rango de Velocidad
      if (filters.rangoVelocidad !== 'TODOS') {
        if (filters.rangoVelocidad === 'SIN_RESPUESTA' && item.responseTimeMs !== null) {
          return false;
        }
        if (filters.rangoVelocidad === 'RAPIDO' && (item.responseTimeMs === null || item.responseTimeMs >= 1000)) {
          return false;
        }
        if (filters.rangoVelocidad === 'MODERADO' && (item.responseTimeMs === null || item.responseTimeMs < 1000 || item.responseTimeMs > 2500)) {
          return false;
        }
        if (filters.rangoVelocidad === 'LENTO' && (item.responseTimeMs === null || item.responseTimeMs <= 2500)) {
          return false;
        }
      }

      // Filtro Fechas
      if (filters.fechaDesde) {
        const itemDate = item.createdAt.substring(0, 10);
        if (itemDate < filters.fechaDesde) return false;
      }
      if (filters.fechaHasta) {
        const itemDate = item.createdAt.substring(0, 10);
        if (itemDate > filters.fechaHasta) return false;
      }

      return true;
    });
  }, [transmissions, filters]);

  // Ordenamiento de datos filtrados
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'responseTimeMs') {
        const aVal = a.responseTimeMs ?? -1;
        const bVal = b.responseTimeMs ?? -1;
        comparison = aVal - bVal;
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'attemptNumber') {
        comparison = a.attemptNumber - b.attemptNumber;
      } else if (sortField === 'httpStatus') {
        comparison = (a.httpStatus ?? 0) - (b.httpStatus ?? 0);
      } else if (sortField === 'series') {
        const aDoc = `${a.series ?? ''}-${a.number ?? ''}`;
        const bDoc = `${b.series ?? ''}-${b.number ?? ''}`;
        comparison = aDoc.localeCompare(bDoc);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortOrder]);

  // Paginación
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  // Métricas generales calculadas (KPIs)
  const kpis = useMemo(() => {
    const validTimes = transmissions
      .map((t) => t.responseTimeMs)
      .filter((time): time is number => time !== null && time > 0);

    const total = transmissions.length;
    const avg = validTimes.length > 0 ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length) : 0;
    const min = validTimes.length > 0 ? Math.min(...validTimes) : 0;
    const max = validTimes.length > 0 ? Math.max(...validTimes) : 0;

    const successCount = transmissions.filter((t) => t.transmissionStatus === 'SUCCESS' && t.sunatStatus === 'ACEPTADO').length;
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : '0';

    const slowCount = transmissions.filter((t) => t.responseTimeMs !== null && t.responseTimeMs > 2500).length;

    return {
      total,
      avg,
      min,
      max,
      successCount,
      successRate,
      slowCount,
    };
  }, [transmissions]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FiCode style={{ opacity: 0.35, fontSize: '11px', marginLeft: '4px' }} />;
    }
    return sortOrder === 'asc' ? (
      <FiArrowUp style={{ color: '#4f46e5', fontSize: '12px', marginLeft: '4px' }} />
    ) : (
      <FiArrowDown style={{ color: '#4f46e5', fontSize: '12px', marginLeft: '4px' }} />
    );
  };

  const getOperationBadge = (op: string) => {
    switch (op) {
      case 'SEND':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#e0e7ff',
            color: '#3730a3',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            <FiSend style={{ fontSize: '10px' }} />
            SEND
          </span>
        );
      case 'VOID':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            <FiAlertTriangle style={{ fontSize: '10px' }} />
            VOID
          </span>
        );
      case 'STATUS_QUERY':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
          }}>
            <FiActivity style={{ fontSize: '10px' }} />
            CONSULTA
          </span>
        );
      default:
        return <span>{op}</span>;
    }
  };

  const getResponseTimeBadge = (ms: number | null) => {
    if (ms === null) {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          color: '#94a3b8',
          fontSize: '12px',
          fontStyle: 'italic',
        }}>
          Sin respuesta
        </span>
      );
    }

    let bg = '#ecfdf5';
    let color = '#059669';
    let iconColor = '#10b981';

    if (ms > 2500) {
      bg = '#fef2f2';
      color = '#dc2626';
      iconColor = '#ef4444';
    } else if (ms >= 1000) {
      bg = '#fffbeb';
      color = '#d97706';
      iconColor = '#f59e0b';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: bg,
        color: color,
        padding: '3px 8px',
        borderRadius: '5px',
        fontWeight: '700',
        fontSize: '12px',
      }}>
        <FiClock style={{ color: iconColor, fontSize: '13px' }} />
        {ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`}
      </span>
    );
  };

  const formatDateTime = (str: string) => {
    if (!str) return '—';
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? str : d.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Barra superior del módulo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#f8fafc',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '13px',
            }}>
              <FiActivity />
            </span>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
              Tiempos de Respuesta del API SUNAT
            </h2>
          </div>
          <p style={{ margin: '2px 0 0 32px', fontSize: '12px', color: '#64748b' }}>
            Auditoría de latencia y registro técnico de envíos extraídos de <code>dbo.SunatTransmission</code>
          </p>
        </div>

      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="erp-indicators-grid" style={{ marginBottom: 0 }}>
        {/* KPI 1: Promedio de Respuesta */}
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon" style={{
            backgroundColor: kpis.avg < 1000 ? '#ecfdf5' : kpis.avg < 2500 ? '#fffbeb' : '#fef2f2',
            color: kpis.avg < 1000 ? '#059669' : kpis.avg < 2500 ? '#d97706' : '#dc2626',
          }}>
            <FiClock />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{kpis.avg} ms</span>
            <span className="erp-indicator-label">Latencia Promedio SUNAT</span>
          </div>
        </div>

        {/* KPI 2: Min / Max */}
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
            <FiZap />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value" style={{ fontSize: '14px' }}>
              {kpis.min} ms <span style={{ color: '#94a3b8', fontWeight: '400' }}>/</span> {kpis.max} ms
            </span>
            <span className="erp-indicator-label">Mínimo / Máximo Registrado</span>
          </div>
        </div>

        {/* KPI 3: Total de Envíos */}
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FiLayers />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{kpis.total}</span>
            <span className="erp-indicator-label">Transmisiones Registradas</span>
          </div>
        </div>

        {/* KPI 4: Tasa de Aceptación */}
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon success">
            <FiCheckCircle />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{kpis.successRate}%</span>
            <span className="erp-indicator-label">Tasa de Aceptación SUNAT</span>
          </div>
        </div>

        {/* KPI 5: Alertas de latencia */}
        <div className="erp-indicator-card">
          <div className="erp-indicator-icon" style={{
            backgroundColor: kpis.slowCount > 0 ? '#fff7ed' : '#f8fafc',
            color: kpis.slowCount > 0 ? '#ea580c' : '#94a3b8',
          }}>
            <FiAlertCircle />
          </div>
          <div className="erp-indicator-info">
            <span className="erp-indicator-value">{kpis.slowCount}</span>
            <span className="erp-indicator-label">Envíos Lentos (&gt; 2.5s)</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN GRÁFICA */}
      <SunatResponseTimeChart
        data={filteredData}
        onSelectTransmission={(item) => setSelectedTransmission(item)}
        selectedId={selectedTransmission?.id}
      />

      {/* SECCIÓN TABLA Y FILTROS */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '14px',
      }}>
        {/* Header de la tabla con Toolbar */}
        <Toolbar
          searchValue={filters.search}
          onSearchChange={(val) => {
            setFilters((prev) => ({ ...prev, search: val }));
            setPage(1);
          }}
          searchPlaceholder="Buscar por serie, número, cliente, ID..."
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((prev) => !prev)}
          filterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          filterPanel={
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              width: '100%',
              paddingTop: '6px',
            }}>
              {/* Filtro: Tipo Operación */}
              <div>
                <label className="erp-form-label" style={{ fontSize: '11px' }}>Tipo de Operación</label>
                <select
                  className="erp-input erp-input-sm"
                  value={filters.operationType}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, operationType: e.target.value }));
                    setPage(1);
                  }}
                >
                  <option value="">Todas las operaciones</option>
                  <option value="SEND">SEND (Envío de Comprobante)</option>
                  <option value="VOID">VOID (Comunicación de Baja)</option>
                  <option value="STATUS_QUERY">STATUS_QUERY (Consulta Estado)</option>
                </select>
              </div>

              {/* Filtro: Estado SUNAT */}
              <div>
                <label className="erp-form-label" style={{ fontSize: '11px' }}>Estado SUNAT</label>
                <select
                  className="erp-input erp-input-sm"
                  value={filters.sunatStatus}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, sunatStatus: e.target.value }));
                    setPage(1);
                  }}
                >
                  <option value="">Todos los estados</option>
                  <option value="ACEPTADO">ACEPTADO</option>
                  <option value="RECHAZADO">RECHAZADO</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="EXCEPCION">EXCEPCION</option>
                </select>
              </div>

              {/* Filtro: Rango de Velocidad / Latencia */}
              <div>
                <label className="erp-form-label" style={{ fontSize: '11px' }}>Rango de Latencia</label>
                <select
                  className="erp-input erp-input-sm"
                  value={filters.rangoVelocidad}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      rangoVelocidad: e.target.value as FiltersState['rangoVelocidad'],
                    }));
                    setPage(1);
                  }}
                >
                  <option value="TODOS">Todos los tiempos</option>
                  <option value="RAPIDO">Rápidos (&lt; 1,000 ms)</option>
                  <option value="MODERADO">Normales (1,000 - 2,500 ms)</option>
                  <option value="LENTO">Lentos (&gt; 2,500 ms)</option>
                  <option value="SIN_RESPUESTA">Sin respuesta / Error HTTP</option>
                </select>
              </div>

              {/* Filtro: Estado Técnico */}
              <div>
                <label className="erp-form-label" style={{ fontSize: '11px' }}>Estado Técnico</label>
                <select
                  className="erp-input erp-input-sm"
                  value={filters.transmissionStatus}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, transmissionStatus: e.target.value }));
                    setPage(1);
                  }}
                >
                  <option value="">Todos los estados técnicos</option>
                  <option value="SUCCESS">SUCCESS (Exitoso)</option>
                  <option value="ERROR">ERROR (Fallo)</option>
                  <option value="PENDING">PENDING (En cola)</option>
                </select>
              </div>

              {/* Filtro: Tipo de Comprobante */}
              <div>
                <label className="erp-form-label" style={{ fontSize: '11px' }}>Tipo Comprobante</label>
                <select
                  className="erp-input erp-input-sm"
                  value={filters.tipoComprobante}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, tipoComprobante: e.target.value }));
                    setPage(1);
                  }}
                >
                  <option value="">Todos los tipos</option>
                  <option value="01">Factura (01)</option>
                  <option value="03">Boleta de Venta (03)</option>
                  <option value="04">Liquidación de Compra (04)</option>
                  <option value="07">Nota de Crédito (07)</option>
                  <option value="08">Nota de Débito (08)</option>
                </select>
              </div>

              {/* Filtro: Fecha Desde */}
              <div>
                <label className="erp-form-label" style={{ fontSize: '11px' }}>Fecha Desde</label>
                <input
                  type="date"
                  className="erp-input erp-input-sm"
                  value={filters.fechaDesde}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, fechaDesde: e.target.value }));
                    setPage(1);
                  }}
                />
              </div>

              {/* Filtro: Fecha Hasta */}
              <div>
                <label className="erp-form-label" style={{ fontSize: '11px' }}>Fecha Hasta</label>
                <input
                  type="date"
                  className="erp-input erp-input-sm"
                  value={filters.fechaHasta}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, fechaHasta: e.target.value }));
                    setPage(1);
                  }}
                />
              </div>
            </div>
          }
        />

        {/* Tabla de envíos a la SUNAT */}
        <div className="erp-table-wrapper" style={{ marginTop: '12px' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th
                  style={{ width: '85px', cursor: 'pointer' }}
                  className="sortable"
                  onClick={() => handleSort('attemptNumber')}
                >
                  <span className="erp-th-content">
                    Intento {getSortIcon('attemptNumber')}
                  </span>
                </th>
                <th
                  style={{ width: '160px', cursor: 'pointer' }}
                  className="sortable"
                  onClick={() => handleSort('createdAt')}
                >
                  <span className="erp-th-content">
                    Fecha y Hora {getSortIcon('createdAt')}
                  </span>
                </th>
                <th
                  style={{ width: '170px', cursor: 'pointer' }}
                  className="sortable"
                  onClick={() => handleSort('series')}
                >
                  <span className="erp-th-content">
                    Comprobante {getSortIcon('series')}
                  </span>
                </th>
                <th style={{ width: '110px' }}>Operación</th>
                <th
                  style={{ width: '95px', cursor: 'pointer' }}
                  className="sortable"
                  onClick={() => handleSort('httpStatus')}
                >
                  <span className="erp-th-content">
                    HTTP {getSortIcon('httpStatus')}
                  </span>
                </th>
                <th style={{ width: '130px' }}>Estado SUNAT</th>
                <th style={{ width: '110px' }}>Técnico</th>
                <th
                  style={{ width: '150px', cursor: 'pointer' }}
                  className="sortable"
                  onClick={() => handleSort('responseTimeMs')}
                >
                  <span className="erp-th-content">
                    Tiempo Respuesta {getSortIcon('responseTimeMs')}
                  </span>
                </th>
                <th style={{ width: '70px', textAlign: 'center' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="erp-table-empty">
                      <span className="erp-table-empty-icon">⏳</span>
                      Cargando transmisiones de SUNAT...
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="erp-table-empty">
                      <span className="erp-table-empty-icon">📋</span>
                      No se encontraron transmisiones que coincidan con los filtros.
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isSelected = selectedTransmission?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: isSelected ? '#f8fafc' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedTransmission(item)}
                    >
                      {/* Intento */}
                      <td>
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                          #{item.attemptNumber}
                        </span>
                        {item.attemptNumber > 1 && (
                          <span style={{
                            marginLeft: '4px',
                            fontSize: '10px',
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            padding: '1px 4px',
                            borderRadius: '3px',
                          }}>
                            Reintento
                          </span>
                        )}
                      </td>

                      {/* Fecha y Hora */}
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {formatDateTime(item.createdAt)}
                      </td>

                      {/* Comprobante */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>
                            {item.series && item.number
                              ? `${item.series}-${item.number}`
                              : '—'}
                          </span>
                          {item.customerName && (
                            <span style={{
                              fontSize: '11px',
                              color: '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '170px',
                            }}>
                              {item.customerName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Operación */}
                      <td>{getOperationBadge(item.operationType)}</td>

                      {/* HTTP Status */}
                      <td>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: item.httpStatus === 200 ? '#ecfdf5' : item.httpStatus ? '#fef2f2' : '#f1f5f9',
                          color: item.httpStatus === 200 ? '#059669' : item.httpStatus ? '#dc2626' : '#64748b',
                        }}>
                          {item.httpStatus ? item.httpStatus : 'Timeout'}
                        </span>
                      </td>

                      {/* Estado SUNAT */}
                      <td>
                        {item.sunatStatus ? (
                          <ComprobanteStatusBadge status={item.sunatStatus} />
                        ) : (
                          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Pendiente</span>
                        )}
                      </td>

                      {/* Estado Técnico */}
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          color: item.transmissionStatus === 'SUCCESS' ? '#059669' : item.transmissionStatus === 'ERROR' ? '#dc2626' : '#2563eb',
                        }}>
                          {item.transmissionStatus}
                        </span>
                      </td>

                      {/* Tiempo de Respuesta */}
                      <td>{getResponseTimeBadge(item.responseTimeMs)}</td>

                      {/* Acciones */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="erp-btn erp-btn-sm erp-btn-secondary"
                          style={{ padding: '4px 8px' }}
                          title="Ver detalle de la transmisión"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransmission(item);
                          }}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Modal de Detalle */}
      <SunatTransmissionDetailModal
        transmission={selectedTransmission}
        onClose={() => setSelectedTransmission(null)}
      />
    </div>
  );
};
