import '../../Styles/Components/MarcasCarousel.css';
import { useMarcas } from '../../Hooks/useMarcas'; 

const MarcasCarousel = () => {
  const { marcasData } = useMarcas();
  const marcasActivas = marcasData.filter(m => m.estado !== 'INACTIVO');

  return (
    <div className="marcas-carousel-container">
      <div className="marcas-carousel-track">
        {/* Renderizamos las marcas dos veces para el efecto infinito */}
        {marcasActivas.map((marca, index) => (
          <div key={`${marca.id}-${index}`} className="marca-slide">
            <img src={marca.url} alt={marca.nombre} title={marca.nombre} />
          </div>
        ))}
        {marcasActivas.map((marca, index) => (
          <div key={`dup-${marca.id}-${index}`} className="marca-slide">
            <img src={marca.url} alt={marca.nombre} title={marca.nombre} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarcasCarousel;
