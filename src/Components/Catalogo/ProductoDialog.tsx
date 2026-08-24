import React, { useState } from 'react';
import type { Producto } from '../../Types/Producto';
import { resolveImageUrl, getProductoImagenPath } from '../../Utils/imageUtils';
import ImagePlaceholder from '../Shared/ImagePlaceholder';
import { FiBox } from 'react-icons/fi';

interface Props {
  producto: Producto;
  onClose: () => void;
  onAgregar: (producto: Producto, cantidad: number) => string | null | void;
}

const ProductoDialog: React.FC<Props> = ({ producto, onClose, onAgregar }) => {
  const stock = Math.max(0, Number(producto.stock) || 0);
  const [cantidad, setCantidad] = useState(stock > 0 ? 1 : 0);
  const [error, setError] = useState<string | null>(null);
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

  const handleCantidadChange = (value: number) => {
    const next = Math.max(1, value || 1);
    if (stock > 0 && next > stock) {
      setCantidad(stock);
      setError(`No hay suficiente stock. Disponible: ${stock}`);
      return;
    }
    setError(null);
    setCantidad(next);
  };

  const handleAdd = () => {
    if (stock <= 0) {
      setError('No hay stock disponible.');
      return;
    }
    if (cantidad > stock) {
      setError(`No hay suficiente stock. Disponible: ${stock}`);
      return;
    }
    const msg = onAgregar(producto, cantidad);
    if (msg) {
      setError(msg);
      return;
    }
    onClose();
  };

  const imgSrc = resolveImageUrl(getProductoImagenPath(producto));

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
            {imgSrc ? (
              <img src={imgSrc} alt={producto.nombre} style={zoomStyle} className="zoom-image" />
            ) : (
              <ImagePlaceholder icon={FiBox} size={48} className="modal-img-placeholder" />
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
                max={stock || 1}
                value={cantidad}
                disabled={stock <= 0}
                onChange={(e) => handleCantidadChange(Number(e.target.value))}
              />
              <span className="stock-info">
                {stock <= 0
                  ? '(Sin stock)'
                  : `(${stock} ejemplar${stock !== 1 ? 'es' : ''} disponible${stock !== 1 ? 's' : ''})`}
              </span>
            </div>

            {error && <p className="stock-error-msg">{error}</p>}

            <button
              className="btn btn-primary btn-large"
              onClick={handleAdd}
              disabled={stock <= 0}
            >
              {stock <= 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDialog;
