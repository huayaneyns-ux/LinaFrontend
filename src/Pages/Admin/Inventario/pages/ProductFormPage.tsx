import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProductoService } from '../../../../Services/Admin/Inventario/Producto';
import { CategoriaService } from '../../../../Services/Admin/Inventario/Categoria';
import { MarcaService } from '../../../../Services/Admin/Inventario/Marca';
import { UnidadMedidaService } from '../../../../Services/Admin/Inventario/UnidadMedida';
import { ProveedorService } from '../../../../Services/Admin/Compras/Proveedor';
import type {
  ProductoSelectDto,
  ProductoInsertDto,
  ProductoUpdateDto,
} from '../../../../Types/Admin/Inventario/Producto';
import type { CategoriaSelectDto } from '../../../../Types/Admin/Inventario/Categoria';
import type { MarcaSelectDto } from '../../../../Types/Admin/Inventario/Marca';
import type { UnidadMedidaSelectDto } from '../../../../Types/Admin/Inventario/UnidadMedida';
import type { Proveedor } from '../../../../Types/Admin/Compras/Proveedor';
import AdminFormPageLayout from '../../../../Components/ERP/AdminFormPageLayout';
import ImageUpload, { type ImageUploadHandle } from '../../../../Components/ERP/ImageUpload';
import { gestionarImagenAlGuardar } from '../../../../Utils/imageUtils';
import { FiDollarSign, FiInfo, FiTag } from 'react-icons/fi';

export interface ProductFormPageProps {
  mode?: 'create' | 'edit';
}

function generarCodigoProducto(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dd = pad(now.getDate());
  const mm = pad(now.getMonth() + 1);
  const yy = String(now.getFullYear()).slice(-2);
  const HH = pad(now.getHours());
  const MM = pad(now.getMinutes());
  const SS = pad(now.getSeconds());
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `PROD-${dd}${mm}${yy}${HH}${MM}${SS}${ms}`;
}

const EMPTY_FORM: Partial<ProductoSelectDto> = {
  codigo: '',
  sku: '',
  nombre: '',
  descripcion: '',
  precioVenta: 0,
  factorConversion: 1,
  stockMinimo: 0,
  rutaImagen: '',
  publicIdImagen: '',
  idCategoria: 0,
  idProveedor: 0,
  idMarca: 0,
  idUnidadMedida: 0,
};

