import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockProductos } from '../../Constantes/Data/MockData';
import '../../Styles/Pages/Home.css';

const HomeTendencias: React.FC = () => {
  const navigate = useNavigate();
  // Mostrar los primeros 4 productos como tendencia
  const productosTendencia = mockProductos.slice(0, 4);

  return (
    <section className="container tendencias-section">
      <h2 className="section-title">Productos en Tendencia</h2>
      <div className="tendencias-grid">
        {productosTendencia.map((prod) => (
          <div key={prod.id} className="tendencia-card" onClick={() => navigate('/catalogo')}>
            <img src={prod.imagenUrl} alt={prod.nombre} />
            <div className="tendencia-info">
              <h3>{prod.nombre}</h3>
              <p className="precio">S/ {prod.precio.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="tendencias-action">
         <button className="btn btn-primary" onClick={() => navigate('/catalogo')}>Ver todo el catálogo</button>
      </div>
    </section>
  );
};

export default HomeTendencias;
