/**
 * Formatea una fecha ISO a formato legible en español
 */
export const formatDate = (isoString: string): string => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formatea una fecha ISO a fecha y hora
 */
export const formatDateTime = (isoString: string): string => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea un número a moneda peruana (PEN)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Trunca texto con elipsis si supera maxLength
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

/**
 * Genera un ID único simple basado en timestamp
 */
export const generateId = (): string => {
  return `u${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
};

/**
 * Devuelve la fecha/hora actual en formato ISO
 */
export const nowISO = (): string => new Date().toISOString();

/**
 * Compara dos fechas ISO: retorna true si `date` está dentro del rango [from, to]
 */
export const isInDateRange = (date: string, from?: string, to?: string): boolean => {
  if (!from && !to) return true;
  const d = new Date(date).getTime();
  if (from && new Date(from).getTime() > d) return false;
  if (to) {
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);
    if (toEnd.getTime() < d) return false;
  }
  return true;
};
