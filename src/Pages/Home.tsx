import Carrusel from '../Components/Home/Carrusel';
import { useNavigate } from 'react-router-dom';
import HomeCategorias from '../Components/Home/HomeCategorias';
import HomeMarcas from '../Components/Home/HomeMarcas';
import HomeTendencias from '../Components/Home/HomeTendencias';
import '../Styles/Pages/Home.css';

const Home = () => {
  const navigate = useNavigate();


  return (
    <div className="home-page">
      <Carrusel />
      <HomeCategorias />
      <HomeMarcas />
      <HomeTendencias />

      <section className="highlight-section">
        <div className="container highlight-container">
          <h2>¿Listo para abastecerte?</h2>
          <p>Carrito persistente por sesión, checkout guiado y seguimiento de pedidos.</p>
          <button className="btn btn-dark btn-large" onClick={() => navigate('/catalogo')}>
            Ir al Catálogo
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
