import type { DialogMode } from '../../../../Hooks/useDialog';
import type { Usuario, UsuarioFormData, EstadoUsuario, RolUsuario } from '../../../../Types/Usuario';
import { useState, useEffect } from 'react';
import FormField from '../../../../Components/ERP/FormField';
import { StatusBadge, RoleBadge } from '../../../../Components/ERP/StatusBadge';
import { validateUsuarioForm } from '../../../../Utils/validators';
import { formatDateTime } from '../../../../Utils/formatters';
import { SUCURSALES } from '../../../../Constantes/Data/MockData';
import '../../../../Styles/ERP/erp-form.css';

const ROLES: RolUsuario[] = ['ADMINISTRADOR', 'SUPERVISOR', 'TRABAJADOR', 'CAJERO', 'CLIENTE'];
const ESTADOS: EstadoUsuario[] = ['ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE'];

const EMPTY_FORM: UsuarioFormData = {
  username: '',
  nombres: '',
  apellidos: '',
  email: '',
  rol: 'TRABAJADOR',
  estado: 'ACTIVO',
  sucursal: '',
  telefono: '',
  password: '',
};

interface UsersFormProps {
  mode: DialogMode;
  record: Usuario | null;
  onDataChange: (data: UsuarioFormData) => void;
  onErrorsChange: (hasErrors: boolean) => void;
}

