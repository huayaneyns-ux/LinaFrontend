import React, { useState } from 'react';
import type { ProductoType as Producto } from '../../Types/ProductoType';

interface Props {
  producto: Producto;
  onClose: () => void;
  onAgregar: (producto: Producto, cantidad: number) => void;
}

const ProductoDialog: React.FC<Props> = ({ producto, onClose, onAgregar }) => {
  const [cantidad, setCantidad] = useState(1);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(2.5)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transformOrigin: 'center center',
      transform: 'scale(1)'
    });
  };

  const handleAdd = () => {
    onAgregar(producto, cantidad);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-body">
          <div 
            className="modal-image zoom-container" 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
          >
            {producto.url ? (
              <img src={producto.url} alt={producto.nombre} style={zoomStyle} className="zoom-image" />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sin Imagen</div>
            )}
          </div>
          <div className="modal-info">
            <span className="categoria-badge">{producto.categoria}</span>
            <h2>{producto.nombre}</h2>
            <p className="codigo-prod">Código: {producto.codigo}</p>
            <p className="precio-prod">S/ {producto.precio.toFixed(2)}</p>
            <p className="desc-prod">{producto.descripcion}</p>
            
            <div className="cantidad-selector">
              <label htmlFor="cantidad">Cantidad:</label>
              <input 
                type="number" 
                id="cantidad"
                min="1" 
                max={producto.stock || 100}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
              {producto.stock !== undefined && (
                <span className="stock-info">({producto.stock} disponibles)</span>
              )}
            </div>
            
            <button className="btn btn-primary btn-large" onClick={handleAdd}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDialog;
