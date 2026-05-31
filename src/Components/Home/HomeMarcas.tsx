import React from 'react';
import { mockMarcas } from '../../Constantes/Data/MockData';
import { useMarcas } from '../../Hooks/useMarcas'; 
import '../../Styles/Pages/Home.css';

const HomeMarcas: React.FC = () => {

  const { marcasData } = useMarcas();

  return (
    <section className="container marcas-section">
      <h2 className="section-title">Nuestras Marcas</h2>
      <div className="marcas-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
        {marcasData.map((marca, index) => (
          <React.Fragment key={marca.id}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', overflow: 'hidden' }}>
                <img src={marca.url} alt={marca.nombre} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </div>
              <p style={{ fontWeight: '600', color: 'var(--text-dark)', margin: 0 }}>{marca.nombre}</p>
            </div>
            {/* {index < mockMarcas.length - 1 && (
              <div style={{ height: '80px', width: '2px', backgroundColor: '#eaeaea' }}></div>
            )} */}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default HomeMarcas;
