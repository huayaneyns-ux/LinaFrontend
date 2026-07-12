/**
 * Configuración de redes sociales.
 * Para TikTok: pega el link completo del video o solo el ID numérico.
 * Ej: https://www.tiktok.com/@usuario/video/7299302834234678529
 */
export const REDES_SOCIALES = {
  tiktok: {
    perfil: 'https://www.tiktok.com/@evapartis',
    video: 'https://www.tiktok.com/@evapartis/video/7496308754497948933',
  },
  instagram: 'https://www.instagram.com/librerialina',
  facebook: 'https://www.facebook.com/librerialina',
  whatsapp: '51999999999',
};

/** Extrae el ID numérico de un link o string de TikTok */
export function extractTikTokVideoId(input: string): string {
  if (!input.trim()) return '';
  const match = input.match(/video\/(\d+)/);
  if (match) return match[1];
  if (/^\d+$/.test(input.trim())) return input.trim();
  return '';
}
