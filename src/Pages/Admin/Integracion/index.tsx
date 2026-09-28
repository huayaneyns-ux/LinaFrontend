import { useCallback, useEffect, useState } from 'react';
import { FiCopy, FiPlus, FiRefreshCw, FiSave } from 'react-icons/fi';
import { StatusBadge } from '../../../Components/ERP/StatusBadge';
import { IntegracionService } from '../../../Services/Admin/Integracion';
import type { IntegracionConfiguracion } from '../../../Types/Admin/Integracion';
import './Integracion.css';

const emptyCompany: IntegracionConfiguracion = { id: 0, nombreEmpresa: '', descripcion: '', apiKey: '', estado: true };
const normalize = (value: Partial<IntegracionConfiguracion> | null | undefined): IntegracionConfiguracion => ({
  id: Number(value?.id ?? 0), nombreEmpresa: typeof value?.nombreEmpresa === 'string' ? value.nombreEmpresa : '',
  descripcion: typeof value?.descripcion === 'string' ? value.descripcion : '', apiKey: typeof value?.apiKey === 'string' ? value.apiKey : '', estado: value?.estado !== false,
});

const IntegracionPage = () => {
  const [companies, setCompanies] = useState<IntegracionConfiguracion[]>([]);
  const [company, setCompany] = useState(emptyCompany);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setMessage('');
    try {
      const items = await IntegracionService.getCompanies();
      setCompanies(Array.isArray(items) ? items.map(normalize) : []);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo cargar integración.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const update = (field: keyof IntegracionConfiguracion, value: string | boolean) => setCompany(current => ({ ...current, [field]: value }));
  const create = async () => {
    if (!company.nombreEmpresa.trim()) return;
    setSaving(true); setMessage('');
    try { await IntegracionService.createCompany({ ...company, nombreEmpresa: company.nombreEmpresa.trim() }); setMessage('Empresa creada y clave generada correctamente.'); setCompany(emptyCompany); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo crear la empresa.'); }
    finally { setSaving(false); }
  };

  return <div className="erp-module-page integration-page">
    <div className="erp-page-header"><div className="erp-page-header-heading"><div><h1 className="erp-page-header-title">Integración de sistemas</h1><p className="erp-page-header-subtitle">Administra empresas externas, sus claves y las peticiones recibidas.</p></div><button className="erp-btn erp-btn-sm erp-btn-secondary" onClick={() => void load()} disabled={loading}><FiRefreshCw /> Actualizar</button></div></div>
    {message && <div className="erp-alert erp-alert-info">{message}</div>}

    <section className="integration-section"><div className="integration-section-heading"><div><h2>Agregar empresa</h2><p>Crea una empresa externa y genera su clave privada de integración.</p></div><FiPlus /></div><div className="integration-form"><label>Nombre de la empresa<input value={company.nombreEmpresa} onChange={e => update('nombreEmpresa', e.target.value)} placeholder="Ej. Sistema del socio" /></label><label>Descripción<input value={company.descripcion ?? ''} onChange={e => update('descripcion', e.target.value)} placeholder="Descripción opcional" /></label><label className="integration-check"><input type="checkbox" checked={company.estado} onChange={e => update('estado', e.target.checked)} /> Integración activa</label></div><button className="erp-btn erp-btn-primary" disabled={saving || !company.nombreEmpresa.trim()} onClick={() => void create()}><FiSave /> {saving ? 'Creando...' : 'Crear empresa y generar clave'}</button></section>

    <section className="integration-section"><div className="integration-section-heading"><div><h2>Empresas configuradas</h2><p>Cada empresa tiene una clave `X-Integration-Key` independiente.</p></div></div><div className="integration-company-list">{companies.map(item => <div className="integration-company-row" key={item.id}><div><strong>{item.nombreEmpresa}</strong><span>{item.descripcion || 'Sin descripción'}</span></div><StatusBadge status={item.estado ? 'ACTIVO' : 'INACTIVO'} label={item.estado ? 'ACTIVA' : 'INACTIVA'} showText /><div className="integration-key"><code>{item.apiKey}</code><button type="button" className="erp-btn erp-btn-sm erp-btn-secondary" onClick={() => navigator.clipboard?.writeText(item.apiKey)}><FiCopy /> Copiar</button></div></div>)}{!loading && companies.length === 0 && <div className="integration-empty">No hay empresas configuradas.</div>}</div></section>

  </div>;
};

export default IntegracionPage;
