import { useCallback, useEffect, useState } from 'react';
import { FiAlertCircle, FiCheck, FiChevronLeft, FiChevronRight, FiCopy, FiDownload, FiPlus, FiRefreshCw, FiSave, FiSearch, FiTrash2 } from 'react-icons/fi';
import { StatusBadge } from '../../../Components/ERP/StatusBadge';
import { IntegracionService } from '../../../Services/Admin/Integracion';
import type { IntegracionCatalogoAdmin, IntegracionConfiguracion } from '../../../Types/Admin/Integracion';
import './Integracion.css';

const emptyCompany: IntegracionConfiguracion = { id: 0, nombreEmpresa: '', descripcion: '', apiKey: '', estado: true, dominioEndpoint: '', apiKeyExterna: '' };
const normalize = (value: Partial<IntegracionConfiguracion> | null | undefined): IntegracionConfiguracion => ({
  id: Number(value?.id ?? 0), nombreEmpresa: typeof value?.nombreEmpresa === 'string' ? value.nombreEmpresa : '',
  descripcion: typeof value?.descripcion === 'string' ? value.descripcion : '', apiKey: typeof value?.apiKey === 'string' ? value.apiKey : '', estado: value?.estado !== false,
  dominioEndpoint: typeof value?.dominioEndpoint === 'string' ? value.dominioEndpoint : '',
  apiKeyExterna: typeof value?.apiKeyExterna === 'string' ? value.apiKeyExterna : '',
});

