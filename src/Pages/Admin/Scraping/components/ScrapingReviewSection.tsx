import { Fragment, useMemo, useState } from 'react';
import { FiAlertCircle, FiCheck, FiChevronDown, FiChevronUp, FiExternalLink, FiX } from 'react-icons/fi';
import Pagination from '../../../../Components/ERP/Pagination';
import { useScraping, type ScrapedMatch } from './ScrapingContext';

const money = (value: number) => `S/ ${value.toFixed(2)}`;

const ScrapingReviewSection = () => {
  const { matches, products: internalProducts, confirmMatch, rejectMatch, loading, error } = useScraping();
  const reviewMatches = matches.filter(match => match.decision === 'REVIEW');
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [savingMatchId, setSavingMatchId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedProductKey, setExpandedProductKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const reviewGroups = useMemo(() => {
    const groups = new Map<string, { key: string; product: (typeof internalProducts)[number] | undefined; matches: typeof reviewMatches }>();
    reviewMatches.forEach(match => {
      const key = match.internalProductId == null ? 'unassigned' : String(match.internalProductId);
      const existing = groups.get(key);
      if (existing) {
        existing.matches.push(match);
      } else {
        groups.set(key, {
          key,
          product: internalProducts.find(product => product.id === match.internalProductId),
          matches: [match],
        });
      }
    });
    return Array.from(groups.values());
  }, [reviewMatches, internalProducts]);
  const totalPages = Math.max(1, Math.ceil(reviewGroups.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedReviewGroups = useMemo(
    () => reviewGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [reviewGroups, currentPage, pageSize]
  );

  const assign = (id: number, value: string) => setAssignments(current => ({ ...current, [id]: value }));
  const confirm = async (match: ScrapedMatch) => {
    const target = Number(assignments[match.id] || match.internalProductId);
    if (!target) {
      setActionError('Selecciona el producto al que pertenece esta coincidencia.');
      return;
    }

    setActionError(null);
    setSavingMatchId(match.id);
    try {
      await confirmMatch(match.id, target);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'No se pudo confirmar la coincidencia.');
    } finally {
      setSavingMatchId(null);
    }
  };

  const reject = async (match: ScrapedMatch) => {
    setActionError(null);
    setSavingMatchId(match.id);
    try {
      await rejectMatch(match.id);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'No se pudo rechazar la coincidencia.');
    } finally {
      setSavingMatchId(null);
    }
  };

  return <div className="scraping-page">
    <header className="scraping-header"><div><p className="scraping-eyebrow">MÓDULO SCRAPING</p><h1>Revisión de coincidencias</h1><p>Valida a qué producto pertenece cada sugerencia antes de publicarla.</p></div><span className="scraping-review-count"><FiAlertCircle /> {reviewMatches.length} pendientes</span></header>
    {loading && <div className="scraping-empty">Cargando revisiones desde la base de datos...</div>}
    {error && <div className="scraping-error">{error}</div>}
    {actionError && <div className="scraping-error">{actionError}</div>}
    <section className="scraping-card">
      <div className="scraping-card-title"><div><h2>Sección 2 · REVIEW</h2><p>Puede haber varias sugerencias por producto. Solo se confirma una coincidencia por tienda.</p></div><span className="scraping-status warning"><FiAlertCircle /> REQUIERE VALIDACIÓN</span></div>
      <div className="scraping-table-wrap"><table className="scraping-table review-table"><thead><tr><th>Producto de mi tienda</th><th>Coincidencias pendientes</th><th>Tiendas</th><th>Estado</th></tr></thead><tbody>
        {paginatedReviewGroups.map(group => {
          const isExpanded = expandedProductKey === group.key;
          const stores = Array.from(new Set(group.matches.map(match => match.store)));
          return <Fragment key={group.key}>
            <tr key={group.key} className={`review-product-row${isExpanded ? ' expanded' : ''}`}>
              <td><button className="scraping-product-toggle" type="button" onClick={() => setExpandedProductKey(isExpanded ? null : group.key)} aria-expanded={isExpanded}>
                {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                <span>{group.product ? <><strong>{group.product.name}</strong><small>{group.product.sku}</small></> : <span className="not-available">Sin asignar</span>}</span>
              </button></td>
              <td><span className="review-match-count">{group.matches.length}</span> sugerencia{group.matches.length === 1 ? '' : 's'}</td>
              <td><div className="review-store-list">{stores.map(store => <span key={store} className={`store-pill ${store.toLowerCase()}`}>{store}</span>)}</div></td>
              <td><span className="review-expand-hint">{isExpanded ? 'Ocultar sugerencias' : 'Ver sugerencias'}</span></td>
            </tr>
            {isExpanded && <tr key={`${group.key}-details`} className="review-details-row"><td colSpan={4}><div className="review-match-list">
              {group.matches.map(match => <div className="review-match-item" key={match.id}>
                <div className="review-match-main"><span className={`store-pill ${match.store.toLowerCase()}`}>{match.store}</span><div><strong>{match.name}</strong><small><a href={match.url} target="_blank" rel="noreferrer">Abrir producto <FiExternalLink /></a></small></div></div>
                <div className="review-match-price"><strong>{money(match.price)}</strong><small>Score {(match.score * 100).toFixed(1)}%</small></div>
                <select value={assignments[match.id] ?? match.internalProductId ?? ''} onChange={event => assign(match.id, event.target.value)}><option value="">Seleccionar producto</option>{internalProducts.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
                <div className="scraping-actions"><button className="scraping-confirm" type="button" disabled={savingMatchId !== null || (!assignments[match.id] && !match.internalProductId)} onClick={() => void confirm(match)} title="Confirmar MANUAL_MATCH">{savingMatchId === match.id ? 'Guardando…' : <><FiCheck /> Confirmar</>}</button><button className="scraping-reject" type="button" disabled={savingMatchId !== null} onClick={() => void reject(match)} title="Marcar NO_MATCH"><FiX /></button></div>
              </div>)}
            </div></td></tr>}
          </Fragment>;
        })}
      </tbody></table></div>
      {reviewMatches.length === 0 && <div className="scraping-empty success-empty"><FiCheck /> No hay productos pendientes de revisión.</div>}
      {reviewMatches.length > 0 && <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={reviewGroups.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
      />}
    </section>
  </div>;
};

export default ScrapingReviewSection;
