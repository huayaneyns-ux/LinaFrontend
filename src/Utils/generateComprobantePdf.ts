import { jsPDF } from 'jspdf';
import type { CajaClienteDto } from '../Types/Admin/Ventas/Caja';
import type { ProductoSelectDto } from '../Types/Admin/Inventario/Producto';
import type { MetodoPagoSelectDto } from '../Types/Admin/Ventas/MetodoPago';
import { EMPRESA } from '../Constantes/Empresa';
import { totalEnLetras } from './numberToWordsSoles';

const RECEIPT_WIDTH = 80;
const MARGIN = 4;
const RIGHT = RECEIPT_WIDTH - MARGIN;
const CONTENT_W = RECEIPT_WIDTH - MARGIN * 2;
const COL_CANT = 44;
const COL_UNIT = 58;
const MONEY_COL_LEFT = 62;

interface CartItemPdf {
  producto: ProductoSelectDto;
  cantidad: number;
}

interface PagoPdf {
  idMetodoPago: number;
  monto: number;
  codigoOperacion?: string;
}

interface ComprobanteData {
  idVenta: number;
  cliente: CajaClienteDto;
  vendedor: string;
  items: CartItemPdf[];
  subtotal: number;
  igv: number;
  total: number;
  pagos: PagoPdf[];
  metodos: MetodoPagoSelectDto[];
  fecha?: Date;
}

function formatFilename(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yy = String(date.getFullYear()).slice(-2);
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `COMPROBANTE-LINA-${dd}${mm}${yy}${hh}${min}`;
}

function metodoNombre(id: number, metodos: MetodoPagoSelectDto[]): string {
  return metodos.find(m => m.id === id)?.nombre ?? `Método #${id}`;
}

function drawMoney(
  doc: jsPDF,
  y: number,
  n: number,
  size: number,
  bold = false,
) {
  doc.setFontSize(size);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.text('S/', MONEY_COL_LEFT, y);
  doc.text(n.toFixed(2), RIGHT, y, { align: 'right' });
}

function drawMoneyAt(
  doc: jsPDF,
  y: number,
  n: number,
  colRight: number,
  size: number,
) {
  doc.setFontSize(size);
  doc.setFont('helvetica', 'normal');
  doc.text('S/', colRight - 11, y);
  doc.text(n.toFixed(2), colRight, y, { align: 'right' });
}

interface LoadedImage {
  data: string;
  format: 'PNG' | 'JPEG' | 'WEBP';
}

function detectImageFormat(blob: Blob, dataUrl: string): LoadedImage['format'] | null {
  if (blob.type === 'image/jpeg' || blob.type === 'image/jpg') return 'JPEG';
  if (blob.type === 'image/webp') return 'WEBP';
  if (blob.type === 'image/png') return 'PNG';

  const base64 = dataUrl.split(',')[1] ?? '';
  if (base64.startsWith('/9j/')) return 'JPEG';
  if (base64.startsWith('iVBORw0KGgo')) return 'PNG';
  if (base64.startsWith('UklGR')) return 'WEBP';
  return null;
}

async function loadImageBase64(url: string): Promise<LoadedImage | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const blob = await response.blob();
    if (!blob.type.startsWith('image/') && blob.size < 100) return null;

    const dataUrl = await new Promise<string | null>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });

    if (!dataUrl) return null;

    const format = detectImageFormat(blob, dataUrl);
    if (!format) return null;

    return { data: dataUrl, format };
  } catch {
    return null;
  }
}

function estimateHeight(data: ComprobanteData, hasLogo: boolean): number {
  const base = hasLogo ? 155 : 135;
  const perItem = 14;
  const perPago = 10;
  return base + data.items.length * perItem + data.pagos.length * perPago + 28;
}

function lineStep(size: number, tight = false): number {
  return tight ? size * 0.32 + 0.9 : size * 0.38 + 1.5;
}

