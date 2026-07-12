import React from 'react';
import { useMarcas } from '../../Hooks/useMarcas';
import { FiBookmark } from 'react-icons/fi';

import { resolveImageUrl, isActivoEstado } from '../../Utils/imageUtils';

const HomeMarcas: React.FC = () => {
  const { marcasData, loading } = useMarcas();
  const activeMarcas = marcasData.filter(m => isActivoEstado(m.estado));

  if (!loading && activeMarcas.length === 0) return null;

  return (
    <section className="home-section marcas-section-new">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title-new">Marcas Asociadas</h2>
            <p className="section-subtitle">Las mejores marcas, los mejores productos</p>
          </div>
        </div>

        <div className="marcas-track-wrapper">
          <div className="marcas-track">
            {[...activeMarcas, ...activeMarcas].map((marca, idx) => {
              const logoUrl = resolveImageUrl(marca.urlImagen || marca.url);
              return (
                <div key={`${marca.id}-${idx}`} className="marca-chip">
                  <div className="marca-logo-box">
                    {logoUrl ? (
                      <img src={logoUrl} alt={marca.nombre} />
                    ) : (
                      <div className="marca-logo-placeholder">
                        <FiBookmark size={16} />
                      </div>
                    )}
                  </div>
                  <span className="marca-chip-name">{marca.nombre}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeMarcas;
