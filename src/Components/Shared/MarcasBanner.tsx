import { useMarcas } from '../Hooks/useMarcas';
import '../Styles/Components/MarcasBanner.css';

const MarcasBanner = () => {
  const { marcasData, loading } = useMarcas();

  // Filtrar solo las activas (opcional, asumiendo estado === 'ACTIVO' o similar, 
  // o si la API ya trae solo las activas, solo las mostramos)
  const marcasActivas = marcasData.filter(m => m.estado !== 'INACTIVO');

  if (loading || marcasActivas.length === 0) return null;

  return (
    <div className="marcas-banner-container">
      <div className="marcas-separator-line"></div>
      <div className="marcas-slider">
        <div className="marcas-track">
          {/* Duplicamos la lista para crear un efecto de scroll infinito continuo */}
          {[...marcasActivas, ...marcasActivas].map((marca, index) => (
            <div key={`${marca.id}-${index}`} className="marca-item">
              {marca.url ? (
                <img src={marca.url} alt={marca.nombre} title={marca.nombre} />
              ) : (
                <div className="marca-placeholder">{marca.nombre}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarcasBanner;
