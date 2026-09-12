import { useState } from 'react';
import { FiCheckCircle, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import Pagination from '../../../../Components/ERP/Pagination';
import { useScraping, type StoreName } from './ScrapingContext';

const money = (value: number) => `S/ ${value.toFixed(2)}`;

const ScrapingAutoMatchSection = () => {
  const { matches, products: internalProducts, loading, error, reload } = useScraping();
  const autoMatches = matches.filter(match => match.decision === 'AUTO_MATCH' || match.decision === 'MANUAL_MATCH');
  const grouped = internalProducts.map(product => ({
    product,
    stores: Object.fromEntries(autoMatches.filter(match => match.internalProductId === product.id).map(match => [match.store, match])) as Partial<Record<StoreName, typeof autoMatches[number]>>,
  })).filter(row => Object.keys(row.stores).length > 0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(grouped.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedGrouped = grouped.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return <div className="scraping-page">
    <header className="scraping-header">
      <div><p className="scraping-eyebrow">MÓDULO SCRAPING</p><h1>Productos coincidentes</h1><p>Comparativa de precios de tu tienda con Tayloy y Francisco.</p></div>
      <button className="scraping-secondary-button" type="button" onClick={() => void reload()}><FiRefreshCw /> Actualizar datos</button>
    </header>
    {loading && <div className="scraping-empty">Cargando coincidencias desde la base de datos...</div>}
    {error && <div className="scraping-error">{error}</div>}
    <div className="scraping-metrics">
      <div><span>Coincidencias activas</span><strong>{grouped.length}</strong></div>
      <div><span>Tiendas comparadas</span><strong>2</strong></div>
      <div><span>Vinculaciones manuales</span><strong>{autoMatches.filter(m => m.decision === 'MANUAL_MATCH').length}</strong></div>
    </div>
    <section className="scraping-card">
      <div className="scraping-card-title"><div><h2>Sección 1 · AUTO_MATCH</h2><p>Productos vinculados automáticamente o confirmados manualmente.</p></div><span className="scraping-status success"><FiCheckCircle /> MATCH ACTIVO</span></div>
      <div className="scraping-table-wrap"><table className="scraping-table"><thead><tr><th>Producto de mi tienda</th><th>Tayloy</th><th>Francisco</th><th>Mejor precio</th></tr></thead><tbody>
        {paginatedGrouped.map(({ product, stores }) => { const prices = Object.values(stores).filter(Boolean).map(item => item!.price); return <tr key={product.id}>
          <td><strong>{product.name}</strong><small>{product.sku} · Precio propio {money(product.price)}</small></td>
          {(['Tailoy', 'Francisco'] as StoreName[]).map(store => { const item = stores[store]; return <td key={store}>{item ? <div className="store-product"><strong>{money(item.price)}</strong><span>{item.name}</span><small>Score {(item.score * 100).toFixed(1)}% <a href={item.url}>Ver <FiExternalLink /></a></small></div> : <span className="not-available">No encontrado</span>}</td>; })}
          <td><span className="best-price">{money(Math.min(...prices))}</span></td>
        </tr>; })}
      </tbody></table></div>
      {grouped.length === 0 && <div className="scraping-empty">Aún no hay coincidencias activas.</div>}
      {grouped.length > 0 && <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={grouped.length}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={size => { setPageSize(size); setPage(1); }}
      />}
    </section>
  </div>;
};

export default ScrapingAutoMatchSection;
