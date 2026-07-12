import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useCategorias } from '../Hooks/useCategorias';
import { useMarcas } from '../Hooks/useMarcas';
import { useProductos } from '../Hooks/Producto';
import type { Producto } from '../Types/Producto';
import ProductoCard from '../Components/Catalogo/ProductoCard';
import ProductoDialog from '../Components/Catalogo/ProductoDialog';
import { useCart } from '../Context/CartContext';
import { isActivoEstado } from '../Utils/imageUtils';
import '../Styles/Pages/Catalogo.css';

const PORTADA_CATALOGO = '/images/categorias/PortadaCategoria.png';

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productosData, loading: loadingProductos } = useProductos();
  const { categoriasData } = useCategorias();
  const { marcasData } = useMarcas();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const { agregarAlCarrito } = useCart();

  const categoriaActual = searchParams.get('categoria') || 'todas';
  const marcaActual = searchParams.get('marca') || 'todas';

  const productosActivos = useMemo(
    () => productosData.filter(p => isActivoEstado(p.estado)),
    [productosData]
  );

  const categoriasFiltro = useMemo(() => {
    const ids = new Set(productosActivos.map(p => p.idCategoria));
    return categoriasData.filter(c => ids.has(c.id));
  }, [categoriasData, productosActivos]);

  const marcasFiltro = useMemo(() => {
    const ids = new Set(
      productosActivos.map(p => p.idMarca).filter((id): id is number => id != null)
    );
    const porNombre = new Map<string, number>();
    productosActivos.forEach(p => {
      if (p.marca && p.idMarca) porNombre.set(p.marca, p.idMarca);
    });
    return marcasData.filter(
      m => ids.has(m.id) || [...porNombre.values()].includes(m.id)
    );
  }, [marcasData, productosActivos]);

  useEffect(() => {
    let filtrados = [...productosActivos];

    if (categoriaActual !== 'todas') {
      filtrados = filtrados.filter(p => p.idCategoria?.toString() === categoriaActual);
    }

    if (marcaActual !== 'todas') {
      filtrados = filtrados.filter(p => {
        if (p.idMarca) return p.idMarca.toString() === marcaActual;
        const marca = marcasData.find(m => m.id.toString() === marcaActual);
        return marca ? p.marca === marca.nombre : false;
      });
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      filtrados = filtrados.filter(
        p => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q)
      );
    }

    setProductos(filtrados);
  }, [categoriaActual, marcaActual, busqueda, productosActivos, marcasData]);

  const setFiltro = (key: 'categoria' | 'marca', value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'todas') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="catalogo-page">
      <section
        className="catalogo-hero"
        style={{ backgroundImage: `url(${PORTADA_CATALOGO})` }}
      >
        <div className="catalogo-hero-overlay" />
        <div className="container catalogo-hero-content">
          <h1>Catálogo</h1>
          <p>Encuentra artículos escolares y de oficina de las mejores marcas</p>
        </div>
      </section>

      <div className="container catalogo-inner">
        <div className="catalogo-toolbar">
          <p className="catalogo-count">
            {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </p>
          <div className="catalogo-search">
            <FiSearch size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="catalogo-content">
          <aside className="catalogo-filters">
            <div className="filter-block">
              <h3>Categoría</h3>
              <div className="filter-radio-group">
                <label className="filter-radio">
                  <input
                    type="radio"
                    name="categoria"
                    checked={categoriaActual === 'todas'}
                    onChange={() => setFiltro('categoria', 'todas')}
                  />
                  <span>Todas</span>
                </label>
                {categoriasFiltro.map(cat => (
                  <label key={cat.id} className="filter-radio">
                    <input
                      type="radio"
                      name="categoria"
                      checked={categoriaActual === cat.id.toString()}
                      onChange={() => setFiltro('categoria', cat.id.toString())}
                    />
                    <span>{cat.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-block">
              <h3>Marca</h3>
              <div className="filter-radio-group">
                <label className="filter-radio">
                  <input
                    type="radio"
                    name="marca"
                    checked={marcaActual === 'todas'}
                    onChange={() => setFiltro('marca', 'todas')}
                  />
                  <span>Todas</span>
                </label>
                {marcasFiltro.map(marca => (
                  <label key={marca.id} className="filter-radio">
                    <input
                      type="radio"
                      name="marca"
                      checked={marcaActual === marca.id.toString()}
                      onChange={() => setFiltro('marca', marca.id.toString())}
                    />
                    <span>{marca.nombre}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <section className="catalogo-productos">
            {loadingProductos ? (
              <div className="no-results">
                <p>Cargando productos...</p>
              </div>
            ) : productos.length > 0 ? (
              <div className="productos-grid">
                {productos.map(p => (
                  <ProductoCard
                    key={p.id}
                    producto={p}
                    onOpenDetalle={setProductoSeleccionado}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No se encontraron productos para los filtros seleccionados.</p>
              </div>
            )}
          </section>
        </div>

        {productoSeleccionado && (
          <ProductoDialog
            producto={productoSeleccionado}
            onClose={() => setProductoSeleccionado(null)}
            onAgregar={(p, c) => agregarAlCarrito(p, c)}
          />
        )}
      </div>
    </div>
  );
};

export default Catalogo;
