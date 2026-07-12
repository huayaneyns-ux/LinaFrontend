import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategorias } from '../../Hooks/useCategorias';
import { FiFolder } from 'react-icons/fi';

import { resolveImageUrl } from '../../Utils/imageUtils';

const HomeCategorias: React.FC = () => {
  const navigate = useNavigate();
  const { categoriasData } = useCategorias();

  const activeCategories = categoriasData.filter(cat => cat.estado !== false);

  return (
    <section className="home-section categorias-section-new">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title-new">Nuestras Categorías</h2>
            <p className="section-subtitle">Explora toda nuestra variedad de artículos</p>
          </div>
          <button className="section-link" onClick={() => navigate('/catalogo')}>
            Ver todo →
          </button>
        </div>

        <div className="categorias-grid-new">
          {activeCategories.map((cat) => {
            const imgSrc = resolveImageUrl(cat.urlImagen || cat.url);
            return (
              <div
                key={cat.id}
                className="categoria-card-new"
                onClick={() => navigate(`/catalogo?categoria=${cat.id}`)}
              >
                <div className="categoria-img-new">
                  {imgSrc ? (
                    <img src={imgSrc} alt={cat.nombre} />
                  ) : (
                    <div className="categoria-img-placeholder">
                      <FiFolder size={32} />
                    </div>
                  )}
                  <div className="categoria-overlay" />
                </div>
                <div className="categoria-info-new">
                  <span>{cat.nombre}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeCategorias;
