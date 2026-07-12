import { FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { REDES_SOCIALES } from '../Constantes/RedesSociales';
import '../Styles/Pages/Contacto.css';

const PORTADA_CONTACTO = '/images/contacto/PortadaContacto.png';

const MAPA_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124867.75501869894!2d-77.08633726756885!3d-12.043183569762391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c5f619ee3ec3%3A0x14206cb9cc452e4a!2sLima%2C%20Per%C3%BA!5e0!3m2!1ses!2s!4v1716301234567!5m2!1ses!2s';

const Contacto = () => {
  const handleWhatsApp = (mensaje: string) => {
    const url = `https://wa.me/${REDES_SOCIALES.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="contacto-page">
      <section
        className="contacto-hero"
        style={{ backgroundImage: `url(${PORTADA_CONTACTO})` }}
      >
        <div className="contacto-hero-overlay" />
        <div className="container contacto-hero-content">
          <h1>Contacto</h1>
          <p>Estamos aquí para ayudarte con tus compras y consultas</p>
        </div>
      </section>

      <div className="container contacto-body">
        <div className="contacto-content-grid">
          <div className="contacto-cards-col">
            <div className="contacto-info-card">
              <FaMapMarkerAlt className="contacto-info-icon" />
              <p className="contacto-info-value">Av. Principal 123</p>
              <p className="contacto-info-detail">Distrito Comercial, Lima</p>
            </div>

            <button
              type="button"
              className="contacto-info-card contacto-wa-card"
              onClick={() => handleWhatsApp('Hola, deseo información sobre productos.')}
            >
              <FaWhatsapp className="contacto-info-icon contacto-wa-icon" />
              <p className="contacto-info-value">WhatsApp</p>
              <p className="contacto-info-detail">Escríbenos ahora →</p>
            </button>

            <div className="contacto-info-card">
              <FaPhoneAlt className="contacto-info-icon" />
              <p className="contacto-info-value">+51 999 999 999</p>
              <p className="contacto-info-detail">Lun – Sáb 9:00 – 19:00</p>
            </div>

            <div className="contacto-info-card">
              <FaEnvelope className="contacto-info-icon" />
              <p className="contacto-info-value">ventas@librerialina.com</p>
              <p className="contacto-info-detail">Respuesta en 24 horas</p>
            </div>
          </div>

          <div className="contacto-mapa-panel">
            <div className="contacto-mapa-header">
              <FaMapMarkerAlt />
              <span>Ubicación</span>
            </div>
            <iframe
              src={MAPA_EMBED}
              title="Ubicación en mapa"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
