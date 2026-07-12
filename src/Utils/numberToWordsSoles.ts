const UNIDADES = [
  '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
];
const DIEZ = [
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
  'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
];
const DECENAS = [
  '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
  'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
];
const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
];

function hasta99(n: number): string {
  if (n === 0) return '';
  if (n < 10) return UNIDADES[n];
  if (n < 20) return DIEZ[n - 10];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (d === 2 && u > 0) return `VEINTI${u === 1 ? 'UN' : UNIDADES[u]}`;
  return u === 0 ? DECENAS[d] : `${DECENAS[d]} Y ${UNIDADES[u]}`;
}

function hasta999(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const r = n % 100;
  const cent = c > 0 ? CENTENAS[c] : '';
  const rest = hasta99(r);
  return [cent, rest].filter(Boolean).join(' ');
}

function hasta999999(n: number): string {
  if (n === 0) return 'CERO';
  const miles = Math.floor(n / 1000);
  const rest = n % 1000;
  const partMiles = miles === 1
    ? 'MIL'
    : miles > 1
      ? `${hasta999(miles)} MIL`
      : '';
  const partRest = hasta999(rest);
  return [partMiles, partRest].filter(Boolean).join(' ').trim();
}

export function totalEnLetras(total: number): string {
  const entero = Math.floor(total);
  const centavos = Math.round((total - entero) * 100);
  const letras = hasta999999(entero);
  return `SON: ${letras} CON ${String(centavos).padStart(2, '0')}/100 SOLES`;
}
