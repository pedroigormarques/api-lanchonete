import { PedidoFechado } from 'src/@core/dominio/pedido-fechado.entity';

export interface IPedidosFechadosRepository {
  cadastrarPedidoFechado(pedidoFechado: PedidoFechado): Promise<PedidoFechado>;
  carregarPedidosFechados(): Promise<PedidoFechado[]>;
  //carregarPedidoFechado(id: string): Promise<PedidoFechado>;
  //removerPedidoFechado(id: string): Promise<void>;
}
