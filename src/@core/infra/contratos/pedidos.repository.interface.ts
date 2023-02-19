import { Pedido } from 'src/@core/dominio/pedido.entity';

export interface IPedidosRepository {
  cadastrarPedido(pedido: Pedido): Promise<Pedido>;
  carregarPedidos(): Promise<Pedido[]>;
  carregarPedido(id: string): Promise<Pedido>;
  atualizarPedido(id: string, pedido: Pedido): Promise<Pedido>;
  removerPedido(id: string): Promise<void>;

  /*insert(todo: TodoM): Promise<void>;
  findAll(): Promise<TodoM[]>;
  findById(id: number): Promise<TodoM>;
  updateContent(id: number, isDone: boolean): Promise<void>;
  deleteById(id: number): Promise<void>;*/
}
