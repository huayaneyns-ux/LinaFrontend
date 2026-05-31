import { useState, useEffect } from 'react';
import { imagenesCarrusel } from '../../Constantes/Imagenes/ImagenCarrusel/ImagenCarrusel';
import { useNavigate } from 'react-router-dom';
import '../../Styles/Components/Carrusel.css';

const Carrusel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === imagenesCarrusel.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Transición cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carrusel-container">
      {imagenesCarrusel.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`carrusel-slide ${index === currentIndex ? 'active fade-in' : ''}`}
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${slide.rutaImagen})` }}
        >
          {index === currentIndex && (
            <div className="carrusel-content">
              <h1>{slide.nombre}</h1>
              <p>{slide.descripcion}</p>
              <button className="btn btn-primary" onClick={() => navigate('/catalogo')}>
                Ver Catálogo
              </button>
            </div>
          )}
        </div>
      ))}
      <div className="carrusel-indicators">
        {imagenesCarrusel.map((_, index) => (
          <button 
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carrusel;
