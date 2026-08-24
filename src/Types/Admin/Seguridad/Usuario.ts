
// =======================================
// RESPUESTA LISTAR / OBTENER USUARIO
// GET api/Usuario/Lista
// GET api/Usuario/{id}
// =======================================

export interface UsuarioSelectDto {
  id: number;
  nombreApellido: string;
  dni: string;
  sexo?: string;
  telefono?: string;
  correo: string;
  idRol: number;
  rol: string;
  estado: boolean;
}



// =======================================
// GUARDAR USUARIO
// POST api/Usuario/Guardar
// INSERTAR / ACTUALIZAR
// =======================================

export interface UsuarioGuardarDto {

  idUsuario?: number | null;

  nombreApellido: string;

  dni: string;

  sexo?: string;

  telefono?: string | null;

  correo: string;

  contrasena?: string;

  idRol: number;

  estado: boolean;
}



// =======================================
// ELIMINAR USUARIO
// DELETE api/Usuario/Eliminar/{id}
// =======================================

export interface UsuarioEliminarDto {
  idUsuario: number;
}