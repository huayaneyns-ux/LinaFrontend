import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductoService } from '../../Services/Admin/Inventario/Producto';
import type { ProductoSelectDto } from '../../Types/Admin/Inventario/Producto';
import { FiBox, FiShoppingCart, FiArrowRight } from 'react-icons/fi';

import { resolveImageUrl } from '../../Utils/imageUtils';

const HomeProductosTendencia: React.FC = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoSelectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductoService.getProductos()
      .then(data => setProductos(data.filter(p => p.estado).slice(0, 8)))
      .catch(() => setProductos([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (productos.length === 0) return null;

  return (
    <section className="home-section tendencias-section-new">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title-new">  En Tendencia</h2>
            <p className="section-subtitle">Los productos más populares de la tienda</p>
          </div>
          <button className="section-link" onClick={() => navigate('/catalogo')}>
            Ver todo →
          </button>
        </div>

        <div className="productos-grid-new">
          {productos.map(prod => {
            const imgSrc = resolveImageUrl(prod.rutaImagen);
            return (
              <div
                key={prod.id}
                className="producto-card-new"
                onClick={() => navigate('/catalogo')}
              >
                <div className="producto-img-box">
                  {imgSrc ? (
                    <img src={imgSrc} alt={prod.nombre} />
                  ) : (
                    <div className="producto-img-placeholder">
                      <FiBox size={36} />
                    </div>
                  )}
                  <div className="producto-img-overlay">
                    <FiShoppingCart size={18} />
                    <span>Ver producto</span>
                  </div>
                </div>
                <div className="producto-card-info">
                  <p className="producto-categoria">{prod.categoria}</p>
                  <h3 className="producto-nombre">{prod.nombre}</h3>
                  <div className="producto-footer">
                    <span className="producto-precio">S/ {(prod.precioVenta || 0).toFixed(2)}</span>
                    <button className="producto-add-btn">
                      <FiArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeProductosTendencia;
