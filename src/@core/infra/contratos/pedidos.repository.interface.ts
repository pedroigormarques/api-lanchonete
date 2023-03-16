import { Pedido } from './../../dominio/pedido.entity';

export interface IPedidosRepository {
  cadastrarPedido(pedido: Pedido): Promise<Pedido>;
  carregarPedidos(idUsuario: string): Promise<Pedido[]>;
  carregarPedido(id: string): Promise<Pedido>;
  atualizarPedido(id: string, pedido: Pedido): Promise<Pedido>;
  removerPedido(id: string): Promise<void>;
}
