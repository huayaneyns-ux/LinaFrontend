import { FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { IMAGENES } from '../Constantes/Imagenes';
import '../Styles/Pages/Institucional.css';
import '../Styles/Pages/Contacto.css';

const Contacto = () => {
  const handleWhatsApp = (mensaje: string) => {
    const url = `https://wa.me/51999999999?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="institucional-page contacto-page">
      <div className="institucional-hero" style={{ backgroundColor: '#2c3e50', margin: '-10px auto 40px auto', borderRadius: '20px', maxWidth: '95%' }}>
        <div className="container" style={{ maxWidth: '95%' }}>
          <h1>Contáctanos</h1>
          <p>Estamos aquí para ayudarte en todo lo que necesites.</p>
        </div>
      </div>

      <div className="container contacto-content" style={{ maxWidth: '95%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '40px' }}>
          
          {/* Left Column (6 of 8 roughly = 3fr) */}
          <div className="contacto-left-column">
            
            {/* Row 1 */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '10px' }}>Información de Contacto</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                Puedes comunicarte con nosotros a través de los siguientes medios o visitarnos directamente en tienda.
              </p>
            </div>

            {/* Row 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', marginBottom: '50px' }}>
              <div style={{ borderRight: '1px solid #ccc', paddingRight: '20px' }}>
                <FaMapMarkerAlt style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Ubicación</h4>
                <p style={{ color: 'var(--text-muted)' }}>Av. Principal 123, Distrito Comercial, Ciudad.</p>
              </div>
              <div style={{ borderRight: '1px solid #ccc', paddingRight: '20px' }}>
                <FaPhoneAlt style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Teléfono</h4>
                <p style={{ color: 'var(--text-muted)' }}>+51 999 999 999<br/>(01) 234-5678</p>
              </div>
              <div>
                <FaEnvelope style={{ fontSize: '2rem', color: 'var(--secondary)', marginBottom: '10px' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Correo Electrónico</h4>
                <p style={{ color: 'var(--text-muted)' }}>ventas@librerialina.com</p>
              </div>
            </div>

            {/* Row 3 */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '10px' }}>Escríbenos por WhatsApp</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                Para una atención más rápida y personalizada, envíanos un mensaje directo.
              </p>
            </div>

            {/* Row 4 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
              <div 
                style={{ borderRight: '1px solid #ccc', cursor: 'pointer', paddingRight: '20px' }} 
                onClick={() => handleWhatsApp('Hola, deseo información sobre productos.')}
              >
                <FaWhatsapp style={{ fontSize: '2.5rem', color: '#25D366', marginBottom: '10px' }} />
                <h3 style={{ fontSize: '1.3rem', marginBottom: '5px' }}>Ventas e Información</h3>
                <span style={{ color: '#25D366', fontWeight: 'bold' }}>Enviar mensaje &rarr;</span>
              </div>
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => handleWhatsApp('Hola, tengo consultas sobre mis pedidos.')}
              >
                <FaWhatsapp style={{ fontSize: '2.5rem', color: '#25D366', marginBottom: '10px' }} />
                <h3 style={{ fontSize: '1.3rem', marginBottom: '5px' }}>Seguimiento de Pedidos</h3>
                <span style={{ color: '#25D366', fontWeight: 'bold' }}>Consultar pedido &rarr;</span>
              </div>
            </div>

          </div>

          {/* Right Column (2 of 8 roughly = 1fr) */}
          <div className="contacto-right-column">
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '10px' }}>Encuéntranos en Google Maps</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Visítanos en nuestra tienda principal. ¡Te esperamos!</p>
            <div style={{ width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124867.75501869894!2d-77.08633726756885!3d-12.043183569762391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c5f619ee3ec3%3A0x14206cb9cc452e4a!2sLima%2C%20Per%C3%BA!5e0!3m2!1ses!2s!4v1716301234567!5m2!1ses!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contacto;
