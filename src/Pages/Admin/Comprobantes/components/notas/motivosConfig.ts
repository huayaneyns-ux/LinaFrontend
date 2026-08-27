import type { TipoNotaCredito, TipoNotaDebito } from '../../../../../Types/Admin/Comprobantes/Comprobante';

export interface MotivoConfig {
  trabajaConItems: boolean;
  itemsObligatorios: boolean;
  descripcion?: string;
}

export const configuracionMotivosCredito: Record<TipoNotaCredito, MotivoConfig> = {
  'Anulación de la operación': {
    trabajaConItems: false,
    itemsObligatorios: false,
    descripcion: 'Anula completamente el comprobante original. No requiere especificar ítems individuales.',
  },
  'Anulación por error en el RUC': {
    trabajaConItems: false,
    itemsObligatorios: false,
    descripcion: 'Anula el comprobante por error en el RUC del cliente. No requiere especificar ítems.',
  },
  'Corrección por error en la descripción': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Corrige errores en la descripción de productos/servicios específicos.',
  },
  'Descuento global o por ítem': {
    trabajaConItems: true,
    itemsObligatorios: false,
    descripcion: 'Aplica un descuento global o por ítem específico.',
  },
  'Devolución total o por ítem': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Regresa total o parcialmente productos/servicios del comprobante original.',
  },
  'Bonificaciones': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Registra bonificaciones aplicadas a productos específicos.',
  },
  'Disminución en el valor': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Disminuye el valor de uno o varios conceptos del comprobante original.',
  },
};

export const configuracionMotivosDebito: Record<TipoNotaDebito, MotivoConfig> = {
  'Intereses por mora': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Registra intereses por mora en el pago.',
  },
  'Aumento en el valor': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Aumenta el valor de uno o varios conceptos del comprobante original.',
  },
  'Penalidades': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Registra penalidades aplicadas a la operación.',
  },
  'Otros conceptos': {
    trabajaConItems: true,
    itemsObligatorios: true,
    descripcion: 'Registra conceptos adicionales relacionados con la operación.',
  },
};

export const getMotivoConfig = (tipo: 'NOTA_CREDITO' | 'NOTA_DEBITO', motivo: string): MotivoConfig => {
  if (tipo === 'NOTA_CREDITO') {
    return configuracionMotivosCredito[motivo as TipoNotaCredito] || {
      trabajaConItems: true,
      itemsObligatorios: true,
    };
  } else {
    return configuracionMotivosDebito[motivo as TipoNotaDebito] || {
      trabajaConItems: true,
      itemsObligatorios: true,
    };
  }
};