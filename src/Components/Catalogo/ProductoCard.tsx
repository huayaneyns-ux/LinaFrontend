import type { ProductoType as Producto } from '../../Types/ProductoType';
import { useCart } from '../../Context/CartContext';
import { resolveImageUrl } from '../../Utils/imageUtils';
import ImagePlaceholder from '../Shared/ImagePlaceholder';
import { FiBox } from 'react-icons/fi';
import '../../Styles/Components/ProductoCard.css';

interface Props {
  producto: Producto;
  onOpenDetalle: (producto: Producto) => void;
}

const ProductoCard = ({ producto, onOpenDetalle }: Props) => {
  const { agregarAlCarrito } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    agregarAlCarrito(producto, 1);
  };

  const imgSrc = resolveImageUrl(producto.url);

  return (
    <div className="producto-card" onClick={() => onOpenDetalle(producto)}>
      <div className="producto-imagen">
        {imgSrc ? (
          <img src={imgSrc} alt={producto.nombre} />
        ) : (
          <ImagePlaceholder icon={FiBox} size={32} className="producto-sin-imagen" />
        )}
      </div>
      <div className="producto-info">
        <span className="producto-categoria">{producto.categoria}</span>
        <h4 className="producto-nombre">{producto.nombre}</h4>
        <p className="producto-precio">S/ {producto.precio.toFixed(2)}</p>
        <button className="btn btn-primary btn-add" onClick={handleAdd}>
          Añadir al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductoCard;
