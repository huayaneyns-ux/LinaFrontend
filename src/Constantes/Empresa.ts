export const EMPRESA = {
  nombre: 'LIBRERÍA LINA',
  razonSocial: 'COMERCIAL LINA S.A.C.',
  ruc: '10096646971',
  codigoLocalAnexo: '0000',
  tituloComprobante: 'COMPROBANTE DE PAGO',
  direccionCompleta: 'Av. Principal 123, Distrito Comercial, Lima',
  telefono: '999999999',
  web: 'www.librerialina.com',
  logoPath: '/images/marcas/logo_lina.png',
  sunatConfig: {
    personaId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUNAT_PERSONA_ID) || '6a87fa0a0eb85700214637ca',
    personaToken: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUNAT_PERSONA_TOKEN) || 'DEV_j0tTPUTYC2wNmUQxaSxKKZK4Q3hJnqCkFJ46ChN4CEYjCNqhzwhPTKjALohNHuyl',
    apiUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUNAT_API_URL) || 'https://back.apisunat.com/personas/v1/sendBill',
    isProduction: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUNAT_PRODUCTION === 'true') || false,
  },
};

