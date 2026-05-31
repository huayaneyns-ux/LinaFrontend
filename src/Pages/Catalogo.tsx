import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategorias } from '../Hooks/useCategorias';
import { useProductos } from '../Hooks/Producto';
import type { ProductoType as Producto } from '../Types/ProductoType';
import ProductoCard from '../Components/Catalogo/ProductoCard';
import ProductoDialog from '../Components/Catalogo/ProductoDialog';
import MarcasCarousel from '../Components/Catalogo/MarcasCarousel';
import { useCart } from '../Context/CartContext';
import '../Styles/Pages/Catalogo.css';

const Catalogo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productosData } = useProductos();
  const { categoriasData } = useCategorias();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidadDetalle, setCantidadDetalle] = useState(1);
  const { agregarAlCarrito } = useCart();

  const categoriaActual = searchParams.get('categoria') || 'todas';

  // Solo categorías activas
  const categoriasActivas = categoriasData.filter(c => c.estado !== false);

  useEffect(() => {
    let filtrados = productosData;
    
    if (categoriaActual !== 'todas') {
      filtrados = filtrados.filter(p => p.idCategoria?.toString() === categoriaActual);
    }
    
    if (busqueda) {
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    setProductos(filtrados);
  }, [categoriaActual, busqueda, productosData]);

  const handleCategoriaChange = (id: string) => {
    if (id === 'todas') {
      searchParams.delete('categoria');
    } else {
      searchParams.set('categoria', id);
    }
    setSearchParams(searchParams);
  };

  const handleAgregar = (producto: Producto, cantidad: number) => {
    agregarAlCarrito(producto, cantidad);
  };

  return (
    <>
      <MarcasCarousel />
        <div className="catalogo-page container" style={{ marginTop: '30px', maxWidth: '95%' }}>
          <div className="catalogo-header">
            <h1>Catálogo de Productos</h1>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Buscar por nombre o código..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

        <div className="catalogo-content">
          <aside className="catalogo-filters">
            <h3>Categorías</h3>
            <ul>
              <li 
                className={categoriaActual === 'todas' ? 'active' : ''}
                onClick={() => handleCategoriaChange('todas')}
              >
                Todas
              </li>
              {categoriasActivas.map(cat => (
                <li 
                  key={cat.id}
                  className={categoriaActual === cat.id.toString() ? 'active' : ''}
                  onClick={() => handleCategoriaChange(cat.id.toString())}
                >
                  {cat.nombre}
                </li>
              ))}
            </ul>
          </aside>

          <section className="productos-grid">
            {productos.length > 0 ? (
              productos.map(p => (
                <ProductoCard key={p.id} producto={p} onOpenDetalle={setProductoSeleccionado} />
              ))
            ) : (
              <div className="no-results">
                <p>No se encontraron productos para los filtros seleccionados.</p>
              </div>
            )}
          </section>
        </div>

        {/* Modal de Detalle */}
        {productoSeleccionado && (
          <ProductoDialog 
            producto={productoSeleccionado} 
            onClose={() => setProductoSeleccionado(null)} 
            onAgregar={handleAgregar} 
          />
        )}
      </div>
      {/* {productos.map(p => (
        <div key={p.id}>
          {p.nombre}
        </div>
      ))} */}
    </>
  );
};

export default Catalogo;

