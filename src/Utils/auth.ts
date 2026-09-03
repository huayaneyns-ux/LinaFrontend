import type { Usuario } from '../Types/Usuario';

export function getNumericUserId(usuario: Usuario | null | undefined): number | null {
  if (!usuario?.id) {
    return null;
  }

  const parsed = Number(usuario.id);
  if (!Number.isNaN(parsed) && parsed > 0) {
    return parsed;
  }

  const cleaned = String(usuario.id).replace(/\D/g, '');
  if (!cleaned) {
    return null;
  }

  const fallback = Number(cleaned);
  return Number.isNaN(fallback) || fallback <= 0 ? null : fallback;
}
