import { EMPRESA } from '../../../Constantes/Empresa';

import { totalEnLetras } from '../../../Utils/numberToWordsSoles';

import type {
  NotaFormData,
  SunatDocumentPayload,
} from '../../../Types/Admin/Comprobantes/Comprobante';

export interface BuildSunatNotaPayloadOptions {
  formData: NotaFormData;
  serie: string;
  numero: string;
  tipoComprobanteRelacionado?: 'BOLETA' | 'FACTURA';
  issueTime?: string;
}

/**
 * Retorna el código de respuesta SUNAT correspondiente al motivo de la nota.
 *
 * NOTA DE CRÉDITO:
 * 01: Anulación de la operación
 * 02: Anulación por error en el RUC
 * 03: Corrección por error en la descripción
 * 04: Descuento global
 * 05: Descuento por ítem
 * 06: Devolución total
 * 07: Devolución por ítem
 * 08: Bonificación
 * 09: Disminución en el valor
 *
 * NOTA DE DÉBITO:
 * 01: Intereses por mora
 * 02: Aumento en el valor
 * 03: Penalidades/otros conceptos
 */
export function getResponseCode(
  tipo: 'NOTA_CREDITO' | 'NOTA_DEBITO',
  motivo: string,
): string {
  const motivosCredito: Record<string, string> = {
    'Anulación de la operación': '01',
    'Anulación por error en el RUC': '02',
    'Corrección por error en la descripción': '03',
    'Descuento global o por ítem': '04',
    'Devolución total o por ítem': '06',
    'Bonificaciones': '08',
    'Disminución en el valor': '09',
  };

  const motivosDebito: Record<string, string> = {
    'Intereses por mora': '01',
    'Aumento en el valor': '02',
    'Penalidades': '03',
    'Otros conceptos': '03',
  };

  if (tipo === 'NOTA_CREDITO') {
    return motivosCredito[motivo] || '01';
  } else {
    return motivosDebito[motivo] || '03';
  }
}

/**
 * Retorna el tipo de documento SUNAT correspondiente al tipo de comprobante.
 *
 * 01: Factura
 * 03: Boleta
 */
export function getDocumentTypeCode(tipo: 'BOLETA' | 'FACTURA'): string {
  return tipo === 'FACTURA' ? '01' : '03';
}

/**
 * Construye el payload exacto requerido por APISUNAT
 * para Nota de Crédito (07) o Nota de Débito (08).
 */
