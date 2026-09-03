import { useMemo, useState } from 'react';
import CrudDialog from '../../../../../Components/ERP/CrudDialog';
import FormField from '../../../../../Components/ERP/FormField';
import SearchInput from '../../../../../Components/ERP/SearchInput';
import {
  departamentos,
  distritos,
  getDistrictsByProvince,
  getProvincesByDepartment,
} from '../../../../../Utils/ubigeo';
import type {
  LiquidacionCompraDisponibleDto,
  LiquidacionCompraFormData,
} from '../../../../../Types/Admin/Comprobantes/Comprobante';

interface Props {
  isOpen: boolean;
  comprasDisponibles: LiquidacionCompraDisponibleDto[];
  loading: boolean;
  onClose: () => void;
  onGenerate: (data: LiquidacionCompraFormData) => Promise<boolean | null>;
}

type LocationForm = {
  departmentId: string;
  provinceId: string;
  districtUbigeo: string;
  address: string;
  codigoEstablecimiento?: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const formatAmount = (amount: number) => `S/ ${amount.toFixed(2)}`;

const emptyLocation: LocationForm = {
  departmentId: '',
  provinceId: '',
  districtUbigeo: '',
  address: '',
  codigoEstablecimiento: '0000',
};

const NewComprobanteLiquidacionDialog = ({ isOpen, comprasDisponibles, loading, onClose, onGenerate }: Props) => {
  const [search, setSearch] = useState('');
  const [selectedCompraId, setSelectedCompraId] = useState<number>(0);
  const [fechaEmision, setFechaEmision] = useState(today());
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [observaciones, setObservaciones] = useState('');
  const [sellerLocation, setSellerLocation] = useState<LocationForm>(emptyLocation);
  const [pointOfSale, setPointOfSale] = useState<LocationForm>(emptyLocation);
  const [error, setError] = useState('');

  const filteredCompras = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return comprasDisponibles;
    return comprasDisponibles.filter((compra) =>
      [compra.codigo, compra.fechaCompra, compra.vendedor.nombre, compra.vendedor.numeroDocumento]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [comprasDisponibles, search]);

  const selectedCompra = useMemo(
    () => comprasDisponibles.find((compra) => compra.compraId === selectedCompraId) || null,
    [comprasDisponibles, selectedCompraId],
  );

  const sellerProvinces = useMemo(
    () => getProvincesByDepartment(sellerLocation.departmentId),
    [sellerLocation.departmentId],
  );
  const sellerDistricts = useMemo(
    () => getDistrictsByProvince(sellerLocation.provinceId, sellerLocation.departmentId),
    [sellerLocation.departmentId, sellerLocation.provinceId],
  );
  const pointProvinces = useMemo(
    () => getProvincesByDepartment(pointOfSale.departmentId),
    [pointOfSale.departmentId],
  );
  const pointDistricts = useMemo(
    () => getDistrictsByProvince(pointOfSale.provinceId, pointOfSale.departmentId),
    [pointOfSale.departmentId, pointOfSale.provinceId],
  );

  const selectCompra = (compraId: number) => {
    const compra = comprasDisponibles.find((item) => item.compraId === compraId);
    setSelectedCompraId(compraId);
    setError('');
    if (!compra) return;

    const ubigeo = compra.ubicacionVendedor?.distritoId
      ? distritos.find((item) => item.id === String(compra.ubicacionVendedor?.distritoId))
      : undefined;

    const sellerDistrict = ubigeo || distritos.find((item) => item.name === compra.ubicacionVendedor?.distrito);

    setSellerLocation({
      departmentId: sellerDistrict?.department_id || '',
      provinceId: sellerDistrict?.province_id || '',
      districtUbigeo: sellerDistrict?.id || '',
      address: compra.ubicacionVendedor?.direccion || '',
      codigoEstablecimiento: '0000',
    });
  };

  const reset = () => {
    setSearch('');
    setSelectedCompraId(0);
    setFechaEmision(today());
    setMoneda('PEN');
    setObservaciones('');
    setSellerLocation(emptyLocation);
    setPointOfSale(emptyLocation);
    setError('');
  };

  const validate = () => {
    if (!selectedCompra) return 'Debe seleccionar una compra.';
    if (!sellerLocation.districtUbigeo || !sellerLocation.address.trim()) return 'La ubicación del vendedor es obligatoria.';
    if (!pointOfSale.districtUbigeo || !pointOfSale.address.trim()) return 'El punto de venta es obligatorio.';
    if (!fechaEmision) return 'La fecha de emisión es obligatoria.';
    return '';
  };

  const handleGenerate = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!selectedCompra) return;

    const success = await onGenerate({
      compraOrigenId: selectedCompra.compraId,
      fechaEmision,
      moneda,
      observaciones,
      vendedor: selectedCompra.vendedor,
      ubicacionVendedor: {
        distritoId: 0,
        codigoUbigeo: sellerLocation.districtUbigeo,
        direccion: sellerLocation.address,
      },
      puntoVenta: {
        distritoId: 0,
        codigoUbigeo: pointOfSale.districtUbigeo,
        direccion: pointOfSale.address,
        codigoEstablecimiento: pointOfSale.codigoEstablecimiento || '0000',
      },
    });

    if (success) {
      reset();
      onClose();
    }
  };

  return (
    <CrudDialog
      isOpen={isOpen}
      mode="create"
      onClose={() => {
        reset();
        onClose();
      }}
      onConfirm={() => void handleGenerate()}
      title="Nueva Liquidación de Compra"
      subtitle="Emite una liquidación a partir de una compra registrada"
      confirmLabel="Emitir liquidación"
      loading={loading}
      size="xl"
    >
      <div style={{ display: 'grid', gap: '20px' }}>
        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Compra origen</h3>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código, fecha o vendedor..." />
          <select className="erp-input" style={{ marginTop: '8px' }} value={selectedCompraId || ''} onChange={(event) => selectCompra(Number(event.target.value))}>
            <option value="">Seleccionar compra</option>
            {filteredCompras.map((compra) => (
              <option key={compra.compraId} value={compra.compraId}>
                {compra.codigo} · {compra.vendedor.nombre} · {formatAmount(compra.total)}
              </option>
            ))}
          </select>
        </section>

        {selectedCompra && (
          <section style={{ padding: '16px', borderRadius: '6px', background: 'var(--erp-surface)', border: '1px solid var(--erp-border)' }}>
            <div className="erp-form-grid">
              <FormField label="Documento vendedor"><input className="erp-input" readOnly value={`${selectedCompra.vendedor.tipoDocumento} ${selectedCompra.vendedor.numeroDocumento}`} /></FormField>
              <FormField label="Nombre vendedor"><input className="erp-input" readOnly value={selectedCompra.vendedor.nombre} /></FormField>
              <FormField label="Fecha compra"><input className="erp-input" readOnly value={selectedCompra.fechaCompra} /></FormField>
              <FormField label="Total"><input className="erp-input" readOnly value={formatAmount(selectedCompra.total)} /></FormField>
            </div>
          </section>
        )}

        <section className="erp-form-grid">
          <FormField label="Fecha de emisión" required>
            <input className="erp-input" type="date" value={fechaEmision} onChange={(event) => setFechaEmision(event.target.value)} />
          </FormField>
          <FormField label="Moneda" required>
            <select className="erp-input" value={moneda} onChange={(event) => setMoneda(event.target.value as 'PEN' | 'USD')}>
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
            </select>
          </FormField>
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Ubicación del vendedor</h3>
          <div className="erp-form-grid">
            <FormField label="Departamento" required>
              <select className="erp-input" value={sellerLocation.departmentId} onChange={(event) => setSellerLocation((prev) => ({ ...prev, departmentId: event.target.value, provinceId: '', districtUbigeo: '' }))}>
                <option value="">Seleccionar</option>
                {departamentos.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="Provincia" required>
              <select className="erp-input" value={sellerLocation.provinceId} onChange={(event) => setSellerLocation((prev) => ({ ...prev, provinceId: event.target.value, districtUbigeo: '' }))}>
                <option value="">Seleccionar</option>
                {sellerProvinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="Distrito" required>
              <select className="erp-input" value={sellerLocation.districtUbigeo} onChange={(event) => setSellerLocation((prev) => ({ ...prev, districtUbigeo: event.target.value }))}>
                <option value="">Seleccionar</option>
                {sellerDistricts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="Dirección" required>
              <input className="erp-input" value={sellerLocation.address} onChange={(event) => setSellerLocation((prev) => ({ ...prev, address: event.target.value }))} />
            </FormField>
          </div>
        </section>

        <section>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Punto de venta</h3>
          <div className="erp-form-grid">
            <FormField label="Departamento" required>
              <select className="erp-input" value={pointOfSale.departmentId} onChange={(event) => setPointOfSale((prev) => ({ ...prev, departmentId: event.target.value, provinceId: '', districtUbigeo: '' }))}>
                <option value="">Seleccionar</option>
                {departamentos.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="Provincia" required>
              <select className="erp-input" value={pointOfSale.provinceId} onChange={(event) => setPointOfSale((prev) => ({ ...prev, provinceId: event.target.value, districtUbigeo: '' }))}>
                <option value="">Seleccionar</option>
                {pointProvinces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="Distrito" required>
              <select className="erp-input" value={pointOfSale.districtUbigeo} onChange={(event) => setPointOfSale((prev) => ({ ...prev, districtUbigeo: event.target.value }))}>
                <option value="">Seleccionar</option>
                {pointDistricts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </FormField>
            <FormField label="Dirección" required>
              <input className="erp-input" value={pointOfSale.address} onChange={(event) => setPointOfSale((prev) => ({ ...prev, address: event.target.value }))} />
            </FormField>
            <FormField label="Código establecimiento">
              <input className="erp-input" value={pointOfSale.codigoEstablecimiento || '0000'} onChange={(event) => setPointOfSale((prev) => ({ ...prev, codigoEstablecimiento: event.target.value }))} />
            </FormField>
          </div>
        </section>

        {selectedCompra && (
          <section>
            <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Detalle de compra</h3>
            <div className="erp-table-wrapper">
              <table className="erp-table">
                <thead>
                  <tr><th>Producto</th><th>Código</th><th>Cantidad</th><th>Precio</th><th>Importe</th></tr>
                </thead>
                <tbody>
                  {selectedCompra.detalle.map((item) => (
                    <tr key={`${item.productoId}-${item.codigo}`}>
                      <td>{item.descripcion}</td>
                      <td>{item.codigo}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatAmount(item.precioUnitario)}</td>
                      <td>{formatAmount(item.importe)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <FormField label="Observaciones">
          <textarea className="erp-input" rows={3} value={observaciones} onChange={(event) => setObservaciones(event.target.value)} />
        </FormField>

        {error && <div style={{ color: 'var(--erp-danger)', fontSize: '12px' }}>{error}</div>}
      </div>
    </CrudDialog>
  );
};

export default NewComprobanteLiquidacionDialog;
