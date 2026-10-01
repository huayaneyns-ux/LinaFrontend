import { api } from '../../Services/apiService';
import type { IntegracionAuditoria, IntegracionCatalogoAdmin, IntegracionConfiguracion, IntegracionConsultaExterna } from '../../Types/Admin/Integracion';

export const IntegracionService = {
  getConfig: () => api.request<IntegracionConfiguracion | null>('/Integracion/configuracion', { method: 'GET' }),
  getCompanies: () => api.request<IntegracionConfiguracion[]>('/Integracion/empresas', { method: 'GET' }),
  createCompany: (data: Omit<IntegracionConfiguracion, 'id'>) => api.request<IntegracionConfiguracion>('/Integracion/empresas', { method: 'POST', body: JSON.stringify(data) }),
  updateCompany: (companyId: number, data: Omit<IntegracionConfiguracion, 'id'>) => api.request<number>(`/Integracion/empresas/${companyId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCompany: (companyId: number) => api.request<void>(`/Integracion/empresas/${companyId}`, { method: 'DELETE' }),
  saveConfig: (data: Omit<IntegracionConfiguracion, 'id'>) => api.request<number>('/Integracion/configuracion', { method: 'PUT', body: JSON.stringify(data) }),
  consultarExterna: (companyId: number, tipo: 'PRODUCTOS' | 'PROVEEDORES' | 'CLIENTES') => api.request<IntegracionConsultaExterna>(`/Integracion/empresas/${companyId}/consultar/${tipo}`, { method: 'POST' }),
  getAudit: () => api.request<IntegracionAuditoria[]>('/Integracion/auditoria', { method: 'GET' }),
  getCatalog: (companyId: number) => api.request<IntegracionCatalogoAdmin>(`/Integracion/empresas/${companyId}/catalogo`, { method: 'GET' }),
  saveCatalog: (companyId: number, data: { productoIds: number[]; proveedorIds: number[] }) => api.request<IntegracionCatalogoAdmin>(`/Integracion/empresas/${companyId}/catalogo`, { method: 'PUT', body: JSON.stringify(data) }),
};
