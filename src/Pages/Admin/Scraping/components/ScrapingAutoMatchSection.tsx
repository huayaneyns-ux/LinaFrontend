import { useState } from 'react';
import { FiCheckCircle, FiEdit3, FiExternalLink, FiLink, FiRefreshCw, FiX } from 'react-icons/fi';
import Pagination from '../../../../Components/ERP/Pagination';
import { useScraping, type StoreName } from './ScrapingContext';
import ScrapingPriceDialog from './ScrapingPriceDialog';

const money = (value: number) => `S/ ${(value / 1.18).toFixed(2)}`;
const costMoney = (value: number) => `S/ ${value.toFixed(2)}`;
const margin = (priceWithIgv: number, cost: number | null) => {
  if (cost == null) return null;
  const priceWithoutIgv = priceWithIgv / 1.18;
  if (priceWithoutIgv === 0) return cost > 0 ? -100 : 0;
  return ((priceWithoutIgv - cost) / priceWithoutIgv) * 100;
};
const marginClass = (value: number | null) => value == null ? '' : value < 0 ? 'negative' : value <= 10 ? 'low' : 'good';
const marginText = (value: number | null) => value == null ? '—' : `${value.toFixed(1)}%`;

const ScrapingAutoMatchSection = () => {
  const { matches, products: internalProducts, scrapedProducts, loading, error, reload, updateProductPrice, createManualMatch } = useScraping();
  const autoMatches = matches.filter(match => match.decision === 'AUTO_MATCH' || match.decision === 'MANUAL_MATCH');
  const grouped = internalProducts.map(product => ({
    product,
    stores: Object.fromEntries(autoMatches.filter(match => match.internalProductId === product.id).map(match => [match.store, match])) as Partial<Record<StoreName, typeof autoMatches[number]>>,
  })).filter(row => Object.keys(row.stores).length > 0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savingProductId, setSavingProductId] = useState<number | null>(null);
  const [priceDialog, setPriceDialog] = useState<{ productId: number; productName: string; bestPrice: number; currentPrice: number } | null>(null);
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkProductId, setLinkProductId] = useState('');
  const [linkScrapedProductId, setLinkScrapedProductId] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(grouped.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedGrouped = grouped.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const savePrice = async (productId: number, price: number) => {
    setActionError(null);
    setSavingProductId(productId);
    try {
      await updateProductPrice(productId, price);
      setPriceDialog(null);
      setCustomPrice('');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'No se pudo actualizar el precio.');
    } finally {
      setSavingProductId(null);
    }
  };

  const selectedLinkProduct = internalProducts.find(product => product.id === Number(linkProductId));
  const linkOptions = scrapedProducts.filter(scraped =>
    scraped.matchedProductId == null &&
    !matches.some(match => match.internalProductId === selectedLinkProduct?.id && match.store === scraped.store)
  );
  const link = async () => {
    if (!linkProductId || !linkScrapedProductId) return;
    setActionError(null);
    setSavingProductId(Number(linkProductId));
    try {
      await createManualMatch(Number(linkScrapedProductId), Number(linkProductId));
      setLinkDialog(false);
      setLinkProductId('');
      setLinkScrapedProductId('');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'No se pudo relacionar el producto.');
    } finally {
      setSavingProductId(null);
    }
  };

  return <div className="scraping-page">
    <header className="scraping-header">
      <div><p className="scraping-eyebrow">MÓDULO SCRAPING</p><h1>Productos coincidentes</h1><p>Comparativa de precios de tu tienda con Tayloy y Francisco.</p></div>
      <div className="scraping-header-actions"><button className="scraping-secondary-button" type="button" onClick={() => { setLinkDialog(true); setLinkProductId(''); setLinkScrapedProductId(''); }}><FiLink /> Relacionar producto</button><button className="scraping-secondary-button" type="button" onClick={() => void reload()}><FiRefreshCw /> Actualizar datos</button></div>
    </header>
    {loading && <div className="scraping-empty">Cargando coincidencias desde la base de datos...</div>}
    {error && <div className="scraping-error">{error}</div>}
    {actionError && <div className="scraping-error">{actionError}</div>}
    <div className="scraping-metrics">
      <div><span>Coincidencias activas</span><strong>{grouped.length}</strong></div>
      <div><span>Tiendas comparadas</span><strong>2</strong></div>
      <div><span>Vinculaciones manuales</span><strong>{autoMatches.filter(m => m.decision === 'MANUAL_MATCH').length}</strong></div>
    </div>
    <section className="scraping-card">
      <div className="scraping-card-title"><div><h2>Sección 1 · AUTO_MATCH</h2><p>Productos vinculados automáticamente o confirmados manualmente.</p></div><span className="scraping-status success"><FiCheckCircle /> MATCH ACTIVO</span></div>
      <div className="scraping-table-wrap"><table className="scraping-table"><thead><tr><th>Producto de mi tienda</th><th>Tayloy</th><th>Francisco</th><th>Mejor precio</th><th>Margen de ganancia</th></tr></thead><tbody>
        {paginatedGrouped.map(({ product, stores }) => { const prices = Object.values(stores).filter(Boolean).map(item => item!.price); const bestGrossPrice = Math.min(...prices); const cost = autoMatches.find(match => match.internalProductId === product.id)?.internalProductCost ?? null; const ownMargin = margin(product.price, cost); return <tr key={product.id}>
          <td><strong>{product.name}</strong><small>{product.sku} · Precio propio sin IGV {money(product.price)} · Costo {cost == null ? 'No registrado' : costMoney(cost)}</small><div className="review-price-actions"><button type="button" className="scraping-price-button" disabled={savingProductId !== null} onClick={() => void savePrice(product.id, bestGrossPrice)}>{savingProductId === product.id ? 'Actualizando…' : 'Actualizar al mejor precio'}</button><button type="button" className="scraping-price-button secondary" disabled={savingProductId !== null} onClick={() => { setCustomPrice(''); setPriceDialog({ productId: product.id, productName: product.name, bestPrice: bestGrossPrice, currentPrice: product.price }); }}><FiEdit3 /> Otro precio</button></div></td>
          {(['Tailoy', 'Francisco'] as StoreName[]).map(store => { const item = stores[store]; const scrapedMargin = item ? margin(item.price, cost) : null; return <td key={store}>{item ? <div className="store-product"><strong>{money(item.price)}</strong><span>{item.name}</span><small>Sin IGV · Score {(item.score * 100).toFixed(1)}% <a href={item.url}>Ver <FiExternalLink /></a></small><span className={`scraping-margin ${marginClass(scrapedMargin)}`}>Margen: {marginText(scrapedMargin)}</span></div> : <span className="not-available">No encontrado</span>}</td>; })}
          <td><span className="best-price">{money(bestGrossPrice)}</span></td>
          <td><span className={`scraping-margin scraping-margin-main ${marginClass(ownMargin)}`}>{marginText(ownMargin)}</span></td>
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
    {priceDialog && <ScrapingPriceDialog productName={priceDialog.productName} bestPrice={priceDialog.bestPrice / 1.18} currentPrice={priceDialog.currentPrice / 1.18} value={customPrice} loading={savingProductId !== null} onChange={setCustomPrice} onClose={() => setPriceDialog(null)} onSave={() => void savePrice(priceDialog.productId, Number(customPrice) * 1.18)} />}
    {linkDialog && <div className="scraping-modal-backdrop" role="presentation" onClick={() => setLinkDialog(false)}><div className="scraping-modal scraping-link-modal" role="dialog" aria-modal="true" onClick={event => event.stopPropagation()}><div className="scraping-modal-heading"><h3>Relacionar producto manualmente</h3><button type="button" className="scraping-icon-button" onClick={() => setLinkDialog(false)} aria-label="Cerrar"><FiX /></button></div><p>Elige un producto propio y cualquier producto scrapeado disponible. La relación se valida por tienda.</p><label htmlFor="link-internal-product">Producto de mi tienda</label><select id="link-internal-product" className="erp-input" value={linkProductId} onChange={event => { setLinkProductId(event.target.value); setLinkScrapedProductId(''); }}><option value="">Selecciona un producto</option>{internalProducts.map(product => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select><label htmlFor="link-scraped-product">Producto scrapeado</label><select id="link-scraped-product" className="erp-input" value={linkScrapedProductId} onChange={event => setLinkScrapedProductId(event.target.value)} disabled={!linkProductId}><option value="">Selecciona un producto</option>{linkOptions.map(scraped => <option key={scraped.scrapedProductId} value={scraped.scrapedProductId}>{scraped.store} · {scraped.name} · {money(scraped.price)}</option>)}</select>{linkProductId && linkOptions.length === 0 && <small className="scraping-form-hint">Ese producto ya tiene relación en todas las tiendas disponibles o no hay productos scrapeados libres.</small>}<div className="scraping-modal-actions"><button type="button" className="scraping-secondary-button" onClick={() => setLinkDialog(false)} disabled={savingProductId !== null}>Cancelar</button><button type="button" className="scraping-confirm" onClick={() => void link()} disabled={savingProductId !== null || !linkProductId || !linkScrapedProductId}>{savingProductId !== null ? 'Guardando…' : 'Relacionar'}</button></div></div></div>}
  </div>;
};

export default ScrapingAutoMatchSection;
