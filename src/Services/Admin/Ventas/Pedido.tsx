  import { api } from '../../../Services/apiService';
  import type { PedidoInsertDto,PedidoUpdateEstadoDto,PedidoSelectIdDto,PedidoSelectDto } from '../../../Types/Admin/Ventas/Pedido';

  export const PedidoService = {

    createPedido: async (data: PedidoInsertDto): Promise<{
      success: boolean;
      mensaje: string;
      idPedido: number;
    }> => {

      return api.request('/PedidosRecibidos/Insertar', {
        method: 'POST',
        body: JSON.stringify(data)
      });

    },
    cambiarEstado: async (
      data: PedidoUpdateEstadoDto
    ): Promise<{
      success: boolean;
      mensaje: string;
    }> => {

      return api.request('/PedidosRecibidos/CambiarEstado', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    getPedidoById: async (id: number): Promise<PedidoSelectIdDto> => {
      return api.request<PedidoSelectIdDto>(
        `/PedidosRecibidos/${id}`,
        {
          method: 'GET'
        }
      );
    },
    getPedidos: async (): Promise<PedidoSelectDto[]> => {
      return api.request<PedidoSelectDto[]>(
        '/PedidosRecibidos/Lista',
        {
          method: 'GET'
        }
      );
    },
  };