export function buildSunatNotaPayload({
  formData,
  serie,
  numero,
  tipoComprobanteRelacionado,
  issueTime,
}: BuildSunatNotaPayloadOptions): SunatDocumentPayload {

  /*
   * ============================================================
   * CONFIGURACIÓN APISUNAT
   * ============================================================
   */

  const {
    apiUrl,
    personaId,
    personaToken,
  } = EMPRESA.sunatConfig;

  if (!apiUrl) {
    throw new Error(
      'No se ha configurado la URL del API de APISUNAT.',
    );
  }

  if (!personaId) {
    throw new Error(
      'No se ha configurado el personaId de APISUNAT.',
    );
  }

  if (!personaToken) {
    throw new Error(
      'No se ha configurado el personaToken de APISUNAT.',
    );
  }

  /*
   * ============================================================
   * TIPO DE NOTA
   * ============================================================
   */

  const isNotaCredito = formData.tipo === 'NOTA_CREDITO';
  const notaTypeCode = isNotaCredito ? '07' : '08';

  /*
   * ============================================================
   * DATOS DE LA EMPRESA
   * ============================================================
   */

  const rucEmpresa = EMPRESA.ruc;
  const razonSocialEmpresa = EMPRESA.razonSocial;

  /*
   * ============================================================
   * FILE NAME
   *
   * Nota de Crédito para Factura:
   * RUC-07-FC01-NUMERO
   *
   * Nota de Crédito para Boleta:
   * RUC-07-BC01-NUMERO
   *
   * Nota de Débito para Factura:
   * RUC-08-FD01-NUMERO
   *
   * Nota de Débito para Boleta:
   * RUC-08-BD01-NUMERO
   * ============================================================
   */

  const fileName = `${rucEmpresa}-${notaTypeCode}-${serie}-${numero}`;

  /*
   * ============================================================
   * FECHA Y HORA
   * ============================================================
   */

  const horaActual =
    issueTime ||
    new Date()
      .toTimeString()
      .slice(0, 8);

  /*
   * ============================================================
   * DATOS DEL CLIENTE
   * ============================================================
   */

  const clienteTipoDoc =
    formData.cliente.tipoDocumento || 'DNI';

  const clienteNumDoc =
    formData.cliente.documento || '-';

  const clienteNombre =
    formData.cliente.nombre || 'CLIENTES VARIOS';

  const schemeId = getDocumentSchemeId(clienteTipoDoc);

  /*
   * ============================================================
   * CÓDIGO DE RESPUESTA (MOTIVO)
   * ============================================================
   */

  const responseCode = getResponseCode(formData.tipo, formData.motivo);

  if (
    tipoComprobanteRelacionado === 'BOLETA' &&
    formData.tipo === 'NOTA_CREDITO' &&
    ['Descuento global o por ítem', 'Devolución total o por ítem', 'Bonificaciones'].includes(formData.motivo)
  ) {
    throw new Error('Las notas de crédito 04, 05 y 08 no pueden vincularse a una boleta.');
  }

  /*
   * ============================================================
   * COMPROBANTE RELACIONADO
   * ============================================================
   */

  const documentTypeCode = getDocumentTypeCode(
    formData.comprobanteRelacionado.tipo as 'BOLETA' | 'FACTURA',
  );

  /*
   * ============================================================
   * PROCESAMIENTO DE ITEMS
   * ============================================================
   */

  let totalGravado = 0;
  let totalIgv = 0;
  let totalPrecioVenta = 0;

  const lines = formData.detalle.map((item, index) => {
    const cantidad = Number(item.cantidad) || 1;
    const valorUnitarioSinIgv = Number(item.precio) || 0;
    const valorTotalItem = Number((valorUnitarioSinIgv * cantidad).toFixed(2));
    const igvItem = item.igv !== undefined && item.igv > 0
      ? Number(item.igv.toFixed(2))
      : Number((valorTotalItem * 0.18).toFixed(2));
    const importeItem = item.importe !== undefined && item.importe > 0
      ? Number(item.importe.toFixed(2))
      : Number((valorTotalItem + igvItem).toFixed(2));
    const precioUnitarioConIgv = Number((importeItem / cantidad).toFixed(2));

    totalGravado += valorTotalItem;
    totalIgv += igvItem;
    totalPrecioVenta += importeItem;

    if (isNotaCredito) {
      return {
        'cbc:ID': {
          _text: String(index + 1),
        },
        'cbc:CreditedQuantity': {
          _attributes: {
            unitCode: 'NIU',
          },
          _text: String(cantidad),
        },
        'cbc:LineExtensionAmount': {
          _attributes: {
            currencyID: 'PEN',
          },
          _text: valorTotalItem.toFixed(2),
        },
        'cac:PricingReference': {
          'cac:AlternativeConditionPrice': {
            'cbc:PriceAmount': {
              _attributes: {
                currencyID: 'PEN',
              },
              _text: precioUnitarioConIgv.toFixed(2),
            },
            'cbc:PriceTypeCode': {
              _text: '01',
            },
          },
        },
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            _attributes: {
              currencyID: 'PEN',
            },
            _text: igvItem.toFixed(2),
          },
          'cac:TaxSubtotal': [
            {
              'cbc:TaxableAmount': {
                _attributes: {
                  currencyID: 'PEN',
                },
                _text: valorTotalItem.toFixed(2),
              },
              'cbc:TaxAmount': {
                _attributes: {
                  currencyID: 'PEN',
                },
                _text: igvItem.toFixed(2),
              },
              'cac:TaxCategory': {
                'cbc:Percent': {
                  _text: 18,
                },
                'cbc:TaxExemptionReasonCode': {
                  _text: '10',
                },
                'cac:TaxScheme': {
                  'cbc:ID': {
                    _text: '1000',
                  },
                  'cbc:Name': {
                    _text: 'IGV',
                  },
                  'cbc:TaxTypeCode': {
                    _text: 'VAT',
                  },
                },
              },
            },
          ],
        },
        'cac:Item': {
          'cbc:Description': {
            _text: item.productoServicio || 'Producto / Servicio',
          },
          ...(item.codigo ? {
            'cac:SellersItemIdentification': {
              'cbc:ID': {
                _text: String(item.codigo),
              },
            },
          } : {}),
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            _attributes: {
              currencyID: 'PEN',
            },
            _text: valorUnitarioSinIgv.toFixed(2),
          },
        },
      };
    } else {
      return {
        'cbc:ID': {
          _text: String(index + 1),
        },
        'cbc:DebitedQuantity': {
          _attributes: {
            unitCode: 'NIU',
          },
          _text: String(cantidad),
        },
        'cbc:LineExtensionAmount': {
          _attributes: {
            currencyID: 'PEN',
          },
          _text: valorTotalItem.toFixed(2),
        },
        'cac:PricingReference': {
          'cac:AlternativeConditionPrice': {
            'cbc:PriceAmount': {
              _attributes: {
                currencyID: 'PEN',
              },
              _text: precioUnitarioConIgv.toFixed(2),
            },
            'cbc:PriceTypeCode': {
              _text: '01',
            },
          },
        },
        'cac:TaxTotal': {
          'cbc:TaxAmount': {
            _attributes: {
              currencyID: 'PEN',
            },
            _text: igvItem.toFixed(2),
          },
          'cac:TaxSubtotal': [
            {
              'cbc:TaxableAmount': {
                _attributes: {
                  currencyID: 'PEN',
                },
                _text: valorTotalItem.toFixed(2),
              },
              'cbc:TaxAmount': {
                _attributes: {
                  currencyID: 'PEN',
                },
                _text: igvItem.toFixed(2),
              },
              'cac:TaxCategory': {
                'cbc:Percent': {
                  _text: 18,
                },
                'cbc:TaxExemptionReasonCode': {
                  _text: '10',
                },
                'cac:TaxScheme': {
                  'cbc:ID': {
                    _text: '1000',
                  },
                  'cbc:Name': {
                    _text: 'IGV',
                  },
                  'cbc:TaxTypeCode': {
                    _text: 'VAT',
                  },
                },
              },
            },
          ],
        },
        'cac:Item': {
          'cbc:Description': {
            _text: item.productoServicio || 'Producto / Servicio',
          },
          ...(item.codigo ? {
            'cac:SellersItemIdentification': {
              'cbc:ID': {
                _text: String(item.codigo),
              },
            },
          } : {}),
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            _attributes: {
              currencyID: 'PEN',
            },
            _text: valorUnitarioSinIgv.toFixed(2),
          },
        },
      };
    }
  });

  /*
   * ============================================================
   * REDONDEAR TOTALES
   * ============================================================
   */

  totalGravado = Number(totalGravado.toFixed(2));
  totalIgv = Number(totalIgv.toFixed(2));
  totalPrecioVenta = Number(totalPrecioVenta.toFixed(2));

  /*
   * ============================================================
   * TOTAL EN LETRAS
   * ============================================================
   */

  const totalEnLetrasTexto = totalEnLetras(totalPrecioVenta);

  /*
   * ============================================================
   * DOCUMENT BODY
   * ============================================================
   */

  const documentBody: any = {
    'cbc:UBLVersionID': {
      _text: '2.1',
    },
    'cbc:CustomizationID': {
      _text: '2.0',
    },
    'cbc:ID': {
      _text: `${serie}-${numero}`,
    },
    'cbc:IssueDate': {
      _text: formData.fechaEmision,
    },
    'cbc:IssueTime': {
      _text: horaActual,
    },
    'cbc:Note': [
      {
        _text: totalEnLetrasTexto,
        _attributes: {
          languageLocaleID: '1000',
        },
      },
      ...(formData.observaciones ? [{ _text: formData.observaciones }] : []),
    ],
    'cbc:DocumentCurrencyCode': {
      _text: 'PEN',
    },
    'cac:DiscrepancyResponse': {
      'cbc:ResponseCode': {
        _text: responseCode,
      },
      'cbc:Description': {
        _text: formData.motivoDescripcion || formData.motivo,
      },
    },
    'cac:BillingReference': {
      'cac:InvoiceDocumentReference': {
        'cbc:ID': {
          _text: `${formData.comprobanteRelacionado.serie}-${formData.comprobanteRelacionado.numero}`,
        },
        'cbc:DocumentTypeCode': {
          _text: documentTypeCode,
        },
      },
    },
    'cac:AccountingSupplierParty': {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID: '6',
            },
            _text: rucEmpresa,
          },
        },
        'cac:PartyName': {
          'cbc:Name': {
            _text: EMPRESA.nombre,
          },
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text: razonSocialEmpresa,
          },
          'cac:RegistrationAddress': {
            'cbc:AddressTypeCode': {
              _text: '0000',
            },
            'cac:AddressLine': {
              'cbc:Line': {
                _text: EMPRESA.direccionCompleta,
              },
            },
          },
        },
      },
    },
    'cac:AccountingCustomerParty': {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID: schemeId,
            },
            _text: clienteNumDoc,
          },
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text: clienteNombre,
          },
          'cac:RegistrationAddress': {
            'cac:AddressLine': {
              'cbc:Line': {
                _text: formData.cliente.direccion || '',
              },
            },
          },
        },
      },
    },
    'cac:TaxTotal': {
      'cbc:TaxAmount': {
        _attributes: {
          currencyID: 'PEN',
        },
        _text: totalIgv.toFixed(2),
      },
      'cac:TaxSubtotal': [
        {
          'cbc:TaxableAmount': {
            _attributes: {
              currencyID: 'PEN',
            },
            _text: totalGravado.toFixed(2),
          },
          'cbc:TaxAmount': {
            _attributes: {
              currencyID: 'PEN',
            },
            _text: totalIgv.toFixed(2),
          },
          'cac:TaxCategory': {
            'cac:TaxScheme': {
              'cbc:ID': {
                _text: '1000',
              },
              'cbc:Name': {
                _text: 'IGV',
              },
              'cbc:TaxTypeCode': {
                _text: 'VAT',
              },
            },
          },
        },
      ],
    },
    ...(isNotaCredito ? {
      'cac:LegalMonetaryTotal': {
        'cbc:PayableAmount': {
          _attributes: {
            currencyID: 'PEN',
          },
          _text: totalPrecioVenta.toFixed(2),
        },
      },
    } : {
      'cac:RequestedMonetaryTotal': {
        'cbc:PayableAmount': {
          _attributes: {
            currencyID: 'PEN',
          },
          _text: totalPrecioVenta.toFixed(2),
        },
      },
    }),
  };

  // Add lines based on note type
  if (isNotaCredito) {
    documentBody['cac:CreditNoteLine'] = lines;
  } else {
    documentBody['cac:DebitNoteLine'] = lines;
  }

  /*
   * ============================================================
   * PAYLOAD FINAL APISUNAT
   * ============================================================
   */

  return {
    personaId,
    personaToken,
    fileName,
    documentBody,
  };
}

/**
 * Retorna el schemeID SUNAT correspondiente al tipo de documento.
 */
function getDocumentSchemeId(tipoDocumento: string): string {
  const tipo = tipoDocumento.trim().toUpperCase();

  if (tipo === 'DNI') {
    return '1';
  }

  if (tipo === 'RUC') {
    return '6';
  }

  if (tipo === 'CE' || tipo === 'CARNET_EXTRANJERIA') {
    return '4';
  }

  if (tipo === 'PASAPORTE') {
    return '7';
  }

  if (!tipo || tipo === 'SIN_DOCUMENTO') {
    return '-';
  }

  return '1';
}
