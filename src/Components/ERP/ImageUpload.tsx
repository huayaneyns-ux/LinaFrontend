import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { FiUpload, FiImage, FiX } from 'react-icons/fi';

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface ImageUploadHandle {
  /** Devuelve el File pendiente (si hay uno) para que el padre lo suba en handleSave */
  getPendingFile: () => { file: File; filename: string; folder: string } | null;
  /** Limpia el archivo pendiente (llamar después de un save exitoso) */
  clearPending: () => void;
}

interface ImageUploadProps {
  /** Ruta actual guardada en BD (ej: "images/productos/PROD-12072026.png") */
  value?: string;
  /**
   * Se llama apenas el usuario selecciona la imagen.
   * Recibe la ruta generada (sin subir aún) para que el padre la guarde en formState.
   */
  onChange: (rutaGenerada: string) => void;
  disabled?: boolean;
  folder?: 'productos' | 'categorias' | 'marcas';
  label?: string;
  /** Modo compacto: no envuelve en erp-form-group col-span-2, ocupa todo el espacio disponible */
  compact?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PREFIXES: Record<string, string> = {
  productos: 'PROD',
  categorias: 'CAT',
  marcas: 'MAR',
};

/** Genera nombre único: PREFIX-DDMMYYYYHHMMSS.ext */
function generateFilename(file: File, folder: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const ts =
    `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const ext = file.name.substring(file.name.lastIndexOf('.'));
  const prefix = PREFIXES[folder] ?? 'IMG';
  return `${prefix}-${ts}${ext}`;
}

/** Convierte la ruta almacenada en una URL visualizable */
function resolvePreviewUrl(val?: string): string | null {
  if (!val) return null;
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  const clean = val.startsWith('/') ? val : `/${val}`;
  return `https://localhost:7146${clean}`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

const ImageUpload = forwardRef<ImageUploadHandle, ImageUploadProps>(
  ({ value, onChange, disabled = false, folder = 'productos', label = 'Imagen', compact = false }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Archivo seleccionado (aún no subido)
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingFilename, setPendingFilename] = useState<string>('');
    // URL local para preview (sin necesidad de subir)
    const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);

    // Expone métodos al padre
    useImperativeHandle(ref, () => ({
      getPendingFile: () =>
        pendingFile ? { file: pendingFile, filename: pendingFilename, folder } : null,
      clearPending: () => {
        setPendingFile(null);
        setPendingFilename('');
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
        setPreviewObjectUrl(null);
      },
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Limpiar URL previa
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

      // Generar nombre y ruta
      const filename = generateFilename(file, folder);
      const ruta = `images/${folder}/${filename}`;

      // Guardar archivo pendiente
      setPendingFile(file);
      setPendingFilename(filename);

      // Vista previa local (sin subir)
      setPreviewObjectUrl(URL.createObjectURL(file));

      // Notificar al padre con la ruta generada para que la guarde en formState
      onChange(ruta);

      // Limpiar el input para permitir volver a seleccionar el mismo archivo
      if (inputRef.current) inputRef.current.value = '';
    };

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      setPendingFile(null);
      setPendingFilename('');
      setPreviewObjectUrl(null);
      onChange('');
    };

    // Vista previa: primero ObjectURL local, luego ruta de BD
    const previewSrc = previewObjectUrl ?? resolvePreviewUrl(value);
    const hasImage = !!previewSrc;

    return (
      <div className={compact ? undefined : 'erp-form-group col-span-2'} style={compact ? { width: '100%' } : undefined}>
        {!compact && <label className="erp-form-label">{label}</label>}

        {/* Input file oculto */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={disabled}
        />

        {/* Zona clicable */}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && !disabled && inputRef.current?.click()}
          style={{
            display: 'flex',
            flexDirection: compact ? 'column' : 'row',
            alignItems: compact ? 'stretch' : 'center',
            gap: compact ? '10px' : '16px',
            padding: compact ? '10px' : '12px',
            border: `2px dashed ${hasImage ? 'var(--erp-primary, #6366f1)' : 'var(--erp-border, #cbd5e1)'}`,
            borderRadius: '10px',
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            backgroundColor: 'var(--erp-bg-secondary, #f8fafc)',
            transition: 'border-color 0.2s, background 0.2s',
          }}
        >
          {/* Imagen / Placeholder */}
          <div style={{ position: 'relative', width: compact ? '100%' : '80px', height: compact ? '100px' : '80px', flexShrink: 0 }}>
            {hasImage ? (
              <>
                <img
                  src={previewSrc!}
                  alt="Vista previa"
                  style={{
                    width: '100%',
                    height: compact ? '100px' : '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--erp-border, #cbd5e1)',
                  }}
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 80 80\'%3E%3Crect width=\'80\' height=\'80\' fill=\'%23f1f5f9\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%2394a3b8\' font-size=\'28\'%3E📷%3C/text%3E%3C/svg%3E';
                  }}
                />
                {/* Botón X */}
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      lineHeight: 1,
                      boxShadow: '0 1px 4px rgba(0,0,0,.25)',
                    }}
                    title="Quitar imagen"
                  >
                    <FiX />
                  </button>
                )}
              </>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: compact ? '100px' : '80px',
                  borderRadius: '8px',
                  border: '1px dashed var(--erp-border, #cbd5e1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f1f5f9',
                  color: '#94a3b8',
                }}
              >
                <FiImage size={28} />
              </div>
            )}
          </div>

          {/* Texto */}
          <div style={{ flex: 1 }}>
            {pendingFile ? (
              <>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--erp-text-primary)' }}>
                  {pendingFilename}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--erp-text-muted)' }}>
                  {(pendingFile.size / 1024).toFixed(1)} KB · Se guardará al presionar Guardar
                </p>
              </>
            ) : hasImage ? (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--erp-text-secondary)' }}>
                Haz clic para cambiar la imagen
              </p>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--erp-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUpload size={14} /> Seleccionar imagen
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--erp-text-muted)' }}>
                  JPG, PNG, WEBP · La imagen se guardará al presionar Guardar
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;

// ─── Función helper para subir el archivo (llamar desde handleSave del padre) ─

/**
 * Sube el archivo pendiente a la carpeta correcta en el servidor.
 * Llamar ANTES de guardar el registro en la BD.
 *
 * @param file    File obtenido de imageUploadRef.current.getPendingFile()
 * @param filename Nombre generado (ej: PROD-12072026153045.png)
 * @param folder  'productos' | 'marcas' | 'categorias'
 * @returns       La ruta guardada (ej: images/productos/PROD-12072026153045.png)
 */
export async function uploadImageFile(
  file: File,
  filename: string,
  folder: string
): Promise<string> {
  const formData = new FormData();
  // Se envía el archivo con el nombre generado
  formData.append('file', file, filename);
  formData.append('carpeta', folder);

  const API_BASE = 'https://localhost:7146/api';

  // Intentar endpoint principal
  const res = await fetch(`${API_BASE}/Archivo/Upload`, {
    method: 'POST',
    body: formData,
  });

  if (res.ok) {
    try {
      const json = await res.json();
      // El backend puede devolver: { filePath, ruta, path, url } - probamos todos
      return (
        json.filePath ??
        json.ruta ??
        json.path ??
        json.url ??
        `images/${folder}/${filename}`
      );
    } catch {
      return `images/${folder}/${filename}`;
    }
  }

  // Si el endpoint no existe (404) aún no está implementado en backend:
  // lanzamos error descriptivo
  throw new Error(
    `No se pudo subir la imagen. El endpoint /api/Archivo/Upload respondió ${res.status}. ` +
    `Verifica que el controlador esté registrado en el backend.`
  );
}
