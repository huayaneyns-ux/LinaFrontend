import { IMAGENES } from '../Constantes/Imagenes';
import '../Styles/Pages/Institucional.css';
import '../Styles/Pages/Nosotros.css';

const Nosotros = () => {
  return (
    <div className="institucional-page nosotros-page">
      <div className="institucional-hero" style={{ backgroundColor: '#2c3e50', margin: '-10px auto 40px auto', borderRadius: '20px', maxWidth: '95%' }}>
        <div className="container" style={{ maxWidth: '95%' }}>
          <h1>Sobre Nosotros</h1>
          <p>La tradición de inspirar tu creatividad desde 2010.</p>
        </div>
      </div>

      <div className="container nosotros-content" style={{ maxWidth: '95%' }}>
        <section className="nosotros-historia fade-in" style={{ padding: '20px 0', marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Nuestra Historia</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '1200px', margin: '0 auto 15px auto' }}>
            Librería Lina comenzó como un pequeño emprendimiento familiar con el objetivo de proveer útiles escolares de calidad a nuestra comunidad. Con el tiempo, hemos crecido para convertirnos en un referente de papelería, artículos de oficina, tecnología y regalos.
          </p>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '1200px', margin: '0 auto' }}>
            Creemos firmemente en el poder de la educación y la creatividad, por lo que seleccionamos cuidadosamente nuestro catálogo para ofrecer los mejores productos al mejor precio.
          </p>
        </section>

        <div className="nosotros-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', maxWidth: '1000px', margin: '0 auto' }}>
          <section className="nosotros-card fade-in" style={{ padding: '30px', backgroundColor: 'var(--bg-white)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="nosotros-card-image" style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={IMAGENES.NOSOTROS_MISION} alt="Misión de Librería Lina" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            </div>
            <div className="nosotros-text" style={{ padding: '0 10px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--text-dark)' }}>Nuestra Misión</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                Facilitar el acceso a herramientas educativas, creativas y profesionales, brindando un servicio excepcional y una experiencia de compra inigualable que supere las expectativas de nuestros clientes.
              </p>
            </div>
          </section>

          <section className="nosotros-card fade-in" style={{ padding: '30px', backgroundColor: 'var(--bg-white)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div className="nosotros-card-image" style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <img src={IMAGENES.NOSOTROS_VISION} alt="Visión de Librería Lina" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
            </div>
            <div className="nosotros-text" style={{ padding: '0 10px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--text-dark)' }}>Nuestra Visión</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                Ser la cadena de librerías líder a nivel nacional, reconocida por nuestra innovación, variedad de productos y compromiso inquebrantable con el desarrollo educativo y profesional de nuestra sociedad.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;
