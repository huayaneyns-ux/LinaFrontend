import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import '../../Styles/ERP/erp-pagination.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const Pagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PaginationProps) => {
  const startItem = Math.min((page - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate visible page numbers
  const getPages = (): (number | 'dots')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'dots')[] = [1];
    if (page > 3) pages.push('dots');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('dots');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="erp-pagination-bar">
      <span className="erp-pagination-info">
        Mostrando {totalItems === 0 ? 0 : startItem}–{endItem} de {totalItems} registros
      </span>

      <div className="erp-pagination-controls">
        <button
          className="erp-page-btn"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Primera página"
        >
          <FiChevronsLeft />
        </button>
        <button
          className="erp-page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <FiChevronLeft />
        </button>

        {getPages().map((p, i) =>
          p === 'dots' ? (
            <span key={`dots-${i}`} className="erp-page-dots">…</span>
          ) : (
            <button
              key={p}
              className={`erp-page-btn${p === page ? ' active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className="erp-page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Página siguiente"
        >
          <FiChevronRight />
        </button>
        <button
          className="erp-page-btn"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          aria-label="Última página"
        >
          <FiChevronsRight />
        </button>
      </div>

      <div className="erp-page-size-selector">
        <span>Filas:</span>
        <select
          className="erp-page-size-select"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          aria-label="Registros por página"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
