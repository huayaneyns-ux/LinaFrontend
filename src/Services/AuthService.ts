import { api } from './apiService';
import type { Usuario } from '../Types/Usuario';

interface LoginRequest {
  usuario: string;
  contrasena: string;
}

function normalizeUsuario(raw: Record<string, unknown>): Usuario {
  return {
    id: String(raw.id ?? ''),
    username: String(raw.username ?? ''),
    nombres: String(raw.nombres ?? ''),
    apellidos: String(raw.apellidos ?? ''),
    rol: (String(raw.rol ?? 'CLIENTE').toUpperCase()) as Usuario['rol'],
    email: String(raw.email ?? ''),
    estado: (String(raw.estado ?? 'ACTIVO').toUpperCase()) as Usuario['estado'],
    sucursal: String(raw.sucursal ?? ''),
    telefono: raw.telefono ? String(raw.telefono) : undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  };
}

export const AuthService = {
  async login(usuario: string, contrasena: string): Promise<Usuario> {
    const payload: LoginRequest = { usuario, contrasena };
    const data = await api.request<Record<string, unknown>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeUsuario(data);
  },
};
