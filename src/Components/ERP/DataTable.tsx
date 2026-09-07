import React from 'react';
import type { ReactNode } from 'react';
import type { SortConfig } from '../../Hooks/useDataTable';
import { FiArrowUp, FiArrowDown, FiCode } from 'react-icons/fi';
import '../../Styles/ERP/erp-table.css';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  /** Extra class on th/td (e.g. col-status, col-actions, col-id) */
  className?: string;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: ColumnDef<T>[];
  data: T[];
  sortConfig: SortConfig<T>;
  onSort: (key: keyof T) => void;
  emptyMessage?: string;
  loading?: boolean;
  rowKey?: (row: T) => string | number;
  expandedRowKey?: string | number;
  renderExpanded?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

function resolveColClass(col: ColumnDef<any>): string {
  const parts: string[] = [];
  if (col.className) parts.push(col.className);
  if (col.key === 'actions' || col.key === 'acciones') parts.push('col-actions', 'actions-cell');
  if (col.key === 'estado' || col.key === 'estado_pedido' || col.key === 'estadoSunat') {
    if (!col.className?.includes('col-status')) parts.push('col-status');
  }
  if (col.key === 'id' || col.key === 'id_pedido') {
    if (!col.className?.includes('col-id')) parts.push('col-id');
  }
  return parts.filter(Boolean).join(' ');
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  sortConfig,
  onSort,
  emptyMessage = 'No se encontraron registros',
  loading = false,
  rowKey,
  expandedRowKey,
  renderExpanded,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const getSortIcon = (colKey: string) => {
    if (sortConfig.key !== colKey) return <FiCode className="erp-sort-icon" style={{ opacity: 0.35, fontSize: '11px' }} />;
    if (sortConfig.direction === 'asc') return <FiArrowUp className="erp-sort-icon active" />;
    return <FiArrowDown className="erp-sort-icon active" />;
  };

  return (
    <div className="erp-table-wrapper">
      <table className="erp-table">
        <colgroup>
          {columns.map(col => (
            <col
              key={`col-${col.key}`}
              style={{
                width: col.width,
                minWidth: col.minWidth || col.width,
              }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{
                  width: col.width,
                  minWidth: col.minWidth || col.width,
                  textAlign: col.align ?? (resolveColClass(col).includes('col-status') ? 'center' : 'left'),
                }}
                className={`${resolveColClass(col)}${col.sortable ? ' sortable' : ''}`}
                onClick={col.sortable ? () => onSort(col.key as keyof T) : undefined}
              >
                <span className="erp-th-content">
                  {col.header}
                  {col.sortable && getSortIcon(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="erp-table-empty">
                  <span className="erp-table-empty-icon">⏳</span>
                  Cargando registros...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="erp-table-empty">
                  <span className="erp-table-empty-icon">📋</span>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <React.Fragment key={rowKey ? rowKey(row) : idx}>
                <tr
                  className={`${expandedRowKey !== undefined && rowKey && rowKey(row) === expandedRowKey ? 'row-expanded' : ''} ${rowClassName ? rowClassName(row) : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : undefined }}
                >
                  {columns.map(col => {
                    const cls = resolveColClass(col);
                    return (
                      <td
                        key={col.key}
                        style={{
                          width: col.width,
                          minWidth: col.minWidth || col.width,
                          textAlign: col.align ?? (cls.includes('col-status') ? 'center' : 'left'),
                        }}
                        className={cls}
                      >
                        {col.render ? col.render(row, idx) : (row[col.key] ?? '—')}
                      </td>
                    );
                  })}
                </tr>
                {expandedRowKey !== undefined && rowKey && rowKey(row) === expandedRowKey && renderExpanded ? (
                  <tr>
                    <td colSpan={columns.length} className="expanded-row">
                      {renderExpanded(row)}
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
