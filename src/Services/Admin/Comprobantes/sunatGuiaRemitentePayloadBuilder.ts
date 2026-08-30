import { EMPRESA } from '../../../Constantes/Empresa';
import { getUbigeoCode } from '../../../Utils/ubigeo';

import type {
  GuiaRemisionRemitenteFormData,
  MotivoTrasladoRemitente,
  SunatDocumentPayload,
} from '../../../Types/Admin/Comprobantes/Comprobante';

import { getDocumentSchemeId } from './sunatPayloadBuilder';

export interface BuildSunatGuiaRemitentePayloadOptions {
  formData: GuiaRemisionRemitenteFormData;
  serie: string;
  numero: string;
  issueTime?: string;
}

/**
 * Catálogo No. 20 SUNAT: Códigos de Motivo de Traslado
 */
export const CODIGOS_MOTIVO_TRASLADO_REMITENTE: Record<
  MotivoTrasladoRemitente,
  string
> = {
  Venta: '01',
  Compra: '02',
  'Venta con entrega a terceros': '03',
  'Traslado entre establecimientos de la misma empresa': '04',
  Consignación: '05',
  'Traslado de bienes para transformación': '06',
  Devolución: '07',
  'Recojo de bienes': '09',
  Otros: '13',
  'Venta sujeta a confirmación': '14',
  'Traslado por emisor itinerante': '18',
};

/**
 * Construye el payload requerido por APISUNAT
 * para una Guía de Remisión Remitente Electrónica (Tipo 09).
 */
