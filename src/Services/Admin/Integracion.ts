import { api } from '../../Services/apiService';
import type { IntegracionAuditoria, IntegracionConfiguracion } from '../../Types/Admin/Integracion';

export const IntegracionService = {
  getConfig: () => api.request<IntegracionConfiguracion | null>('/Integracion/configuracion', { method: 'GET' }),
  getCompanies: () => api.request<IntegracionConfiguracion[]>('/Integracion/empresas', { method: 'GET' }),
  createCompany: (data: Omit<IntegracionConfiguracion, 'id'>) => api.request<IntegracionConfiguracion>('/Integracion/empresas', { method: 'POST', body: JSON.stringify(data) }),
  saveConfig: (data: Omit<IntegracionConfiguracion, 'id'>) => api.request<number>('/Integracion/configuracion', { method: 'PUT', body: JSON.stringify(data) }),
  getAudit: () => api.request<IntegracionAuditoria[]>('/Integracion/auditoria', { method: 'GET' }),
};
