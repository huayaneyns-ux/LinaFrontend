import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../../../../Services/apiService';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import { useAuth } from '../../../../Context/AuthContext';

export type StoreName = 'Tailoy' | 'Francisco';
export type MatchDecision = 'AUTO_MATCH' | 'REVIEW' | 'MANUAL_MATCH' | 'NO_MATCH';

export interface InternalProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
}

export interface ScrapedMatch {
  id: number;
  internalProductId: number | null;
  store: StoreName;
  name: string;
  price: number;
  internalProductPrice: number | null;
  internalProductCost: number | null;
  url: string;
  score: number;
  decision: MatchDecision;
}

export interface ScrapedProductOption {
  scrapedProductId: number;
  store: StoreName;
  name: string;
  price: number;
  url: string;
  activeMatchId: number | null;
  matchedProductId: number | null;
  matchedProductName: string | null;
}

interface ScrapingContextValue {
  products: InternalProduct[];
  matches: ScrapedMatch[];
  scrapedProducts: ScrapedProductOption[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  confirmMatch: (id: number, internalProductId: number) => Promise<void>;
  rejectMatch: (id: number) => Promise<void>;
  updateProductPrice: (productId: number, price: number) => Promise<void>;
  createManualMatch: (scrapedProductId: number, internalProductId: number) => Promise<void>;
}

const ScrapingContext = createContext<ScrapingContextValue | null>(null);

const normalizeStore = (value: unknown): StoreName => {
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'tailoy' || normalized === 'tayloy' ? 'Tailoy' : 'Francisco';
};

export const ScrapingProvider = ({ children }: { children: ReactNode }) => {
  const { usuario } = useAuth();
  const [products, setProducts] = useState<InternalProduct[]>([]);
  const [matches, setMatches] = useState<ScrapedMatch[]>([]);
  const [scrapedProducts, setScrapedProducts] = useState<ScrapedProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const [apiMatches, apiScrapedProducts, apiProducts] = await Promise.all([api.request<Array<Record<string, unknown>>>('/Scraping/matches'), api.request<Array<Record<string, unknown>>>('/Scraping/products'), ProductoService.getProductos()]);
      setMatches(apiMatches.map(item => ({ id: Number(item.id ?? item.Id), internalProductId: item.internalProductId == null && item.ProductoId == null ? null : Number(item.internalProductId ?? item.ProductoId), store: normalizeStore(item.store ?? item.Store), name: String(item.name ?? item.Name ?? ''), price: Number(item.price ?? item.Price ?? 0), internalProductPrice: item.internalProductPrice == null && item.InternalProductPrice == null ? null : Number(item.internalProductPrice ?? item.InternalProductPrice), internalProductCost: item.internalProductCost == null && item.InternalProductCost == null ? null : Number(item.internalProductCost ?? item.InternalProductCost), url: String(item.url ?? item.Url ?? ''), score: Number(item.score ?? item.Score ?? 0), decision: String(item.decision ?? item.Decision) as MatchDecision })));
      setScrapedProducts(apiScrapedProducts.map(item => ({ scrapedProductId: Number(item.scrapedProductId ?? item.ScrapedProductId), store: normalizeStore(item.store ?? item.Store), name: String(item.name ?? item.Name ?? ''), price: Number(item.price ?? item.Price ?? 0), url: String(item.url ?? item.Url ?? ''), activeMatchId: item.activeMatchId == null && item.ActiveMatchId == null ? null : Number(item.activeMatchId ?? item.ActiveMatchId), matchedProductId: item.matchedProductId == null && item.MatchedProductId == null ? null : Number(item.matchedProductId ?? item.MatchedProductId), matchedProductName: item.matchedProductName == null && item.MatchedProductName == null ? null : String(item.matchedProductName ?? item.MatchedProductName) })));
      setProducts(apiProducts.filter(product => product.estado).map(product => ({ id: product.id, name: product.nombre, sku: product.sku, price: product.precioVenta })));
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de scraping.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, []);
  const saveDecision = async (id: number, internalProductId: number | null, decision: MatchDecision) => { await api.request(`/Scraping/matches/${id}/decision`, { method: 'PUT', body: JSON.stringify({ productoId: internalProductId, decision, reviewedBy: usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : null }) }); await reload(); };
  const confirmMatch = (id: number, internalProductId: number) => saveDecision(id, internalProductId, 'MANUAL_MATCH');
  const rejectMatch = (id: number) => saveDecision(id, null, 'NO_MATCH');
  const updateProductPrice = async (productId: number, price: number) => {
    if (!Number.isFinite(price) || price < 0) throw new Error('El precio debe ser un número válido mayor o igual a cero.');
    const product = await ProductoService.getProductoById(productId);
    await ProductoService.updateProducto({ ...product, precioVenta: Number(price.toFixed(2)) });
    await reload();
  };
  const createManualMatch = async (scrapedProductId: number, internalProductId: number) => {
    await api.request('/Scraping/matches/manual', { method: 'POST', body: JSON.stringify({ scrapedProductId, productoId: internalProductId, reviewedBy: usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : null }) });
    await reload();
  };
  return <ScrapingContext.Provider value={{ products, matches, scrapedProducts, loading, error, reload, confirmMatch, rejectMatch, updateProductPrice, createManualMatch }}>{children}</ScrapingContext.Provider>;
};

export const useScraping = () => {
  const value = useContext(ScrapingContext);
  if (!value) throw new Error('useScraping debe usarse dentro de ScrapingProvider');
  return value;
};
