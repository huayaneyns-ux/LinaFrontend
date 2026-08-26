import { EMPRESA } from '../../../Constantes/Empresa';

import { totalEnLetras } from '../../../Utils/numberToWordsSoles';

import type {
  ComprobanteFormData,
  SunatDocumentPayload,
  SunatInvoiceDocumentBody,
  SunatInvoiceLine,
} from '../../../Types/Admin/Comprobantes/Comprobante';

export interface BuildSunatPayloadOptions {
  formData: ComprobanteFormData;
  serie: string;
  numero: string;
  issueTime?: string;
}

/**
 * Retorna el schemeID SUNAT correspondiente al tipo de documento.
 *
 * 1: DNI
 * 6: RUC
 * 4: Carnet de extranjería
 * 7: Pasaporte
 * -: Sin documento
 */
export function getDocumentSchemeId(
  tipoDocumento: string,
  isFactura: boolean,
): string {

  if (isFactura) {
    return '6';
  }

  const tipo = tipoDocumento.trim().toUpperCase();

  if (tipo === 'DNI') {
    return '1';
  }

  if (tipo === 'RUC') {
    return '6';
  }

  if (
    tipo === 'CE' ||
    tipo === 'CARNET_EXTRANJERIA'
  ) {
    return '4';
  }

  if (tipo === 'PASAPORTE') {
    return '7';
  }

  if (
    !tipo ||
    tipo === 'SIN_DOCUMENTO'
  ) {
    return '-';
  }

  return '1';
}

/**
 * Construye el payload exacto requerido por APISUNAT
 * para Boleta (03) o Factura (01).
 *
 * Las credenciales de APISUNAT se obtienen desde:
 *
 * EMPRESA.sunatConfig
 *
 * y se envían dentro del payload:
 *
 * personaId
 * personaToken
 * fileName
 * documentBody
 */
