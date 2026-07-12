const API_BASE = 'https://localhost:7146';

export function resolveImageUrl(path?: string | null): string | null {
  if (!path || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${clean}`;
}

export function hasImage(path?: string | null): boolean {
  return !!path && path.trim() !== '';
}