export const ProductFormPage: React.FC<ProductFormPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = mode === 'edit' || Boolean(id);

  const [formState, setFormState] = useState<Partial<ProductoSelectDto>>(EMPTY_FORM);
  const [categorias, setCategorias] = useState<CategoriaSelectDto[]>([]);
  const [marcas, setMarcas] = useState<MarcaSelectDto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedidaSelectDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUploadRef = useRef<ImageUploadHandle>(null);
  const originalPublicIdRef = useRef<string>('');
  const originalRutaRef = useRef<string>('');

  useEffect(() => {
    const loadCatalogsAndProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cats, marcs, provs, unis] = await Promise.all([
          CategoriaService.getCategorias(),
          MarcaService.getMarcas(),
          ProveedorService.getProveedores(),
          UnidadMedidaService.getUnidades(),
        ]);
        setCategorias(cats.filter(c => c.estado !== false));
        setMarcas(marcs.filter(m => m.estado !== false));
        setProveedores(provs.filter(p => p.estado));
        setUnidades(unis.filter(u => u.estado));

        if (isEditing && id) {
          const detail = await ProductoService.getProductoById(Number(id));
          setFormState(detail);
          originalPublicIdRef.current = detail.publicIdImagen || '';
          originalRutaRef.current = detail.rutaImagen || '';
        } else {
          const codigo = generarCodigoProducto();
          setFormState({
            ...EMPTY_FORM,
            codigo,
            idCategoria: cats[0]?.id ?? 0,
            idMarca: marcs[0]?.id ?? 0,
            idProveedor: provs[0]?.id ?? 0,
            idUnidadMedida: unis[0]?.id ?? 0,
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos del producto');
      } finally {
        setLoading(false);
      }
    };

    loadCatalogsAndProduct();
  }, [id, isEditing]);

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);

    try {
      const pending = imageUploadRef.current?.getPendingFile();
      const { ruta: rutaImagen, publicId: publicIdImagen } = await gestionarImagenAlGuardar({
        pendingFile: pending?.file ?? null,
        rutaFormulario: formState.rutaImagen,
        publicIdFormulario: formState.publicIdImagen,
        rutaOriginal: originalRutaRef.current,
        publicIdOriginal: originalPublicIdRef.current,
        esEdicion: isEditing,
      });

      if (!isEditing) {
        const payload: ProductoInsertDto = {
          codigo: formState.codigo || generarCodigoProducto(),
          sku: formState.sku || '',
          nombre: formState.nombre || '',
          descripcion: formState.descripcion,
          precioVenta: Number(formState.precioVenta) || 0,
          factorConversion: Number(formState.factorConversion) || 1,
          stockMinimo: Number(formState.stockMinimo) || 0,
          rutaImagen: rutaImagen || undefined,
          publicIdImagen: publicIdImagen || undefined,
          idCategoria: Number(formState.idCategoria),
          idProveedor: Number(formState.idProveedor),
          idMarca: Number(formState.idMarca),
          idUnidadMedida: Number(formState.idUnidadMedida),
        };
        await ProductoService.createProducto(payload);
      } else if (id) {
        const payload: ProductoUpdateDto = {
          id: Number(id),
          codigo: formState.codigo || '',
          sku: formState.sku || '',
          nombre: formState.nombre || '',
          descripcion: formState.descripcion,
          precioVenta: Number(formState.precioVenta) || 0,
          factorConversion: Number(formState.factorConversion) || 1,
          stockMinimo: Number(formState.stockMinimo) || 0,
          rutaImagen: rutaImagen || undefined,
          publicIdImagen: publicIdImagen || undefined,
          idCategoria: Number(formState.idCategoria),
          idProveedor: Number(formState.idProveedor),
          idMarca: Number(formState.idMarca),
          idUnidadMedida: Number(formState.idUnidadMedida),
        };
        await ProductoService.updateProducto(payload);
      }

      imageUploadRef.current?.clearPending();
      navigate('/admin/inventario/productos');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Cargando datos del producto...
      </div>
    );
  }

  return (
    <AdminFormPageLayout
      title={isEditing ? `Editar Producto: ${formState.nombre || ''}` : 'Nuevo Producto'}
      subtitle={isEditing ? `Código: ${formState.codigo || ''}` : 'Ingresa la información general, precios e imagen del nuevo producto'}
      backTo="/admin/inventario/productos"
      onSave={handleSubmit}
      saving={saving}
      saveLabel={isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
    >
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* ── Section 1: Información General + foto ── */}
      <div className="erp-form-card">
        <h3 className="erp-form-card-title">
          <FiInfo />
          <span>Información General</span>
        </h3>
        <div className="erp-form-with-photo">
          <div className="erp-form-fields">
            <div className="erp-form-row">
              <div className="erp-form-group">
                <label className="erp-form-label">Código (Generado)</label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.codigo || ''}
                  onChange={e => setFormState(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="PROD-..."
                  disabled={isEditing}
                />
              </div>
              <div className="erp-form-group">
                <label className="erp-form-label">Código SKU</label>
                <input
                  type="text"
                  className="erp-input"
                  value={formState.sku || ''}
                  onChange={e => setFormState(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Ej: SKU-001"
                />
              </div>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Nombre del Producto <span className="required-star">*</span></label>
              <input
                type="text"
                className="erp-input"
                value={formState.nombre || ''}
                onChange={e => setFormState(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Lapicero Azul Faber Castell"
                required
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Descripción Detallada</label>
              <textarea
                className="erp-input"
                rows={3}
                value={formState.descripcion || ''}
                onChange={e => setFormState(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción, características o especificaciones..."
              />
            </div>
          </div>

          <div className="erp-form-photo-col">
            <ImageUpload
              ref={imageUploadRef}
              value={formState.rutaImagen}
              onChange={ruta => setFormState(prev => ({ ...prev, rutaImagen: ruta }))}
              folder="productos"
              label="Fotografía del producto"
              compact
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Clasificación y Proveedor ── */}
      <div className="erp-form-card">
        <h3 className="erp-form-card-title">
          <FiTag />
          <span>Clasificación y Proveedor</span>
        </h3>
        <div className="erp-form-fields">
          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Categoría <span className="required-star">*</span></label>
              <select
                className="erp-input"
                value={formState.idCategoria || ''}
                onChange={e => setFormState(prev => ({ ...prev, idCategoria: Number(e.target.value) }))}
                required
              >
                <option value="">Seleccione categoría</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Marca <span className="required-star">*</span></label>
              <select
                className="erp-input"
                value={formState.idMarca || ''}
                onChange={e => setFormState(prev => ({ ...prev, idMarca: Number(e.target.value) }))}
                required
              >
                <option value="">Seleccione marca</option>
                {marcas.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Proveedor <span className="required-star">*</span></label>
              <select
                className="erp-input"
                value={formState.idProveedor || ''}
                onChange={e => setFormState(prev => ({ ...prev, idProveedor: Number(e.target.value) }))}
                required
              >
                <option value="">Seleccione proveedor</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.razonSocial}</option>
                ))}
              </select>
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Unidad de Medida <span className="required-star">*</span></label>
              <select
                className="erp-input"
                value={formState.idUnidadMedida || ''}
                onChange={e => setFormState(prev => ({ ...prev, idUnidadMedida: Number(e.target.value) }))}
                required
              >
                <option value="">Seleccione unidad</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Precios, Factores y Stock ── */}
      <div className="erp-form-card">
        <h3 className="erp-form-card-title">
          <FiDollarSign />
          <span>Precios y Control de Stock</span>
        </h3>
        <div className="erp-form-fields">
          <div className="erp-form-row">
            <div className="erp-form-group">
              <label className="erp-form-label">Precio de Venta (S/) <span className="required-star">*</span></label>
              <input
                type="number"
                step="0.01"
                className="erp-input"
                value={formState.precioVenta ?? 0}
                onChange={e => setFormState(prev => ({ ...prev, precioVenta: Number(e.target.value) }))}
                required
              />
            </div>
            <div className="erp-form-group">
              <label className="erp-form-label">Factor de Conversión</label>
              <input
                type="number"
                step="0.01"
                className="erp-input"
                value={formState.factorConversion ?? 1}
                onChange={e => setFormState(prev => ({ ...prev, factorConversion: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="erp-form-group">
            <label className="erp-form-label">Stock Mínimo</label>
            <input
              type="number"
              className="erp-input"
              value={formState.stockMinimo ?? 0}
              onChange={e => setFormState(prev => ({ ...prev, stockMinimo: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>
    </AdminFormPageLayout>
  );
};

export default ProductFormPage;