const UsersForm = ({ mode, record, onDataChange, onErrorsChange }: UsersFormProps) => {
  const isView = mode === 'view';
  const isCreating = mode === 'create';

  const [formData, setFormData] = useState<UsuarioFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof UsuarioFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof UsuarioFormData, boolean>>>({});

  // Initialize form data from record on open
  useEffect(() => {
    if (record && mode !== 'create') {
      setFormData({
        username: record.username,
        nombres: record.nombres,
        apellidos: record.apellidos,
        email: record.email,
        rol: record.rol,
        estado: record.estado,
        sucursal: record.sucursal,
        telefono: record.telefono ?? '',
        password: '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
    setTouched({});
  }, [record, mode]);

  const validate = (data: UsuarioFormData) => {
    return validateUsuarioForm(data, isCreating);
  };

  const handleChange = (field: keyof UsuarioFormData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setTouched(prev => ({ ...prev, [field]: true }));

    const newErrors = validate(updated);
    setErrors(newErrors);
    onErrorsChange(Object.keys(newErrors).length > 0);
    onDataChange(updated);
  };

  const getInputClass = (field: keyof UsuarioFormData) => {
    if (!touched[field]) return 'erp-form-input';
    return `erp-form-input${errors[field] ? ' has-error' : ''}`;
  };

  const getSelectClass = (field: keyof UsuarioFormData) => {
    if (!touched[field]) return 'erp-form-select';
    return `erp-form-select${errors[field] ? ' has-error' : ''}`;
  };

  // VIEW MODE — read-only display
  if (isView && record) {
    return (
      <div className="erp-form-grid">
        <p className="erp-form-section-title">Información de acceso</p>
        <hr className="erp-form-divider" />

        <div className="erp-view-field">
          <label className="erp-form-label">Username</label>
          <div className="erp-view-value" style={{ fontWeight: 600 }}>@{record.username}</div>
        </div>
        <div className="erp-view-field">
          <label className="erp-form-label">Email</label>
          <div className="erp-view-value">{record.email}</div>
        </div>

        <p className="erp-form-section-title">Información personal</p>
        <hr className="erp-form-divider" />

        <div className="erp-view-field">
          <label className="erp-form-label">Nombres</label>
          <div className="erp-view-value">{record.nombres}</div>
        </div>
        <div className="erp-view-field">
          <label className="erp-form-label">Apellidos</label>
          <div className="erp-view-value">{record.apellidos}</div>
        </div>
        <div className="erp-view-field">
          <label className="erp-form-label">Teléfono</label>
          <div className="erp-view-value">{record.telefono ?? '—'}</div>
        </div>
        <div className="erp-view-field">
          <label className="erp-form-label">Sucursal</label>
          <div className="erp-view-value">{record.sucursal}</div>
        </div>

        <p className="erp-form-section-title">Rol y estado</p>
        <hr className="erp-form-divider" />

        <div className="erp-view-field">
          <label className="erp-form-label">Rol</label>
          <div className="erp-view-value"><RoleBadge role={record.rol} /></div>
        </div>
        <div className="erp-view-field">
          <label className="erp-form-label">Estado</label>
          <div className="erp-view-value"><StatusBadge status={record.estado} /></div>
        </div>

        <p className="erp-form-section-title">Auditoría</p>
        <hr className="erp-form-divider" />

        <div className="erp-view-field">
          <label className="erp-form-label">Creado el</label>
          <div className="erp-view-value">{formatDateTime(record.createdAt)}</div>
        </div>
        <div className="erp-view-field">
          <label className="erp-form-label">Última actualización</label>
          <div className="erp-view-value">{formatDateTime(record.updatedAt)}</div>
        </div>
      </div>
    );
  }

  // CREATE / EDIT MODE — editable fields
  return (
    <div className="erp-form-grid">
      <p className="erp-form-section-title">Información de acceso</p>
      <hr className="erp-form-divider" />

      <FormField label="Username" required error={touched.username ? errors.username : undefined}>
        <input
          type="text"
          className={getInputClass('username')}
          value={formData.username}
          onChange={e => handleChange('username', e.target.value)}
          placeholder="ej. jperez"
          autoComplete="off"
          id="field-username"
        />
      </FormField>

      <FormField label="Email" required error={touched.email ? errors.email : undefined}>
        <input
          type="email"
          className={getInputClass('email')}
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          placeholder="correo@lina.pe"
          autoComplete="off"
          id="field-email"
        />
      </FormField>

      {isCreating && (
        <FormField label="Contraseña" required error={touched.password ? errors.password : undefined}>
          <input
            type="password"
            className={getInputClass('password')}
            value={formData.password}
            onChange={e => handleChange('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            id="field-password"
          />
        </FormField>
      )}

      <p className="erp-form-section-title col-span-2">Información personal</p>
      <hr className="erp-form-divider" />

      <FormField label="Nombres" required error={touched.nombres ? errors.nombres : undefined}>
        <input
          type="text"
          className={getInputClass('nombres')}
          value={formData.nombres}
          onChange={e => handleChange('nombres', e.target.value)}
          placeholder="Nombres completos"
          id="field-nombres"
        />
      </FormField>

      <FormField label="Apellidos" required error={touched.apellidos ? errors.apellidos : undefined}>
        <input
          type="text"
          className={getInputClass('apellidos')}
          value={formData.apellidos}
          onChange={e => handleChange('apellidos', e.target.value)}
          placeholder="Apellidos completos"
          id="field-apellidos"
        />
      </FormField>

      <FormField label="Teléfono" error={touched.telefono ? errors.telefono : undefined}>
        <input
          type="tel"
          className={getInputClass('telefono')}
          value={formData.telefono}
          onChange={e => handleChange('telefono', e.target.value)}
          placeholder="9XXXXXXXX"
          maxLength={9}
          id="field-telefono"
        />
      </FormField>

      <FormField label="Sucursal" required error={touched.sucursal ? errors.sucursal : undefined}>
        <select
          className={getSelectClass('sucursal')}
          value={formData.sucursal}
          onChange={e => handleChange('sucursal', e.target.value)}
          id="field-sucursal"
        >
          <option value="">Seleccionar sucursal...</option>
          {SUCURSALES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FormField>

      <p className="erp-form-section-title col-span-2">Rol y estado</p>
      <hr className="erp-form-divider" />

      <FormField label="Rol" required>
        <select
          className="erp-form-select"
          value={formData.rol}
          onChange={e => handleChange('rol', e.target.value as RolUsuario)}
          id="field-rol"
        >
          {ROLES.map(r => (
            <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Estado" required>
        <select
          className="erp-form-select"
          value={formData.estado}
          onChange={e => handleChange('estado', e.target.value as EstadoUsuario)}
          id="field-estado"
        >
          {ESTADOS.map(e => (
            <option key={e} value={e}>{e.charAt(0) + e.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </FormField>
    </div>
  );
};

export default UsersForm;
