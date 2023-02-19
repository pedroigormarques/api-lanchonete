import { PedidoFechado } from 'src/@core/dominio/pedido-fechado.entity';

export interface IPedidosFechadosRepository {
  cadastrarPedido(pedido: PedidoFechado): Promise<PedidoFechado>;
  carregarPedidoFechados(): Promise<PedidoFechado[]>;
  carregarPedidoFechado(id: string): Promise<PedidoFechado>;
  //removerPedidoFechado(id: string): Promise<void>;
}
