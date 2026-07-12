import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeCategorias from '../Components/Home/HomeCategorias';
import HomeMarcas from '../Components/Home/HomeMarcas';
import HomeProductosTendencia from '../Components/Home/HomeProductosTendencia';
import SocialLinks from '../Components/Shared/SocialLinks';
import { imagenesCarrusel } from '../Constantes/Imagenes/ImagenCarrusel/ImagenCarrusel';
import { FiArrowRight, FiTruck, FiShield, FiStar } from 'react-icons/fi';
import '../Styles/Pages/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setHeroIndex(i => (i + 1) % imagenesCarrusel.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const slide = imagenesCarrusel[heroIndex];

  return (
    <div className="home-page">
      {/* Hero compacto */}
      <section className="hero-section">
        {imagenesCarrusel.map((s, i) => (
          <div
            key={s.id}
            className={`hero-bg${i === heroIndex ? ' active' : ''}`}
            style={{ backgroundImage: `url(${s.rutaImagen})` }}
          />
        ))}
        <div className="hero-overlay" />
        <div className="hero-content container">
          <div className="hero-badge">Tu librería de confianza</div>
          <h1 className="hero-title">{slide.nombre}</h1>
          <p className="hero-subtitle">{slide.descripcion}</p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/catalogo')}>
              Ver Catálogo <FiArrowRight />
            </button>
          </div>
        </div>
        <div className="hero-dots">
          {imagenesCarrusel.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === heroIndex ? ' active' : ''}`}
              onClick={() => setHeroIndex(i)}
            />
          ))}
        </div>
      </section>

      {/* Barra de beneficios compacta */}
      <section className="benefits-section">
        <div className="container benefits-grid">
          <div className="benefit-item">
            <FiTruck className="benefit-icon" />
            <div><strong>Envío Rápido</strong><span>A Lima y provincias</span></div>
          </div>
          <div className="benefit-item">
            <FiShield className="benefit-icon" />
            <div><strong>Compra Segura</strong><span>Pagos protegidos</span></div>
          </div>
          <div className="benefit-item">
            <FiStar className="benefit-icon" />
            <div><strong>Calidad</strong><span>Marcas reconocidas</span></div>
          </div>
        </div>
      </section>

      <HomeCategorias />
      <HomeProductosTendencia />
      <HomeMarcas />

      {/* CTA + redes sociales */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2>Encuentra todo lo que necesitas</h2>
          <p>Explora nuestro catálogo y síguenos en redes para novedades y promociones.</p>
          <div className="cta-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/catalogo')}>
              Ir al Catálogo <FiArrowRight />
            </button>
            <SocialLinks variant="inline" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
