import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Producto } from '../Types/Producto';
import type { DetallePedido } from '../Types/Pedido';

interface CartContextType {
  carrito: DetallePedido[];
  agregarAlCarrito: (producto: Producto, cantidad: number) => string | null;
  actualizarCantidad: (productoId: number, cantidad: number) => string | null;
  removerDelCarrito: (productoId: number) => void;
  limpiarCarrito: () => void;
  totalItems: number;
  subtotal: number;
  igv: number;
  total: number;
  addedProductId: number | null;
  stockError: string | null;
  clearStockError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const stockDisponible = (producto: Producto) => Math.max(0, Number(producto.stock) || 0);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<DetallePedido[]>([]);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const storedCart = localStorage.getItem('carritoLina');
    if (storedCart) {
      setCarrito(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carritoLina', JSON.stringify(carrito));
  }, [carrito]);

  const triggerAddAnimation = (productoId: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAddedProductId(productoId);
    timerRef.current = setTimeout(() => setAddedProductId(null), 900);
  };

  const clearStockError = () => setStockError(null);

  const agregarAlCarrito = (producto: Producto, cantidad: number): string | null => {
    const stock = stockDisponible(producto);
    const qty = Math.max(1, cantidad);

    if (stock <= 0) {
      const msg = `No hay stock disponible de "${producto.nombre}".`;
      setStockError(msg);
      return msg;
    }

    const existente = carrito.find(item => item.producto.id === producto.id);
    const nuevaCantidad = existente ? existente.cantidad + qty : qty;

    if (nuevaCantidad > stock) {
      const msg = `No hay suficiente stock de "${producto.nombre}". Disponible: ${stock}`;
      setStockError(msg);
      return msg;
    }

    setStockError(null);
    setCarrito(prev => {
      const current = prev.find(item => item.producto.id === producto.id);
      if (current) {
        const nextQty = current.cantidad + qty;
        return prev.map(item =>
          item.producto.id === producto.id
            ? {
                ...item,
                producto: { ...item.producto, stock },
                cantidad: nextQty,
                subtotal: nextQty * item.precioUnitario,
              }
            : item
        );
      }
      return [
        ...prev,
        {
          producto: { ...producto, stock },
          cantidad: qty,
          precioUnitario: producto.precio,
          subtotal: qty * producto.precio,
        },
      ];
    });
    triggerAddAnimation(producto.id);
    return null;
  };

  const actualizarCantidad = (productoId: number, cantidad: number): string | null => {
    if (cantidad < 1) return null;

    const item = carrito.find(i => i.producto.id === productoId);
    if (!item) return null;

    const stock = stockDisponible(item.producto);
    if (cantidad > stock) {
      const msg = `No hay suficiente stock de "${item.producto.nombre}". Disponible: ${stock}`;
      setStockError(msg);
      return msg;
    }

    setStockError(null);
    setCarrito(prev =>
      prev.map(i =>
        i.producto.id === productoId
          ? { ...i, cantidad, subtotal: cantidad * i.precioUnitario }
          : i
      )
    );
    return null;
  };

  const removerDelCarrito = (productoId: number) => {
    setCarrito(prev => prev.filter(item => item.producto.id !== productoId));
  };

  const limpiarCarrito = () => setCarrito([]);

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const igv = subtotal * 0.18;
  const total = subtotal + igv;

  return (
    <CartContext.Provider value={{
      carrito, agregarAlCarrito, actualizarCantidad, removerDelCarrito, limpiarCarrito,
      totalItems, subtotal, igv, total, addedProductId, stockError, clearStockError,
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
