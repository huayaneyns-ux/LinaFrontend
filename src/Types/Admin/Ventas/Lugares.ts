//=========================================
// DEPARTAMENTOS
//=========================================

export interface DepartamentoDto {
  id: number;

  nombre: string;
}


//=========================================
// PROVINCIAS
//=========================================

export interface ProvinciaDto {
  id: number;

  nombre: string;

  idDepartamento: number;
}


//=========================================
// DISTRITOS
//=========================================

export interface DistritoDto {
  id: number;

  nombre: string;

  idProvincia: number;
}

//=========================================
// DIRECCION LISTAR
//=========================================

export interface DireccionDto {

  id: number;

  nombreDireccion: string;

  referencia: string;


  idDistrito: number;

  distrito: string;


  idProvincia: number;

  provincia: string;


  idDepartamento: number;

  departamento: string;


  esPrincipal: boolean;
}



//=========================================
// INSERTAR DIRECCION
//=========================================

export interface DireccionInsertDto {

  idUsuario: number;

  nombreDireccion: string;

  referencia: string;

  idDistrito: number;

  esPrincipal: boolean;
}



//=========================================
// CAMBIAR DIRECCION PRINCIPAL
//=========================================

export interface DireccionPrincipalDto {

  idUsuario: number;

  idDireccion: number;
}