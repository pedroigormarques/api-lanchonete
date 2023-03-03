import { PedidoFechado } from './../../dominio/pedido-fechado.entity';

export interface IPedidosFechadosRepository {
  cadastrarPedidoFechado(pedidoFechado: PedidoFechado): Promise<PedidoFechado>;
  carregarPedidosFechados(idUsuario: string): Promise<PedidoFechado[]>;
  //carregarPedidoFechado(id: string): Promise<PedidoFechado>;
  //removerPedidoFechado(id: string): Promise<void>;
}
