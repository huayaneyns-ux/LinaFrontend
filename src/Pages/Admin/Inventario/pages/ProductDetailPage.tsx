import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import type { ProductoSelectDto } from '../../../../Types/Admin/Inventario/Producto';
import AdminDetailPageLayout from '../../../../Components/ERP/AdminDetailPageLayout';
import { StatusBadge } from '../../../../Components/ERP/StatusBadge';
import { resolveImageUrl } from '../../../../Utils/imageUtils';
import { FiBox, FiDollarSign, FiInfo, FiTag } from 'react-icons/fi';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductoSelectDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await ProductoService.getProductoById(Number(id));
        setProduct(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar el detalle del producto');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Cargando detalle del producto...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '12px' }}>{error || 'Producto no encontrado'}</p>
        <button
          type="button"
          className="erp-btn erp-btn-sm erp-btn-secondary"
          onClick={() => navigate('/admin/inventario/productos')}
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  const imgSrc = resolveImageUrl(product.rutaImagen);

  return (
    <AdminDetailPageLayout
      title={`Producto: ${product.nombre}`}
      subtitle={`Código único: ${product.codigo}`}
      backTo="/admin/inventario/productos"
      editTo={`/admin/inventario/productos/${product.id}/editar`}
      statusBadge={<StatusBadge status={product.estado ? 'ACTIVO' : 'INACTIVO'} showText />}
    >
      <div className="erp-detail-grid">
        {/* ── Left Column: Attributes ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Card 1: Información General */}
          <div className="erp-detail-card">
            <div className="erp-detail-card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiInfo /> Datos Generales
              </span>
            </div>
            <div className="erp-detail-info-list">
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Código</span>
                <span className="erp-detail-info-value">{product.codigo}</span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">SKU</span>
                <span className="erp-detail-info-value">{product.sku || '—'}</span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Nombre</span>
                <span className="erp-detail-info-value">{product.nombre}</span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Estado</span>
                <span className="erp-detail-info-value">
                  <StatusBadge status={product.estado ? 'ACTIVO' : 'INACTIVO'} showText />
                </span>
              </div>
            </div>
            {product.descripcion && (
              <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <span className="erp-detail-info-label">Descripción</span>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#334155' }}>
                  {product.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Clasificación y Relaciones */}
          <div className="erp-detail-card">
            <div className="erp-detail-card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiTag /> Clasificación & Proveedor
              </span>
            </div>
            <div className="erp-detail-info-list">
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Categoría</span>
                <span className="erp-detail-info-value">{product.categoria || '—'}</span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Marca</span>
                <span className="erp-detail-info-value">{product.marca || '—'}</span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Proveedor</span>
                <span className="erp-detail-info-value">{product.razonSocial || '—'}</span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Unidad de Medida</span>
                <span className="erp-detail-info-value">
                  {product.unidadMedida} ({product.abreviatura})
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Precios y Stock */}
          <div className="erp-detail-card">
            <div className="erp-detail-card-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiDollarSign /> Precios & Control de Stock
              </span>
            </div>
            <div className="erp-detail-info-list">
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Precio de Venta</span>
                <span className="erp-detail-info-value" style={{ fontWeight: 700, color: '#0369a1' }}>
                  S/ {(product.precioVenta || 0).toFixed(2)}
                </span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Stock Mínimo</span>
                <span className="erp-detail-info-value">{product.stockMinimo} unidades</span>
              </div>
              <div className="erp-detail-info-item">
                <span className="erp-detail-info-label">Factor de Conversión</span>
                <span className="erp-detail-info-value">{product.factorConversion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Image & Quick Summary ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="erp-detail-card">
            <div className="erp-detail-card-header">
              <span>Fotografía del Producto</span>
            </div>
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.nombre}
                style={{
                  width: '100%',
                  maxHeight: '260px',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '6px',
                  border: '1px dashed #cbd5e1',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#94a3b8',
                }}
              >
                <FiBox size={32} />
                <span style={{ fontSize: '12px' }}>Sin imagen registrada</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminDetailPageLayout>
  );
};

export default ProductDetailPage;
