import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './Routes/AppRoutes';
import { AuthProvider } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
