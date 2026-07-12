import { useMarcas } from '../../Hooks/useMarcas';
import { resolveImageUrl } from '../../Utils/imageUtils';
import ImagePlaceholder from './ImagePlaceholder';
import { FiBookmark } from 'react-icons/fi';
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
          {[...marcasActivas, ...marcasActivas].map((marca, index) => {
            const logoUrl = resolveImageUrl(marca.url);
            return (
            <div key={`${marca.id}-${index}`} className="marca-item">
              {logoUrl ? (
                <img src={logoUrl} alt={marca.nombre} title={marca.nombre} />
              ) : (
                <ImagePlaceholder icon={FiBookmark} size={18} className="marca-item-placeholder" />
              )}
            </div>
          );})}
        </div>
      </div>
    </div>
  );
};

export default MarcasBanner;
