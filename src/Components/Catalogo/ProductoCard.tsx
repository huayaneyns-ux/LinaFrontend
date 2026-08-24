import type { Producto } from '../../Types/Producto';
import { useCart } from '../../Context/CartContext';
import { resolveImageUrl, getProductoImagenPath } from '../../Utils/imageUtils';
import ImagePlaceholder from '../Shared/ImagePlaceholder';
import { FiBox } from 'react-icons/fi';
import '../../Styles/Components/ProductoCard.css';

interface Props {
  producto: Producto;
  onOpenDetalle: (producto: Producto) => void;
}

const ProductoCard = ({ producto, onOpenDetalle }: Props) => {
  const { agregarAlCarrito, addedProductId, carrito } = useCart();
  const imgSrc = resolveImageUrl(getProductoImagenPath(producto));
  const stock = Math.max(0, Number(producto.stock) || 0);
  const enCarrito = carrito.find(i => i.producto.id === producto.id)?.cantidad ?? 0;
  const sinStock = stock <= 0;
  const stockAgotadoEnCarrito = enCarrito >= stock && stock > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sinStock || stockAgotadoEnCarrito) return;
    agregarAlCarrito(producto, 1);
  };

  const isAdded = addedProductId === producto.id;

  return (
    <div className={`producto-card ${isAdded ? 'card-added-feedback' : ''}`} onClick={() => onOpenDetalle(producto)}>
      <div className="producto-imagen">
        {imgSrc ? (
          <img src={imgSrc} alt={producto.nombre} />
        ) : (
          <ImagePlaceholder icon={FiBox} size={32} className="producto-sin-imagen" />
        )}
        <span className={`producto-stock-badge ${sinStock ? 'sin-stock' : ''}`}>
          {sinStock ? 'Sin stock' : `${stock} und`}
        </span>
      </div>
      <div className="producto-info">
        <span className="producto-categoria">{producto.categoria}</span>
        <h4 className="producto-nombre">{producto.nombre}</h4>
        <p className="producto-precio">S/ {producto.precio.toFixed(2)}</p>
        <p className="producto-stock-text">
          {sinStock ? 'Sin ejemplares disponibles' : `${stock} ejemplar${stock !== 1 ? 'es' : ''} disponible${stock !== 1 ? 's' : ''}`}
        </p>
        <button
          type="button"
          className={`btn btn-add ${isAdded ? 'btn-success added-animation' : 'btn-primary'}`}
          onClick={handleAdd}
          disabled={isAdded || sinStock || stockAgotadoEnCarrito}
        >
          {isAdded
            ? '¡Agregado! ✓'
            : sinStock
              ? 'Sin stock'
              : stockAgotadoEnCarrito
                ? 'Stock máximo en carrito'
                : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  );
};

export default ProductoCard;