const IntegracionPage = () => {
  const [companies, setCompanies] = useState<IntegracionConfiguracion[]>([]);
  const [company, setCompany] = useState(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [catalog, setCatalog] = useState<IntegracionCatalogoAdmin | null>(null);
  const [catalogSaving, setCatalogSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [providerPage, setProviderPage] = useState(1);
  const [externalLoading, setExternalLoading] = useState<number | null>(null);
  const [externalResult, setExternalResult] = useState<{ company: string; tipo: string; cantidad: number } | null>(null);
  const [activeSection, setActiveSection] = useState<'administrar' | 'consultar'>('administrar');
  const pageSize = 8;

  const load = useCallback(async () => {
    setLoading(true); setMessage('');
    try {
      const items = await IntegracionService.getCompanies();
      const normalized = Array.isArray(items) ? items.map(normalize) : [];
      setCompanies(normalized);
      if (selectedCompanyId && normalized.some(item => item.id === selectedCompanyId)) void loadCatalog(selectedCompanyId);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cargar integración.'); }
    finally { setLoading(false); }
  }, []);
  const loadCatalog = async (companyId: number) => { setSelectedCompanyId(companyId); setCatalog(null); setProductSearch(''); setProviderSearch(''); setProductPage(1); setProviderPage(1); try { setCatalog(await IntegracionService.getCatalog(companyId)); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cargar el catálogo.'); } };
  const saveCatalog = async () => { if (!selectedCompanyId || !catalog) return; setCatalogSaving(true); try { const result = await IntegracionService.saveCatalog(selectedCompanyId, { productoIds: catalog.productos.filter(x => x.seleccionado).map(x => x.id), proveedorIds: catalog.proveedores.filter(x => x.seleccionado).map(x => x.id) }); setCatalog(result); setMessage('Selección de productos y proveedores guardada.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar la selección.'); } finally { setCatalogSaving(false); } };
  const toggleProduct = (id: number) => setCatalog(current => current ? ({ ...current, productos: current.productos.map(item => item.id === id ? { ...item, seleccionado: !item.seleccionado } : item) }) : current);
  const toggleProvider = (id: number) => setCatalog(current => current ? ({ ...current, proveedores: current.proveedores.map(item => item.id === id ? { ...item, seleccionado: !item.seleccionado } : item) }) : current);
  const filteredProducts = catalog?.productos.filter(item => `${item.nombre ?? ''} ${item.codigo ?? ''} ${item.sku ?? ''} ${item.empresaOrigen ?? ''}`.toLowerCase().includes(productSearch.toLowerCase().trim())) ?? [];
  const filteredProviders = catalog?.proveedores.filter(item => `${item.razonSocial ?? ''} ${item.ruc ?? ''} ${item.empresaOrigen ?? ''}`.toLowerCase().includes(providerSearch.toLowerCase().trim())) ?? [];
  const productPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const providerPages = Math.max(1, Math.ceil(filteredProviders.length / pageSize));
  const visibleProducts = filteredProducts.slice((productPage - 1) * pageSize, productPage * pageSize);
  const visibleProviders = filteredProviders.slice((providerPage - 1) * pageSize, providerPage * pageSize);
  useEffect(() => { void load(); }, [load]);

  const update = (field: keyof IntegracionConfiguracion, value: string | boolean) => setCompany(current => ({ ...current, [field]: value }));
  const create = async () => {
    if (!company.nombreEmpresa.trim()) return;
    setSaving(true); setMessage('');
    try { await IntegracionService.createCompany({ ...company, nombreEmpresa: company.nombreEmpresa.trim() }); setMessage('Empresa creada y clave generada correctamente.'); setCompany(emptyCompany); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo crear la empresa.'); }
    finally { setSaving(false); }
  };
  const consultarExterna = async (item: IntegracionConfiguracion, tipo: 'PRODUCTOS' | 'PROVEEDORES' | 'CLIENTES') => {
    setErrorMessage(''); setMessage(''); setExternalResult(null);
    if (!item.dominioEndpoint?.trim() || !item.apiKeyExterna?.trim()) {
      setErrorMessage('No se puede traer ' + tipo.toLowerCase() + ' de ' + item.nombreEmpresa + ': configura el dominio y la API key externa.');
      return;
    }
    setExternalLoading(item.id);
    try {
      const result = await IntegracionService.consultarExterna(item.id, tipo);
      setExternalResult({ company: item.nombreEmpresa, tipo, cantidad: result.guardados ?? result.productos.length + result.proveedores.length + (result.clientes?.length ?? 0) });
      setMessage(`Petición de ${tipo.toLowerCase()} realizada: ${result.guardados ?? result.productos.length + result.proveedores.length} registros guardados en la BD.`);
    } catch (error) { setErrorMessage('No se pudieron traer ' + tipo.toLowerCase() + ' de ' + item.nombreEmpresa + ': ' + (error instanceof Error ? error.message : 'error de comunicación con la empresa externa.')); }
    finally { setExternalLoading(null); }
  };
  const updateExternalField = (id: number, field: 'dominioEndpoint' | 'apiKeyExterna', value: string) =>
    setCompanies(current => current.map(item => item.id === id ? { ...item, [field]: value } : item));
  const saveExternalConfig = async (item: IntegracionConfiguracion) => {
    try {
      await IntegracionService.updateCompany(item.id, item);
      setMessage('Configuración externa de ' + item.nombreEmpresa + ' guardada.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar la configuración externa.'); }
  };
  const deleteCompany = async (item: IntegracionConfiguracion) => {
    if (!window.confirm('¿Desactivar la empresa "' + item.nombreEmpresa + '"?')) return;
    try {
      await IntegracionService.deleteCompany(item.id);
      setCompanies(current => current.filter(companyItem => companyItem.id !== item.id));
      if (selectedCompanyId === item.id) { setSelectedCompanyId(null); setCatalog(null); }
      setMessage('Empresa desactivada correctamente.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo desactivar la empresa.'); }
  };

  return <div className="erp-module-page integration-page">
    <div className="erp-page-header"><div className="erp-page-header-heading"><div><h1 className="erp-page-header-title">Integración de sistemas</h1><p className="erp-page-header-subtitle">Administra empresas externas, sus claves y las peticiones recibidas.</p></div><button className="erp-btn erp-btn-sm erp-btn-secondary" onClick={() => void load()} disabled={loading}><FiRefreshCw /> Actualizar</button></div></div>
    {message && <div className="erp-alert erp-alert-info">{message}</div>}
    {errorMessage && <div className="integration-error-alert"><FiAlertCircle /><span>{errorMessage}</span></div>}
    <nav className="integration-module-tabs" aria-label="Secciones de integración">
      <button type="button" className={activeSection === 'administrar' ? 'is-active' : ''} onClick={() => setActiveSection('administrar')}>
        <FiSave /> Empresas y catálogo
      </button>
      <button type="button" className={activeSection === 'consultar' ? 'is-active' : ''} onClick={() => setActiveSection('consultar')}>
        <FiDownload /> Consultar empresas
      </button>
    </nav>
    {activeSection === 'administrar' && selectedCompanyId && companies.find(item => item.id === selectedCompanyId) && <div className="integration-selected-actions"><span>Empresa seleccionada: <strong>{companies.find(item => item.id === selectedCompanyId)?.nombreEmpresa}</strong></span><button type="button" className="erp-btn erp-btn-sm erp-btn-danger" onClick={() => { const item = companies.find(companyItem => companyItem.id === selectedCompanyId); if (item) void deleteCompany(item); }}><FiTrash2 /> Eliminar empresa</button></div>}

    {activeSection === 'administrar' && <><section className="integration-section"><div className="integration-section-heading"><div><h2>Agregar empresa</h2><p>Crea una empresa y genera su clave para que pueda recibir información.</p></div><FiPlus /></div><div className="integration-form"><label>Nombre de la empresa<input value={company.nombreEmpresa} onChange={e => update('nombreEmpresa', e.target.value)} placeholder="Ej. Sistema del socio" /></label><label>Descripción<input value={company.descripcion ?? ''} onChange={e => update('descripcion', e.target.value)} placeholder="Descripción opcional" /></label><label className="integration-check"><input type="checkbox" checked={company.estado} onChange={e => update('estado', e.target.checked)} /> Integración activa</label></div><button className="erp-btn erp-btn-primary" disabled={saving || !company.nombreEmpresa.trim()} onClick={() => void create()}><FiSave /> {saving ? 'Creando...' : 'Crear empresa y generar clave'}</button></section>

    <section className="integration-section"><div className="integration-section-heading"><div><h2>Empresas configuradas</h2><p>Selecciona una empresa para administrar los registros que recibirá por GET.</p></div></div><div className="integration-company-list">{companies.map(item => <div className={`integration-company-row ${selectedCompanyId === item.id ? 'is-selected' : ''}`} key={item.id} onClick={() => void loadCatalog(item.id)}><div><strong>{item.nombreEmpresa}</strong><span>{item.descripcion || 'Sin descripción'}</span></div><StatusBadge status={item.estado ? 'ACTIVO' : 'INACTIVO'} label={item.estado ? 'ACTIVA' : 'INACTIVA'} showText /><div className="integration-key"><code>{item.apiKey}</code><button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" onClick={e => { e.stopPropagation(); void navigator.clipboard?.writeText(item.apiKey); }}><FiCopy /> Copiar</button></div></div>)}{!loading && companies.length === 0 && <div className="integration-empty">No hay empresas configuradas.</div>}</div></section>

    {selectedCompanyId && catalog && <section className="integration-section"><div className="integration-section-heading"><div><h2>Catálogo autorizado</h2><p>Los registros entregados se mantienen marcados y no volverán a salir en el endpoint para esta empresa.</p></div><button className="erp-btn erp-btn-primary" disabled={catalogSaving} onClick={() => void saveCatalog()}><FiSave /> {catalogSaving ? 'Guardando...' : 'Guardar selección'}</button></div><div className="integration-catalog-block"><div className="integration-catalog-heading"><h3>Productos <small>{catalog.productos.filter(x => x.seleccionado).length} seleccionados · {catalog.productos.length} disponibles</small></h3><label className="integration-search"><FiSearch /><input value={productSearch} onChange={e => { setProductSearch(e.target.value); setProductPage(1); }} placeholder="Buscar por nombre, código o empresa..." /></label></div><div className="integration-table-wrap"><table className="integration-catalog-table"><thead><tr><th>Sel.</th><th>Producto</th><th>Código / SKU</th><th>Empresa origen</th><th>Exposición</th></tr></thead><tbody>{visibleProducts.map(item => <tr className={item.entregado ? 'is-delivered' : ''} key={item.id}><td><input type="checkbox" checked={item.seleccionado} onChange={() => toggleProduct(item.id)} /></td><td><strong>{item.nombre || 'Sin nombre'}</strong></td><td>{item.codigo || '—'}{item.sku ? ` / ${item.sku}` : ''}</td><td>{item.empresaOrigen || '—'}</td><td>{item.entregado ? <span className="integration-delivered"><FiCheck /> Ya enviado</span> : <span className="integration-pending">Pendiente</span>}</td></tr>)}</tbody></table>{filteredProducts.length === 0 && <div className="integration-empty">No se encontraron productos.</div>}</div><div className="integration-pagination"><span>Mostrando {visibleProducts.length} de {filteredProducts.length}</span><button className="erp-btn erp-btn-sm erp-btn-secondary" disabled={productPage <= 1} onClick={() => setProductPage(page => page - 1)}><FiChevronLeft /> Anterior</button><strong>Página {Math.min(productPage, productPages)} de {productPages}</strong><button className="erp-btn erp-btn-sm erp-btn-secondary" disabled={productPage >= productPages} onClick={() => setProductPage(page => page + 1)}>Siguiente <FiChevronRight /></button></div></div><div className="integration-catalog-block"><div className="integration-catalog-heading"><h3>Proveedores <small>{catalog.proveedores.filter(x => x.seleccionado).length} seleccionados · {catalog.proveedores.length} disponibles</small></h3><label className="integration-search"><FiSearch /><input value={providerSearch} onChange={e => { setProviderSearch(e.target.value); setProviderPage(1); }} placeholder="Buscar por razón social, RUC o empresa..." /></label></div><div className="integration-table-wrap"><table className="integration-catalog-table"><thead><tr><th>Sel.</th><th>Razón social</th><th>RUC</th><th>Empresa origen</th><th>Exposición</th></tr></thead><tbody>{visibleProviders.map(item => <tr className={item.entregado ? 'is-delivered' : ''} key={item.id}><td><input type="checkbox" checked={item.seleccionado} onChange={() => toggleProvider(item.id)} /></td><td><strong>{item.razonSocial || 'Sin razón social'}</strong></td><td>{item.ruc || '—'}</td><td>{item.empresaOrigen || '—'}</td><td>{item.entregado ? <span className="integration-delivered"><FiCheck /> Ya enviado</span> : <span className="integration-pending">Pendiente</span>}</td></tr>)}</tbody></table>{filteredProviders.length === 0 && <div className="integration-empty">No se encontraron proveedores.</div>}</div><div className="integration-pagination"><span>Mostrando {visibleProviders.length} de {filteredProviders.length}</span><button className="erp-btn erp-btn-sm erp-btn-secondary" disabled={providerPage <= 1} onClick={() => setProviderPage(page => page - 1)}><FiChevronLeft /> Anterior</button><strong>Página {Math.min(providerPage, providerPages)} de {providerPages}</strong><button className="erp-btn erp-btn-sm erp-btn-secondary" disabled={providerPage >= providerPages} onClick={() => setProviderPage(page => page + 1)}>Siguiente <FiChevronRight /></button></div></div></section>}

    </>}

    {activeSection === 'consultar' && <section className="integration-section"><div className="integration-section-heading"><div><h2>Consultar otra empresa</h2><p>Configura el dominio base y realiza peticiones manuales. Cada botón consulta y guarda los registros en la BD.</p></div><FiDownload /></div><div className="integration-external-list">{companies.map(item => <div className="integration-external-row" key={item.id}><div className="integration-external-config"><strong>{item.nombreEmpresa}</strong><label>Dominio<input value={item.dominioEndpoint ?? ''} onChange={e => updateExternalField(item.id, 'dominioEndpoint', e.target.value)} placeholder="https://j-s-acabados.onrender.com" /></label><label>API key externa<input type="password" value={item.apiKeyExterna ?? ''} onChange={e => updateExternalField(item.id, 'apiKeyExterna', e.target.value)} placeholder="Clave del sistema externo" /></label><button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" onClick={() => void saveExternalConfig(item)}><FiSave /> Guardar conexión</button></div><div className="integration-fetch-actions"><button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" disabled={externalLoading === item.id} onClick={() => void consultarExterna(item, 'PRODUCTOS')}><FiDownload /> Traer productos</button><button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" disabled={externalLoading === item.id} onClick={() => void consultarExterna(item, 'PROVEEDORES')}><FiDownload /> Traer proveedores</button><button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" disabled={externalLoading === item.id} onClick={() => void consultarExterna(item, 'CLIENTES')}><FiDownload /> Traer clientes</button></div></div>)}</div>{externalResult && <div className="integration-external-result"><FiCheck /> Última consulta: {externalResult.company} · {externalResult.tipo.toLowerCase()} recibidos: {externalResult.cantidad}</div>}</section>}

  </div>;
};

export default IntegracionPage;