export function buildSunatPayload({
  formData,
  serie,
  numero,
  issueTime,
}: BuildSunatPayloadOptions): SunatDocumentPayload {

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

  /*
   * La URL se valida aquí para evitar generar
   * un payload cuando la configuración está incompleta.
   *
   * El apiUrl no forma parte del JSON que se envía.
   * Solamente será utilizado por SunatService.
   */
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
   * TIPO DE COMPROBANTE
   * ============================================================
   */

  const isFactura =
    formData.tipo === 'FACTURA';

  const invoiceTypeCode =
    isFactura ? '01' : '03';

  /*
   * ============================================================
   * DATOS DE LA EMPRESA
   * ============================================================
   */

  const rucEmpresa =
    EMPRESA.ruc;

  const razonSocialEmpresa =
    EMPRESA.razonSocial;

  /*
   * ============================================================
   * FILE NAME
   *
   * Factura:
   * RUC-01-SERIE-NUMERO
   *
   * Boleta:
   * RUC-03-SERIE-NUMERO
   * ============================================================
   */

  const fileName =
    `${rucEmpresa}-${invoiceTypeCode}-${serie}-${numero}`;

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
    formData.cliente.tipoDocumento ||
    (isFactura ? 'RUC' : 'DNI');

  const clienteNumDoc =
    formData.cliente.documento ||
    (isFactura ? '' : '-');

  const clienteNombre =
    formData.cliente.nombre ||
    (isFactura
      ? ''
      : 'CLIENTES VARIOS');

  const schemeId =
    getDocumentSchemeId(
      clienteTipoDoc,
      isFactura,
    );

  /*
   * ============================================================
   * PROCESAMIENTO DE ITEMS
   * ============================================================
   */

  let totalGravado = 0;
  let totalIgv = 0;
  let totalPrecioVenta = 0;

  const invoiceLines: SunatInvoiceLine[] =
    formData.detalle.map(
      (item, index) => {

        /*
         * Cantidad
         */
        const cantidad =
          Number(item.cantidad) || 1;

        /*
         * Precio unitario SIN IGV
         */
        const valorUnitarioSinIgv =
          Number(item.precio) || 0;

        /*
         * Valor de venta del item
         *
         * Cantidad × precio sin IGV
         */
        const valorTotalItem =
          Number(
            (
              valorUnitarioSinIgv *
              cantidad
            ).toFixed(2),
          );

        /*
         * IGV del item
         */
        const igvItem =
          item.igv !== undefined &&
          item.igv > 0
            ? Number(
                item.igv.toFixed(2),
              )
            : Number(
                (
                  valorTotalItem *
                  0.18
                ).toFixed(2),
              );

        /*
         * Importe total del item
         *
         * Valor de venta + IGV
         */
        const importeItem =
          item.importe !== undefined &&
          item.importe > 0
            ? Number(
                item.importe.toFixed(2),
              )
            : Number(
                (
                  valorTotalItem +
                  igvItem
                ).toFixed(2),
              );

        /*
         * Precio unitario con IGV
         */
        const precioUnitarioConIgv =
          Number(
            (
              importeItem /
              cantidad
            ).toFixed(2),
          );

        /*
         * Acumuladores
         */
        totalGravado +=
          valorTotalItem;

        totalIgv +=
          igvItem;

        totalPrecioVenta +=
          importeItem;

        /*
         * ======================================================
         * INVOICE LINE
         * ======================================================
         */

        const line: SunatInvoiceLine = {

          'cbc:ID': {
            _text: String(index + 1),
          },

          'cbc:InvoicedQuantity': {
            _attributes: {
              unitCode: 'NIU',
            },

            _text:
              String(cantidad),
          },

          'cbc:LineExtensionAmount': {
            _attributes: {
              currencyID: 'PEN',
            },

            _text:
              valorTotalItem.toFixed(2),
          },

          'cac:PricingReference': {
            'cac:AlternativeConditionPrice': {

              'cbc:PriceAmount': {
                _attributes: {
                  currencyID: 'PEN',
                },

                _text:
                  precioUnitarioConIgv.toFixed(2),
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

              _text:
                igvItem.toFixed(2),
            },

            'cac:TaxSubtotal': [
              {
                'cbc:TaxableAmount': {
                  _attributes: {
                    currencyID: 'PEN',
                  },

                  _text:
                    valorTotalItem.toFixed(2),
                },

                'cbc:TaxAmount': {
                  _attributes: {
                    currencyID: 'PEN',
                  },

                  _text:
                    igvItem.toFixed(2),
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
          },

          'cac:Price': {
            'cbc:PriceAmount': {

              _attributes: {
                currencyID: 'PEN',
              },

              _text:
                valorUnitarioSinIgv.toFixed(2),
            },
          },
        };

        return line;
      },
    );

  /*
   * ============================================================
   * REDONDEAR TOTALES
   * ============================================================
   */

  totalGravado =
    Number(
      totalGravado.toFixed(2),
    );

  totalIgv =
    Number(
      totalIgv.toFixed(2),
    );

  totalPrecioVenta =
    Number(
      totalPrecioVenta.toFixed(2),
    );

  /*
   * ============================================================
   * TOTAL EN LETRAS
   * ============================================================
   */

  const totalEnLetrasTexto =
    totalEnLetras(
      totalPrecioVenta,
    );

  /*
   * ============================================================
   * DOCUMENT BODY
   * ============================================================
   */

  const documentBody: SunatInvoiceDocumentBody = {
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
    'cbc:InvoiceTypeCode': {
      _attributes: {
        listID: '0101',
      },
      _text: invoiceTypeCode,
    },
    'cbc:Note': [
      {
        _text: totalEnLetrasTexto,
        _attributes: {
          languageLocaleID: '1000',
        },
      },
    ],
    'cbc:DocumentCurrencyCode': {
      _text: 'PEN',
    },

    /*
     * ==========================================================
     * EMISOR
     * ==========================================================
     */

    'cac:AccountingSupplierParty': {

      'cac:Party': {

        'cac:PartyIdentification': {

          'cbc:ID': {

            _attributes: {
              schemeID: '6',
            },

            _text:
              rucEmpresa,
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

    /*
     * ==========================================================
     * CLIENTE
     * ==========================================================
     */

    'cac:AccountingCustomerParty': {

      'cac:Party': {

        'cac:PartyIdentification': {

          'cbc:ID': {

            _attributes: {
              schemeID:
                schemeId,
            },

            _text:
              clienteNumDoc,
          },
        },

        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text: clienteNombre,
          },
        },
      },
    },

    /*
     * ==========================================================
     * IGV
     * ==========================================================
     */

    'cac:TaxTotal': {

      'cbc:TaxAmount': {

        _attributes: {
          currencyID: 'PEN',
        },

        _text:
          totalIgv.toFixed(2),
      },

      'cac:TaxSubtotal': [
        {

          'cbc:TaxableAmount': {

            _attributes: {
              currencyID: 'PEN',
            },

            _text:
              totalGravado.toFixed(2),
          },

          'cbc:TaxAmount': {

            _attributes: {
              currencyID: 'PEN',
            },

            _text:
              totalIgv.toFixed(2),
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

    /*
     * ==========================================================
     * TOTALES
     * ==========================================================
     */

    'cac:LegalMonetaryTotal': {

      'cbc:LineExtensionAmount': {

        _attributes: {
          currencyID: 'PEN',
        },

        _text:
          totalGravado.toFixed(2),
      },

      'cbc:TaxInclusiveAmount': {

        _attributes: {
          currencyID: 'PEN',
        },

        _text:
          totalPrecioVenta.toFixed(2),
      },

      'cbc:PayableAmount': {

        _attributes: {
          currencyID: 'PEN',
        },

        _text:
          totalPrecioVenta.toFixed(2),
      },
    },

    /*
     * ==========================================================
     * ITEMS
     * ==========================================================
     */

    'cac:InvoiceLine': invoiceLines,
  };

  /*
   * ============================================================
   * PAYLOAD FINAL APISUNAT
   * ============================================================
   *
   * Este es exactamente el nivel donde deben ir:
   *
   * personaId
   * personaToken
   * fileName
   * documentBody
   *
   * apiUrl NO se incluye aquí porque la URL es utilizada
   * por SunatService para realizar el POST.
   */

  return {

    personaId,

    personaToken,

    fileName,

    documentBody,
  };
}