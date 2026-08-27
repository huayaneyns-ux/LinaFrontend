import { EMPRESA } from '../../../Constantes/Empresa';
import { getUbigeoCode } from '../../../Utils/ubigeo';

import type {
  GuiaRemisionTransportistaFormData,
  SunatDocumentPayload,
} from '../../../Types/Admin/Comprobantes/Comprobante';

import { getDocumentSchemeId } from './sunatPayloadBuilder';

export interface BuildSunatGuiaTransportistaPayloadOptions {
  formData: GuiaRemisionTransportistaFormData;
  serie: string;
  numero: string;
  issueTime?: string;
}

/**
 * ============================================================
 * UTILIDADES
 * ============================================================
 */

/**
 * Convierte un valor a string limpio.
 */
function clean(value: unknown): string {
  return String(value ?? '').trim();
}

/**
 * Convierte un valor a mayúsculas y elimina caracteres
 * que no sean alfanuméricos.
 */
function alphaNumeric(value: unknown): string {
  return clean(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Normaliza la placa.
 */
function normalizePlate(value: unknown): string {
  const placa = alphaNumeric(value);

  if (!placa) {
    throw new Error(
      'El vehículo debe tener una placa.',
    );
  }

  if (placa.length > 8) {
    throw new Error(
      `La placa "${placa}" no puede tener más de 8 caracteres.`,
    );
  }

  return placa;
}

/**
 * Normaliza el TUC / Certificado de Habilitación Vehicular.
 *
 * RegistrationNationalityID debe contener el certificado/TUC
 * correspondiente al vehículo.
 */
function normalizeTuc(value: unknown): string {
  const tuc = alphaNumeric(value);

  if (!tuc) {
    throw new Error(
      'El vehículo debe tener TUC / Certificado de Habilitación Vehicular.',
    );
  }

  if (tuc.length < 10 || tuc.length > 15) {
    throw new Error(
      `El TUC / Certificado de Habilitación Vehicular "${tuc}" debe tener entre 10 y 15 caracteres.`,
    );
  }

  return tuc;
}

/**
 * Obtiene un documento SUNAT.
 */
function normalizeDocumentType(
  value: unknown,
): string {
  return clean(value).toUpperCase();
}

/**
 * ============================================================
 * BUILDER
 * ============================================================
 */

export function buildSunatGuiaTransportistaPayload({
  formData,
  serie,
  numero,
  issueTime,
}: BuildSunatGuiaTransportistaPayloadOptions): SunatDocumentPayload {
  // ==========================================================
  // CREDENCIALES APISUNAT
  // ==========================================================

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

  // ==========================================================
  // DATOS GENERALES
  // ==========================================================

  const rucEmpresa = clean(
    EMPRESA.ruc,
  );

  if (!rucEmpresa) {
    throw new Error(
      'La empresa no tiene RUC configurado.',
    );
  }

  const serieNormalizada =
    clean(serie).toUpperCase();

  const numeroNormalizado =
    clean(numero);

  if (!serieNormalizada) {
    throw new Error(
      'La serie de la guía es obligatoria.',
    );
  }

  if (!numeroNormalizado) {
    throw new Error(
      'El número de la guía es obligatorio.',
    );
  }

  const fileName =
    `${rucEmpresa}-31-${serieNormalizada}-${numeroNormalizado}`;

  const horaActual =
    issueTime ||
    new Date()
      .toTimeString()
      .slice(0, 8);

  // ==========================================================
  // CONDUCTORES
  // ==========================================================

  const conductores =
    formData.conductores ?? [];

  const driverPersons =
    conductores.map((conductor) => {
      const tipoDocumento =
        normalizeDocumentType(
          conductor.tipoDocumento ||
            'DNI',
        );

      const numeroDocumento =
        clean(
          conductor.numeroDocumento,
        );

      const nombre =
        clean(conductor.nombre);

      const apellidos =
        clean(conductor.apellidos);

      const licencia =
        alphaNumeric(
          conductor.licenciaConducir,
        );

      if (!numeroDocumento) {
        throw new Error(
          'El conductor debe tener número de documento.',
        );
      }

      if (!nombre) {
        throw new Error(
          'El conductor debe tener nombres.',
        );
      }

      if (!apellidos) {
        throw new Error(
          'El conductor debe tener apellidos.',
        );
      }

      if (!licencia) {
        throw new Error(
          'El conductor debe tener licencia de conducir.',
        );
      }

      return {
        'cbc:ID': {
          _attributes: {
            schemeID:
              getDocumentSchemeId(
                tipoDocumento,
                false,
              ),
          },
          _text:
            numeroDocumento,
        },

        'cbc:FirstName': {
          _text: nombre,
        },

        'cbc:FamilyName': {
          _text: apellidos,
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

  // ==========================================================
  // VEHÍCULOS
  // ==========================================================

  const vehiculos =
    formData.vehiculos ?? [];

  if (vehiculos.length === 0) {
    throw new Error(
      'Debe registrar al menos un vehículo.',
    );
  }

  const transportEquipments =
    vehiculos.map(
      (vehiculo, index) => {
        const placa =
          normalizePlate(
            vehiculo.placa,
          );

        /**
         * IMPORTANTE:
         *
         * numeroAutorizacion debe contener el TUC /
         * Certificado de Habilitación Vehicular.
         *
         * NO debe contener la placa.
         */
        const tuc =
          normalizeTuc(
            vehiculo.numeroAutorizacion,
          );

        /**
         * ======================================================
         * TransportEquipment
         * ======================================================
         *
         * cbc:ID
         *      = PLACA
         *
         * ApplicableTransportMeans
         *      RegistrationNationalityID
         *      = TUC
         */

        const equipment: Record<
          string,
          any
        > = {
          'cbc:ID': {
            _text: placa,
          },

          'cac:ApplicableTransportMeans': {
            'cbc:RegistrationNationalityID': {
              _text: tuc,
            },
          },
        };

        /**
         * Si tienes una autorización/documento adicional,
         * se puede enviar separado.
         *
         * NO reutilizamos numeroAutorizacion porque ese
         * campo ahora representa el TUC.
         */
        const numeroAutorizacionEspecial =
          alphaNumeric(
            (
              vehiculo as any
            ).numeroAutorizacionEspecial,
          );

        const entidadEmisora =
          alphaNumeric(
            vehiculo.entidadEmisora,
          );

        if (
          numeroAutorizacionEspecial &&
          entidadEmisora
        ) {
          equipment[
            'cac:ShipmentDocumentReference'
          ] = {
            'cbc:ID': {
              _attributes: {
                schemeID:
                  entidadEmisora,
              },

              _text:
                numeroAutorizacionEspecial,
            },
          };
        }

        return equipment;
      },
    );

  // ==========================================================
  // BIENES
  // ==========================================================

  const bienes =
    formData.bienes ?? [];

  if (bienes.length === 0) {
    throw new Error(
      'Debe registrar al menos un bien a transportar.',
    );
  }

  const despatchLines =
    bienes.map(
      (bien, index) => {
        const cantidad =
          Number(bien.cantidad);

        if (
          !Number.isFinite(cantidad) ||
          cantidad <= 0
        ) {
          throw new Error(
            `La cantidad del bien ${index + 1} debe ser mayor a 0.`,
          );
        }

        const unidadMedida =
          bien.unidadMedida ===
          'UNIDAD'
            ? 'NIU'
            : clean(
                bien.unidadMedida ||
                  'NIU',
              );

        const descripcion =
          clean(
            bien.descripcion,
          );

        if (!descripcion) {
          throw new Error(
            `El bien ${index + 1} debe tener descripción.`,
          );
        }

        return {
          'cbc:ID': {
            _text: index + 1,
          },

          'cbc:DeliveredQuantity': {
            _attributes: {
              unitCode:
                unidadMedida,
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
      },
    );

  // ==========================================================
  // UBIGEO PARTIDA
  // ==========================================================

  const ubigeoPartida =
    getUbigeoCode(
      formData.puntoPartida
        .departamento,
      formData.puntoPartida
        .provincia,
      formData.puntoPartida
        .distrito,
    );

  if (!ubigeoPartida) {
    throw new Error(
      'No se pudo obtener el ubigeo del punto de partida.',
    );
  }

  // ==========================================================
  // UBIGEO LLEGADA
  // ==========================================================

  const ubigeoLlegada =
    getUbigeoCode(
      formData.puntoLlegada
        .departamento,
      formData.puntoLlegada
        .provincia,
      formData.puntoLlegada
        .distrito,
    );

  if (!ubigeoLlegada) {
    throw new Error(
      'No se pudo obtener el ubigeo del punto de llegada.',
    );
  }

  // ==========================================================
  // PESO
  // ==========================================================

  const pesoBruto =
    Number(
      formData.pesoBrutoTotal,
    );

  if (
    !Number.isFinite(pesoBruto) ||
    pesoBruto <= 0
  ) {
    throw new Error(
      'El peso bruto total debe ser mayor a 0.',
    );
  }

  const unidadPeso =
    clean(
      formData.unidadMedidaPeso ||
        'KGM',
    );

  // ==========================================================
  // SHIPMENT
  // ==========================================================
  //
  // IMPORTANTE:
  //
  // El orden sigue el JSON de referencia:
  //
  // ID
  // GrossWeightMeasure
  // SpecialInstructions
  // Consignment
  // ShipmentStage
  // Delivery
  // TransportHandlingUnit
  //
  // NO se coloca OriginatorParty directamente dentro de
  // Shipment.
  // ==========================================================

  const shipment: Record<
    string,
    any
  > = {
    // ========================================================
    // SHIPMENT ID
    // ========================================================

    'cbc:ID': {
      _text: 'SUNAT_Envio',
    },

    // ========================================================
    // PESO BRUTO
    // ========================================================

    'cbc:GrossWeightMeasure': {
      _attributes: {
        unitCode: unidadPeso,
      },

      _text: pesoBruto,
    },
  };

  // ==========================================================
  // SPECIAL INSTRUCTIONS
  // ==========================================================

  const specialInstructions: Array<
    Record<string, any>
  > = [];

  /**
   * Transporte subcontratado
   */
  if (
    formData.transporteSubcontratado
  ) {
    specialInstructions.push({
      _text:
        'SUNAT_Envio_IndicadorTrasporteSubcontratado',
    });
  }

  /**
   * Pagador de flete tercero.
   *
   * Se mantiene si el formulario posee esta propiedad.
   */
  if (
    (
      formData as any
    ).pagadorFleteTercero === true
  ) {
    specialInstructions.push({
      _text:
        'SUNAT_Envio_IndicadorPagadorFlete_Tercero',
    });
  }

  if (
    specialInstructions.length > 0
  ) {
    shipment[
      'cbc:SpecialInstructions'
    ] = specialInstructions;
  }

  // ==========================================================
  // CONSIGNMENT
  // ==========================================================
  //
  // IMPORTANTE:
  //
  // Primero SIEMPRE:
  //
  // cbc:ID
  //
  // Después:
  //
  // cac:LogisticsOperatorParty
  //
  // Esto corrige el error 0306.
  // ==========================================================

  if (
    formData.transporteSubcontratado
  ) {
    const rucSubcontrata =
      clean(
        formData.rucEmpresaSubcontrata,
      );

    const nombreSubcontrata =
      clean(
        formData.empresaSubcontrata,
      );

    if (
      !rucSubcontrata
    ) {
      throw new Error(
        'El transporte subcontratado requiere RUC de la empresa subcontratada.',
      );
    }

    if (
      !nombreSubcontrata
    ) {
      throw new Error(
        'El transporte subcontratado requiere razón social.',
      );
    }

    shipment[
      'cac:Consignment'
    ] = {
      'cbc:ID': {
        _text: 'SUNAT_Envio',
      },

      'cac:LogisticsOperatorParty': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID: '6',
            },

            _text:
              rucSubcontrata,
          },
        },

        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text:
              nombreSubcontrata,
          },
        },
      },
    };
  }

  // ==========================================================
  // SHIPMENT STAGE
  // ==========================================================

  const shipmentStage: Record<
    string,
    any
  > = {
    // ========================================================
    // FECHA DE TRASLADO
    // ========================================================

    'cac:TransitPeriod': {
      'cbc:StartDate': {
        _text:
          formData.fechaInicioTraslado ||
          formData.fechaEmision,
      },
    },

    // ========================================================
    // TRANSPORTISTA
    // ========================================================

    'cac:CarrierParty': {
      'cac:PartyIdentification': {
        'cbc:ID': {
          _attributes: {
            schemeID: '6',
          },

          _text:
            clean(
              formData.transportista
                ?.ruc,
            ) || rucEmpresa,
        },
      },

      'cac:PartyLegalEntity': {
        'cbc:CompanyID': {
          _text:
            clean(
              formData.transportista
                ?.registroMTC,
            ),
        },
      },
    },
  };

  // ==========================================================
  // CONDUCTORES
  // ==========================================================

  if (
    driverPersons.length > 0
  ) {
    shipmentStage[
      'cac:DriverPerson'
    ] = driverPersons;
  }

  shipment[
    'cac:ShipmentStage'
  ] = shipmentStage;

  // ==========================================================
  // DELIVERY
  // ==========================================================

  shipment[
    'cac:Delivery'
  ] = {
    // ========================================================
    // LLEGADA
    // ========================================================

    'cac:DeliveryAddress': {
      'cbc:ID': {
        _text:
          ubigeoLlegada,
      },

      'cac:AddressLine': {
        'cbc:Line': {
          _text:
            clean(
              formData.puntoLlegada
                .direccion,
            ),
        },
      },
    },

    // ========================================================
    // PARTIDA
    // ========================================================

    'cac:Despatch': {
      'cac:DespatchAddress': {
        'cbc:ID': {
          _text:
            ubigeoPartida,
        },

        'cac:AddressLine': {
          'cbc:Line': {
            _text:
              clean(
                formData.puntoPartida
                  .direccion,
              ),
          },
        },
      },

      // ======================================================
      // REMITENTE
      // ======================================================

      'cac:DespatchParty': {
        'cac:PartyIdentification': {
          'cbc:ID': {
            _attributes: {
              schemeID:
                getDocumentSchemeId(
                  formData.remitente
                    ?.tipoDocumento ||
                    'RUC',
                  false,
                ),
            },

            _text:
              clean(
                formData.remitente
                  ?.numeroDocumento,
              ),
          },
        },

        'cac:PartyLegalEntity': {
          'cbc:RegistrationName': {
            _text:
              clean(
                formData.remitente
                  ?.nombre,
              ),
          },
        },
      },
    },
  };

  // ==========================================================
  // TRANSPORT HANDLING UNIT
  // ==========================================================

  shipment[
    'cac:TransportHandlingUnit'
  ] = {
    'cac:TransportEquipment':
      transportEquipments.length === 1
        ? transportEquipments[0]
        : transportEquipments,
  };

  // ==========================================================
  // DESPATCH SUPPLIER PARTY
  // ==========================================================

  const despatchSupplierParty = {
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
          _text:
            EMPRESA.nombre,
        },
      },

      'cac:PartyLegalEntity': {
        'cbc:RegistrationName': {
          _text:
            EMPRESA.razonSocial,
        },

        'cac:RegistrationAddress': {
          'cac:AddressLine': {
            'cbc:Line': {
              _text:
                EMPRESA.direccionCompleta,
            },
          },
        },
      },
    },
  };

  // ==========================================================
  // DESTINATARIO
  // ==========================================================

  const destinatarioTipoDocumento =
    normalizeDocumentType(
      formData.destinatario
        ?.tipoDocumento ||
        'RUC',
    );

  const destinatarioNumero =
    clean(
      formData.destinatario
        ?.numeroDocumento,
    );

  const destinatarioNombre =
    clean(
      formData.destinatario
        ?.nombre,
    );

  if (!destinatarioNumero) {
    throw new Error(
      'El destinatario debe tener número de documento.',
    );
  }

  if (!destinatarioNombre) {
    throw new Error(
      'El destinatario debe tener nombre o razón social.',
    );
  }

  const deliveryCustomerParty = {
    'cac:Party': {
      'cac:PartyIdentification': {
        'cbc:ID': {
          _attributes: {
            schemeID:
              getDocumentSchemeId(
                destinatarioTipoDocumento,
                false,
              ),
          },

          _text:
            destinatarioNumero,
        },
      },

      'cac:PartyLegalEntity': {
        'cbc:RegistrationName': {
          _text:
            destinatarioNombre,
        },
      },
    },
  };

  // ==========================================================
  // DOCUMENT BODY
  // ==========================================================

  const documentBody: Record<
    string,
    any
  > = {
    // ========================================================
    // UBL
    // ========================================================

    'cbc:UBLVersionID': {
      _text: '2.1',
    },

    'cbc:CustomizationID': {
      _text: '2.0',
    },

    // ========================================================
    // ID
    // ========================================================

    'cbc:ID': {
      _text:
        `${serieNormalizada}-${numeroNormalizado}`,
    },

    // ========================================================
    // FECHA
    // ========================================================

    'cbc:IssueDate': {
      _text:
        formData.fechaEmision,
    },

    // ========================================================
    // HORA
    // ========================================================

    'cbc:IssueTime': {
      _text: horaActual,
    },

    // ========================================================
    // TIPO GRE
    // ========================================================

    'cbc:DespatchAdviceTypeCode': {
      _text: '31',
    },

    // ========================================================
    // EMISOR
    // ========================================================

    'cac:DespatchSupplierParty':
      despatchSupplierParty,

    // ========================================================
    // DESTINATARIO
    // ========================================================

    'cac:DeliveryCustomerParty':
      deliveryCustomerParty,

    // ========================================================
    // SHIPMENT
    // ========================================================

    'cac:Shipment':
      shipment,

    // ========================================================
    // BIENES
    // ========================================================

    'cac:DespatchLine':
      despatchLines,
  };

  // ==========================================================
  // PAYLOAD FINAL
  // ==========================================================

  return {
    personaId,
    personaToken,
    fileName,
    documentBody,
  };
}