export function buildSunatGuiaRemitentePayload({
  formData,
  serie,
  numero,
  issueTime,
}: BuildSunatGuiaRemitentePayloadOptions): SunatDocumentPayload {
  const { apiUrl, personaId, personaToken } = EMPRESA.sunatConfig;

  /*
   * ============================================================
   * VALIDACIONES DE CONFIGURACIÓN APISUNAT
   * ============================================================
   */

  if (!apiUrl) {
    throw new Error('No se ha configurado la URL del API de APISUNAT.');
  }

  if (!personaId) {
    throw new Error('No se ha configurado el personaId de APISUNAT.');
  }

  if (!personaToken) {
    throw new Error('No se ha configurado el personaToken de APISUNAT.');
  }

  /*
   * ============================================================
   * DATOS PRINCIPALES
   * ============================================================
   */

  const rucEmpresa = EMPRESA.ruc;

  if (!rucEmpresa) {
    throw new Error('No se ha configurado el RUC de la empresa.');
  }

  if (!serie?.trim()) {
    throw new Error('La serie de la guía es obligatoria.');
  }

  if (!numero?.trim()) {
    throw new Error('El número de la guía es obligatorio.');
  }

  const fileName = `${rucEmpresa}-09-${serie}-${numero}`;

  const horaActual =
    issueTime || new Date().toTimeString().slice(0, 8);

  const motivoCodigo =
    CODIGOS_MOTIVO_TRASLADO_REMITENTE[formData.motivoTraslado] || '01';

  /*
   * ============================================================
   * VALIDACIÓN DE DESTINATARIO SEGÚN MOTIVO DE TRASLADO
   * ============================================================
   */

  if (!formData.destinatario) {
    throw new Error('Debe registrar los datos del destinatario.');
  }

  const destDoc = formData.destinatario.numeroDocumento?.trim();
  const destNombre = formData.destinatario.nombre?.trim();

  if (!destNombre) {
    throw new Error(
      'El nombre o razón social del destinatario es obligatorio.',
    );
  }

  if (!destDoc) {
    throw new Error('El documento del destinatario es obligatorio.');
  }

  // Motivos donde el destinatario DEBE ser la misma empresa
  const motivosDestinatarioMismaTienda: MotivoTrasladoRemitente[] = [
    'Compra',
    'Recojo de bienes',
    'Traslado entre establecimientos de la misma empresa',
  ];

  if (motivosDestinatarioMismaTienda.includes(formData.motivoTraslado)) {
    if (destDoc !== rucEmpresa) {
      throw new Error(
        `Para el motivo "${formData.motivoTraslado}", el destinatario debe ser la misma empresa emisora (${rucEmpresa}).`,
      );
    }
  } else {
    // Para el resto de motivos, el destinatario NO puede ser la misma empresa
    if (destDoc === rucEmpresa) {
      throw new Error(
        `Para el motivo "${formData.motivoTraslado}", el RUC del destinatario no puede ser el de la misma empresa emisora (${rucEmpresa}).`,
      );
    }
  }

  /*
   * ============================================================
   * VALIDACIÓN DE PROVEEDOR Y COMPRADOR SEGÚN MOTIVO
   * ============================================================
   */

  const requiereProveedor =
    formData.motivoTraslado === 'Compra' ||
    formData.motivoTraslado === 'Recojo de bienes' ||
    formData.motivoTraslado === 'Otros';

  if (requiereProveedor) {
    if (!formData.proveedor?.nombre?.trim() || !formData.proveedor?.ruc?.trim()) {
      throw new Error(
        `Debe registrar los datos completos del proveedor (RUC y Razón Social) para el motivo "${formData.motivoTraslado}".`,
      );
    }
    if (!/^\d{11}$/.test(formData.proveedor.ruc.trim())) {
      throw new Error('El RUC del proveedor debe tener exactamente 11 dígitos.');
    }
  }

  const requiereComprador =
    formData.motivoTraslado === 'Venta con entrega a terceros' ||
    formData.motivoTraslado === 'Otros';

  if (requiereComprador) {
    if (!formData.comprador?.nombre?.trim() || !formData.comprador?.ruc?.trim()) {
      throw new Error(
        `Debe registrar los datos completos del comprador (RUC y Razón Social) para el motivo "${formData.motivoTraslado}".`,
      );
    }
    if (
      !/^\d{8}$/.test(formData.comprador.ruc.trim()) &&
      !/^\d{11}$/.test(formData.comprador.ruc.trim())
    ) {
      throw new Error(
        'El número de documento del comprador debe tener 8 dígitos (DNI) u 11 dígitos (RUC).',
      );
    }
  }

  if (formData.motivoTraslado === 'Otros') {
    if (!formData.descripcionMotivo?.trim()) {
      throw new Error(
        'Para el motivo "Otros", la descripción del motivo es obligatoria.',
      );
    }
  }

  /*
   * ============================================================
   * VALIDACIÓN DE CÓDIGO DE ESTABLECIMIENTO
   * ============================================================
   */

  if (
    formData.motivoTraslado ===
    'Traslado entre establecimientos de la misma empresa'
  ) {
    const codPartida = formData.puntoPartida.codigoEstablecimiento?.trim();
    const codLlegada = formData.puntoLlegada.codigoEstablecimiento?.trim();

    if (!codPartida || !/^\d{4}$/.test(codPartida)) {
      throw new Error(
        'El Código de Establecimiento de partida debe tener exactamente 4 dígitos (ej. 0000).',
      );
    }
    if (!codLlegada || !/^\d{4}$/.test(codLlegada)) {
      throw new Error(
        'El Código de Establecimiento de llegada debe tener exactamente 4 dígitos (ej. 0001).',
      );
    }
  }

  /*
   * ============================================================
   * VALIDAR PESO
   * ============================================================
   */

  const pesoBrutoTotal = Number(formData.pesoBrutoTotal);

  if (!Number.isFinite(pesoBrutoTotal) || pesoBrutoTotal <= 0) {
    throw new Error('El peso bruto total debe ser mayor a cero.');
  }

  /*
   * ============================================================
   * VALIDAR MODALIDAD Y DATOS DE TRANSPORTE
   * ============================================================
   */

  const esPrivado =
    formData.modalidadTransporte === 'TRANSPORTE_PRIVADO';
  const esPublico =
    formData.modalidadTransporte === 'TRANSPORTE_PUBLICO';
  const tieneVehiculoConductor =
    esPrivado || (esPublico && !!formData.datosTransportista);

  let transportEquipments: Record<string, any>[] = [];
  let driverPersons: Record<string, any>[] = [];

  if (tieneVehiculoConductor) {
    if (!formData.vehiculos || formData.vehiculos.length === 0) {
      throw new Error('Debe registrar al menos un vehículo.');
    }
    if (!formData.conductores || formData.conductores.length === 0) {
      throw new Error('Debe registrar al menos un conductor.');
    }

    transportEquipments = formData.vehiculos.map((v, i) => {
      const placa = v.placa?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const tuc = v.numeroAutorizacion?.trim();

      if (!placa) {
        throw new Error(`El vehículo #${i + 1} debe tener placa.`);
      }
      if (!/^[A-Z0-9]{6,8}$/.test(placa)) {
        throw new Error(
          `La placa "${placa}" del vehículo #${i + 1} debe tener entre 6 y 8 caracteres alfanuméricos sin caracteres especiales.`,
        );
      }

      const equipment: Record<string, any> = {
        'cbc:ID': {
          _text: placa,
        },
      };

      if (!esPrivado && tuc) {
        equipment['cac:ApplicableTransportMeans'] = {
          'cbc:RegistrationNationalityID': {
            _text: tuc,
          },
        };
      }

      return equipment;
    });

    driverPersons = formData.conductores.map((c, i) => {
      const tipoDocumento = c.tipoDocumento || 'DNI';
      const numeroDocumento = c.numeroDocumento?.trim();
      const nombre = c.nombre?.trim();
      const apellidos = c.apellidos?.trim();
      const licencia = c.licenciaConducir?.trim().toUpperCase();

      if (!numeroDocumento) {
        throw new Error(
          `El conductor #${i + 1} debe tener número de documento.`,
        );
      }
      if (!nombre) {
        throw new Error(`El conductor #${i + 1} debe tener nombres.`);
      }
      if (!licencia) {
        throw new Error(
          `El conductor #${i + 1} debe tener licencia de conducir.`,
        );
      }
      if (licencia.length < 9 || licencia.length > 10) {
        throw new Error(
          `La licencia de conducir "${licencia}" del conductor #${i + 1} debe tener entre 9 y 10 caracteres.`,
        );
      }

      return {
        'cbc:ID': {
          _attributes: {
            schemeID: getDocumentSchemeId(tipoDocumento, false),
          },
          _text: numeroDocumento,
        },
        'cbc:FirstName': {
          _text: nombre,
        },
        'cbc:FamilyName': {
          _text: apellidos || '',
        },
        'cbc:JobTitle': {
          _text: 'Principal',
        },
        'cac:IdentityDocumentReference': {
          'cbc:ID': {
            _text: licencia,
          },
        },
      };
    });
  }

  // Si es público y no es solo M1/L, validar datos del transportista
  if (esPublico && !formData.vehiculosCategoriaM1L) {
    if (!formData.transportista) {
      throw new Error(
        'Debe registrar los datos del transportista para Transporte Público.',
      );
    }
    const transportistaRuc = formData.transportista.ruc?.trim();
    const transportistaRazonSocial =
      formData.transportista.razonSocial?.trim();
    const registroMTC = formData.transportista.registroMTC?.trim();

    if (!transportistaRuc || !/^\d{11}$/.test(transportistaRuc)) {
      throw new Error(
        'El RUC del transportista es obligatorio y debe tener 11 dígitos.',
      );
    }
    if (!transportistaRazonSocial) {
      throw new Error(
        'La razón social del transportista es obligatoria.',
      );
    }
    if (!registroMTC) {
      throw new Error(
        'El Registro MTC del transportista es obligatorio.',
      );
    }
  }

  /*
   * ============================================================
   * VALIDAR BIENES
   * ============================================================
   */

  if (!formData.bienes || formData.bienes.length === 0) {
    throw new Error('Debe registrar al menos un bien para el traslado.');
  }

  const despatchLines = formData.bienes.map((b, index) => {
    const cantidad = Number(b.cantidad);

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new Error(
        `La cantidad del bien ${index + 1} debe ser mayor a cero.`,
      );
    }

    const descripcion = b.descripcion?.trim();

    if (!descripcion) {
      throw new Error(
        `El bien ${index + 1} debe tener una descripción.`,
      );
    }

    const unidadMedida =
      b.unidadMedida === 'UNIDAD' ? 'NIU' : b.unidadMedida || 'NIU';

    return {
      'cbc:ID': {
        _text: index + 1,
      },
      'cbc:DeliveredQuantity': {
        _attributes: {
          unitCode: unidadMedida,
        },
        _text: cantidad,
      },
      'cac:OrderLineReference': {
        'cbc:LineID': {
          _text: index + 1,
        },
      },
      'cac:Item': {
        'cbc:Description': {
          _text: descripcion,
        },
      },
    };
  });

  /*
   * ============================================================
   * UBIGEOS
   * ============================================================
   */

  const ubigeoLlegada = getUbigeoCode(
    formData.puntoLlegada.departamento,
    formData.puntoLlegada.provincia,
    formData.puntoLlegada.distrito,
  );

  const ubigeoPartida = getUbigeoCode(
    formData.puntoPartida.departamento,
    formData.puntoPartida.provincia,
    formData.puntoPartida.distrito,
  );

  if (!ubigeoPartida) {
    throw new Error(
      'No se pudo obtener el ubigeo del punto de partida.',
    );
  }

  if (!ubigeoLlegada) {
    throw new Error(
      'No se pudo obtener el ubigeo del punto de llegada.',
    );
  }

  /*
   * ============================================================
   * SPECIAL INSTRUCTIONS (INDICADORES SUNAT)
   * ============================================================
   */

  const specialInstructions: Array<{ _text: string }> = [];

  if (esPublico && formData.datosTransportista) {
    specialInstructions.push({
      _text: 'SUNAT_Envio_IndicadorVehiculoConductoresTransp',
    });
  }

  if (formData.retornoVehiculoVacio) {
    specialInstructions.push({
      _text: 'SUNAT_Envio_IndicadorRetornoVehiculoVacio',
    });
  }

  if (formData.retornoEnvasesVacios) {
    specialInstructions.push({
      _text: 'SUNAT_Envio_IndicadorRetornoEnvasesVacios',
    });
  }

  if (formData.transbordoProgramado) {
    specialInstructions.push({
      _text: 'SUNAT_Envio_IndicadorTransbordoProgramado',
    });
  }

  if (formData.vehiculosCategoriaM1L) {
    specialInstructions.push({
      _text: 'SUNAT_Envio_IndicadorVehiculoCatM1L',
    });
  }

  if (formData.trasladoTotal) {
    specialInstructions.push({
      _text: 'SUNAT_Envio_IndicadorTrasladoTotal',
    });
  }

  /*
   * ============================================================
   * DELIVERY Y DESPATCH ADDRESS
   * ============================================================
   */

  const deliveryAddress: Record<string, any> = {
    'cbc:ID': {
      _text: ubigeoLlegada,
    },
    'cac:AddressLine': {
      'cbc:Line': {
        _text: formData.puntoLlegada.direccion?.trim() || '',
      },
    },
  };

  const despatchAddress: Record<string, any> = {
    'cbc:ID': {
      _text: ubigeoPartida,
    },
    'cac:AddressLine': {
      'cbc:Line': {
        _text: formData.puntoPartida.direccion?.trim() || '',
      },
    },
  };

  // Código de establecimiento si aplica
  if (
    formData.motivoTraslado ===
    'Traslado entre establecimientos de la misma empresa'
  ) {
    deliveryAddress['cbc:AddressTypeCode'] = {
      _attributes: {
        listID: rucEmpresa,
      },
      _text: formData.puntoLlegada.codigoEstablecimiento?.trim() || '0000',
    };

    despatchAddress['cbc:AddressTypeCode'] = {
      _attributes: {
        listID: rucEmpresa,
      },
      _text: formData.puntoPartida.codigoEstablecimiento?.trim() || '0000',
    };
  }

  /*
   * ============================================================
   * SHIPMENT STAGE
   * ============================================================
   */

  const shipmentStage: Record<string, any> = {
    'cbc:TransportModeCode': {
      _text: esPrivado ? '02' : '01',
    },
    'cac:TransitPeriod': {
      'cbc:StartDate': {
        _text: formData.fechaInicioTraslado || formData.fechaEmision,
      },
    },
  };

  if (esPublico && formData.transportista && !formData.vehiculosCategoriaM1L) {
    shipmentStage['cac:CarrierParty'] = {
      'cac:PartyIdentification': {
        'cbc:ID': {
          _attributes: {
            schemeID: '6',
          },
          _text: formData.transportista.ruc!.trim(),
        },
      },
      'cac:PartyLegalEntity': {
        'cbc:RegistrationName': {
          _text: formData.transportista.razonSocial!.trim(),
        },
        'cbc:CompanyID': {
          _text: formData.transportista.registroMTC!.trim(),
        },
      },
    };
  }

  shipmentStage['cac:LoadingTransportEvent'] = {
    'cbc:OccurrenceDate': {
      _text: formData.fechaInicioTraslado || formData.fechaEmision,
    },
  };

  if (driverPersons.length > 0) {
    shipmentStage['cac:DriverPerson'] = driverPersons;
  }

  /*
   * ============================================================
   * SHIPMENT
   * ============================================================
   */

  const shipment: Record<string, any> = {
    'cbc:ID': {
      _text: 'SUNAT_Envio',
    },
    'cbc:HandlingCode': {
      _text: motivoCodigo,
    },
    'cbc:GrossWeightMeasure': {
      _attributes: {
        unitCode: formData.unidadMedidaPeso || 'KGM',
      },
      _text: pesoBrutoTotal,
    },
  };

  if (formData.descripcionMotivo?.trim()) {
    shipment['cbc:HandlingInstructions'] = {
      _text: formData.descripcionMotivo.trim(),
    };
  }

  if (specialInstructions.length > 0) {
    shipment['cbc:SpecialInstructions'] = specialInstructions;
  }

  shipment['cac:ShipmentStage'] = shipmentStage;

  shipment['cac:Delivery'] = {
    'cac:DeliveryAddress': deliveryAddress,
    'cac:Despatch': {
      'cac:DespatchAddress': despatchAddress,
    },
  };

  if (transportEquipments.length > 0) {
    shipment['cac:TransportHandlingUnit'] = {
      'cac:TransportEquipment':
        transportEquipments.length === 1
          ? transportEquipments[0]
          : transportEquipments,
    };
  }

  /*
   * ============================================================
   * DOCUMENT BODY (UBL 2.1)
   * ============================================================
   */

  const documentBody: Record<string, any> = {
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
    'cbc:DespatchAdviceTypeCode': {
      _text: '09',
    },

    /*
     * EMISOR (REMITENTE)
     */
    'cac:DespatchSupplierParty': {
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
            _text: EMPRESA.razonSocial,
          },
          'cac:RegistrationAddress': {
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
     * DESTINATARIO
     */
    'cac:DeliveryCustomerParty': {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID: getDocumentSchemeId(
                formData.destinatario.tipoDocumento || 'RUC',
                false,
              ),
            },
            _text: destDoc,
          },
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text: destNombre,
          },
        },
      },
    },
  };

  /*
   * DATOS DEL COMPRADOR (cac:BuyerCustomerParty)
   */
  if (requiereComprador && formData.comprador?.nombre && formData.comprador?.ruc) {
    documentBody['cac:BuyerCustomerParty'] = {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID: getDocumentSchemeId(
                formData.comprador.ruc.length === 8 ? 'DNI' : 'RUC',
                false,
              ),
            },
            _text: formData.comprador.ruc.trim(),
          },
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text: formData.comprador.nombre.trim(),
          },
        },
      },
    };
  }

  /*
   * DATOS DEL PROVEEDOR (cac:SellerSupplierParty)
   */
  if (requiereProveedor && formData.proveedor?.nombre && formData.proveedor?.ruc) {
    documentBody['cac:SellerSupplierParty'] = {
      'cac:Party': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID: '6',
            },
            _text: formData.proveedor.ruc.trim(),
          },
        },
        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text: formData.proveedor.nombre.trim(),
          },
        },
      },
    };
  }

  documentBody['cac:Shipment'] = shipment;
  documentBody['cac:DespatchLine'] = despatchLines;

  return {
    personaId,
    personaToken,
    fileName,
    documentBody,
  };
}
