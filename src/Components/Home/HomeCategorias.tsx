import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategorias } from '../../Hooks/useCategorias';
import '../../Styles/Pages/Home.css';

const HomeCategorias: React.FC = () => {
  const navigate = useNavigate();
  const { categoriasData } = useCategorias();

  const handleCategoryClick = (id: number) => {
    navigate(`/catalogo?categoria=${id}`);
  };

  return (
    <section className="container categories-section">
      <h2 className="section-title">Nuestras Categorías</h2>
      <div className="categories-grid">
        {categoriasData.map((cat) => (
          <div 
            key={cat.id} 
            className="categoria-card"
            onClick={() => handleCategoryClick(cat.id)}
          >
            <div className="categoria-img">
                <img src={cat.url} alt={cat.nombre} />
            </div>
            <h3>{cat.nombre}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeCategorias;
