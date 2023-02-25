import { PedidoFechadoDB } from '../modelos/pedido-fechado.db-entity';
import { PedidoFechado } from './../../../../dominio/pedido-fechado.entity';
import { IPedidosFechadosRepository } from './../../../contratos/pedidos-fechados.repository.interface';

export class PedidosFechadosRepository implements IPedidosFechadosRepository {
  private pedidosFechados = new Map<string, PedidoFechadoDB>();

  async cadastrarPedidoFechado(
    pedidoFechado: PedidoFechado,
  ): Promise<PedidoFechado> {
    const pedidoFechadoCadastrado = new PedidoFechadoDB(pedidoFechado);
    const id = pedidoFechadoCadastrado.id;

    this.pedidosFechados.set(id, pedidoFechadoCadastrado);
    return pedidoFechadoCadastrado.paraPedidoFechado();
  }

  async carregarPedidosFechados(): Promise<PedidoFechado[]> {
    const pedidosFechados: PedidoFechado[] = [];
    this.pedidosFechados.forEach((pedidoFechado) => {
      pedidosFechados.push(pedidoFechado.paraPedidoFechado());
    });
    return pedidosFechados;
  }
}