export async function downloadComprobantePdf(data: ComprobanteData): Promise<string> {
  const fecha = data.fecha ?? new Date();
  const filename = formatFilename(fecha);
  const logo = await loadImageBase64(EMPRESA.logoPath);
  const pageH = estimateHeight(data, !!logo);

  const doc = new jsPDF({ unit: 'mm', format: [RECEIPT_WIDTH, pageH] });
  let y = MARGIN + 1;
  const cx = RECEIPT_WIDTH / 2;
  const pad = (n: number) => String(n).padStart(2, '0');

  const separator = () => {
    y += 1.5;
    doc.setDrawColor(130, 130, 130);
    doc.setLineWidth(0.05);
    let x = MARGIN;
    const dashLen = 1.4;
    const gapLen = 1.2;
    while (x < RIGHT) {
      doc.line(x, y, Math.min(x + dashLen, RIGHT), y);
      x += dashLen + gapLen;
    }
    y += 3.5;
  };

  const center = (text: string, size: number, bold = false, tight = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    lines.forEach(line => {
      doc.text(line, cx, y, { align: 'center' });
      y += lineStep(size, tight);
    });
  };

  const left = (text: string, size = 7, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    lines.forEach(line => {
      doc.text(line, MARGIN, y);
      y += lineStep(size);
    });
  };

  const inline = (label: string, value: string, size = 7) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} `, MARGIN, y);
    const labelW = doc.getTextWidth(`${label} `);
    doc.setFont('helvetica', 'normal');
    doc.text(value, MARGIN + labelW, y);
    y += lineStep(size);
  };

  const totalRow = (label: string, amount: number, size = 7, bold = false) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.text(label, MARGIN, y);
    drawMoney(doc, y, amount, size, bold);
    y += lineStep(size);
  };

  if (logo) {
    try {
      const logoW = 46;
      const logoH = 14;
      doc.addImage(logo.data, logo.format, cx - logoW / 2, y, logoW, logoH);
      y += logoH + 2.5;
    } catch {
      center(EMPRESA.nombre, 10, true, true);
    }
  } else {
    center(EMPRESA.nombre, 10, true, true);
  }

  center(EMPRESA.tituloComprobante, 7.5, true, true);
  y += 0.5;
  center(EMPRESA.direccionCompleta, 6, false, true);
  center(EMPRESA.telefono, 6, false, true);
  center(EMPRESA.web, 6, false, true);
  separator();

  const fechaStr = `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${String(fecha.getFullYear()).slice(-2)} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
  inline('FECHA:', fechaStr);
  inline('Nº COMPROBANTE:', String(data.idVenta));
  y += 0.5;
  inline('CLIENTE:', `${data.cliente.nombreApellido}    DNI: ${data.cliente.dni}`);
  inline('VENDEDOR:', data.vendedor);
  separator();

  center('DETALLE DE PRODUCTOS', 7, true, true);
  y += 0.8;

  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTO', MARGIN, y);
  doc.text('CANT.', COL_CANT, y, { align: 'right' });
  doc.text('P.UNIT.', COL_UNIT, y, { align: 'right' });
  doc.text('SUBTOTAL', RIGHT, y, { align: 'right' });
  y += lineStep(6) + 0.8;

  data.items.forEach(item => {
    const sub = item.producto.precioVenta * item.cantidad;
    const nombre = item.producto.nombre;
    const nameLines = doc.splitTextToSize(nombre, 30) as string[];

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');

    nameLines.forEach((line, idx) => {
      doc.text(line, MARGIN, y);
      if (idx === nameLines.length - 1) {
        doc.text(String(item.cantidad), COL_CANT, y, { align: 'right' });
        drawMoneyAt(doc, y, item.producto.precioVenta, COL_UNIT, 6.5);
        drawMoney(doc, y, sub, 6.5);
      }
      y += 3.5;
    });
    y += 1;
  });

  separator();

  totalRow('SUBTOTAL', data.subtotal, 7);
  totalRow('IGV (18%)', data.igv, 7);
  y += 0.3;
  totalRow('TOTAL', data.total, 8.5, true);
  separator();

  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  const letras = totalEnLetras(data.total);
  const letrasLines = doc.splitTextToSize(letras, CONTENT_W) as string[];
  letrasLines.forEach(line => {
    doc.text(line, MARGIN, y);
    y += 3.5;
  });
  y += 0.5;
  separator();

  left('FORMAS DE PAGO', 7, true);
  y += 0.5;
  data.pagos.forEach(p => {
    const nombre = metodoNombre(p.idMetodoPago, data.metodos);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(nombre, MARGIN, y);
    drawMoney(doc, y, p.monto, 6.5);
    y += lineStep(6.5) + 0.3;
    if (p.codigoOperacion?.trim()) {
      doc.setFontSize(6);
      doc.text(`OP: ${p.codigoOperacion}`, RIGHT, y, { align: 'right' });
      y += lineStep(6) + 0.3;
    }
  });
  separator();

  y += 0.5;
  center('Gracias por su compra. Lo esperamos nuevamente.', 6.5, false, true);
  center(EMPRESA.web, 6, false, true);

  doc.save(`${filename}.pdf`);
  return filename;
}
