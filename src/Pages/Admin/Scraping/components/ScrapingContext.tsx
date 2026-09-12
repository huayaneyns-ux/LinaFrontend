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
  url: string;
  score: number;
  decision: MatchDecision;
}

interface ScrapingContextValue {
  products: InternalProduct[];
  matches: ScrapedMatch[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  confirmMatch: (id: number, internalProductId: number) => Promise<void>;
  rejectMatch: (id: number) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = async () => {
    setLoading(true); setError(null);
    try {
      const [apiMatches, apiProducts] = await Promise.all([api.request<Array<Record<string, unknown>>>('/Scraping/matches'), ProductoService.getProductos()]);
      setMatches(apiMatches.map(item => ({ id: Number(item.id), internalProductId: item.internalProductId == null ? null : Number(item.internalProductId), store: normalizeStore(item.store), name: String(item.name), price: Number(item.price), url: String(item.url), score: Number(item.score ?? 0), decision: String(item.decision) as MatchDecision })));
      setProducts(apiProducts.filter(product => product.estado).map(product => ({ id: product.id, name: product.nombre, sku: product.sku, price: product.precioVenta })));
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de scraping.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, []);
  const saveDecision = async (id: number, internalProductId: number | null, decision: MatchDecision) => { await api.request(`/Scraping/matches/${id}/decision`, { method: 'PUT', body: JSON.stringify({ productoId: internalProductId, decision, reviewedBy: usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : null }) }); await reload(); };
  const confirmMatch = (id: number, internalProductId: number) => saveDecision(id, internalProductId, 'MANUAL_MATCH');
  const rejectMatch = (id: number) => saveDecision(id, null, 'NO_MATCH');
  return <ScrapingContext.Provider value={{ products, matches, loading, error, reload, confirmMatch, rejectMatch }}>{children}</ScrapingContext.Provider>;
};

export const useScraping = () => {
  const value = useContext(ScrapingContext);
  if (!value) throw new Error('useScraping debe usarse dentro de ScrapingProvider');
  return value;
};
