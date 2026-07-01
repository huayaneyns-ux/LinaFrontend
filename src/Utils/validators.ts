export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const required = (value: string): ValidationResult => {
  if (!value || !value.trim()) return { valid: false, message: 'Este campo es obligatorio' };
  return { valid: true };
};

export const minLength = (value: string, min: number): ValidationResult => {
  if (value.trim().length < min) return { valid: false, message: `Mínimo ${min} caracteres` };
  return { valid: true };
};

export const maxLength = (value: string, max: number): ValidationResult => {
  if (value.trim().length > max) return { valid: false, message: `Máximo ${max} caracteres` };
  return { valid: true };
};

export const isEmail = (value: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return { valid: false, message: 'Ingresa un correo válido' };
  return { valid: true };
};

export const isPhoneNumber = (value: string): ValidationResult => {
  if (!value) return { valid: true }; // opcional
  const phoneRegex = /^[9][0-9]{8}$/;
  if (!phoneRegex.test(value)) return { valid: false, message: 'Ingresa un número de celular válido (9 dígitos)' };
  return { valid: true };
};

export const isUsername = (value: string): ValidationResult => {
  const usernameRegex = /^[a-z0-9._]{3,20}$/;
  if (!usernameRegex.test(value))
    return { valid: false, message: 'Solo minúsculas, números, puntos o guiones bajos (3–20 chars)' };
  return { valid: true };
};

/**
 * Valida un formulario completo. Retorna un objeto de errores por campo.
 */
export type FormErrors<T> = Partial<Record<keyof T, string>>;

export const validateUsuarioForm = (data: {
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  password?: string;
  sucursal: string;
  rol: string;
  estado: string;
  telefono?: string;
}, isCreating: boolean): FormErrors<typeof data> => {
  const errors: FormErrors<typeof data> = {};

  const usernameResult = isUsername(data.username);
  if (!usernameResult.valid) errors.username = usernameResult.message;

  const nombresResult = required(data.nombres);
  if (!nombresResult.valid) errors.nombres = nombresResult.message;
  else {
    const lenResult = minLength(data.nombres, 2);
    if (!lenResult.valid) errors.nombres = lenResult.message;
  }

  const apellidosResult = required(data.apellidos);
  if (!apellidosResult.valid) errors.apellidos = apellidosResult.message;
  else {
    const lenResult = minLength(data.apellidos, 2);
    if (!lenResult.valid) errors.apellidos = lenResult.message;
  }

  const emailResult = isEmail(data.email);
  if (!emailResult.valid) errors.email = emailResult.message;

  if (isCreating) {
    const pwResult = required(data.password ?? '');
    if (!pwResult.valid) errors.password = 'La contraseña es obligatoria al crear';
    else {
      const lenResult = minLength(data.password ?? '', 6);
      if (!lenResult.valid) errors.password = lenResult.message;
    }
  }

  const sucursalResult = required(data.sucursal);
  if (!sucursalResult.valid) errors.sucursal = sucursalResult.message;

  if (data.telefono) {
    const phoneResult = isPhoneNumber(data.telefono);
    if (!phoneResult.valid) errors.telefono = phoneResult.message;
  }

  return errors;
};
