import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Producto } from '../Types/Producto';
import type { DetallePedido } from '../Types/Pedido';

interface CartContextType {
  carrito: DetallePedido[];
  agregarAlCarrito: (producto: Producto, cantidad: number) => void;
  removerDelCarrito: (productoId: number) => void;
  limpiarCarrito: () => void;
  totalItems: number;
  subtotal: number;
  igv: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<DetallePedido[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('carritoLina');
    if (storedCart) {
      setCarrito(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carritoLina', JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.producto.id === producto.id);
      if (existente) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * item.precioUnitario }
            : item
        );
      }
      return [...prev, { producto, cantidad, precioUnitario: producto.precio, subtotal: cantidad * producto.precio }];
    });
  };

  const removerDelCarrito = (productoId: number) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId));
  };

  const limpiarCarrito = () => setCarrito([]);

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const igv = subtotal * 0.18; // 18% IGV en Perú
  const total = subtotal + igv;

  return (
    <CartContext.Provider value={{
      carrito, agregarAlCarrito, removerDelCarrito, limpiarCarrito,
      totalItems, subtotal, igv, total
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
