export interface ProductoSelectDto {
    id: number;
    codigo: string;
    sku: string;
    nombre: string;
    descripcion?: string;

    precioVenta: number;
    factorConversion?: number;
    stockMinimo: number;
    stock: number;

    rutaImagen?: string;
    publicIdImagen?: string;
    estado: boolean;

    // Categoría
    idCategoria: number;
    categoria: string;

    // Proveedor
    idProveedor: number;
    ruc: string;
    razonSocial: string;
    nombreContacto: string;
    telefono: string;

    // Marca
    idMarca: number;
    marca: string;

    // Unidad de medida
    idUnidadMedida: number;
    unidadMedida: string;
    abreviatura: string;
}

export interface ProductoInsertDto {
    codigo: string;
    sku: string;
    nombre: string;
    descripcion?: string;

    precioVenta: number;
    factorConversion?: number;
    stockMinimo: number;

    rutaImagen?: string;
    publicIdImagen?: string;

    idCategoria: number;
    idProveedor: number;
    idMarca: number;
    idUnidadMedida: number;
}

export interface ProductoUpdateDto {
    id: number;

    codigo: string;
    sku: string;
    nombre: string;
    descripcion?: string;

    precioVenta: number;
    factorConversion?: number;
    stockMinimo: number;

    rutaImagen?: string;
    publicIdImagen?: string;

    idCategoria: number;
    idProveedor: number;
    idMarca: number;
    idUnidadMedida: number;
}

export interface ProductoDeleteDto {
    id: number;
}