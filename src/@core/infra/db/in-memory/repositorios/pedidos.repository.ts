import { Pedido } from 'src/@core/dominio/pedido.entity';
import { IPedidosRepository } from './../../../contratos/pedidos.repository.interface';
import { randomUUID } from 'crypto';

export class PedidosRepository implements IPedidosRepository {
  private pedidos = new Map<string, Pedido>();

  async cadastrarPedido(pedido: Pedido): Promise<Pedido> {
    const id = randomUUID();

    const pedidoCadastrado = new Pedido();

    pedidoCadastrado.id = id;
    pedidoCadastrado.horaAbertura = new Date();
    pedidoCadastrado.mesa = pedido.mesa;
    pedidoCadastrado.produtosVendidos = new Map<string, number>();
    pedidoCadastrado.valorConta = 0;

    this.pedidos.set(id, pedidoCadastrado);
    return { ...pedidoCadastrado };
  }

  async carregarPedidos(): Promise<Pedido[]> {
    return [...this.pedidos.values()];
  }

  async carregarPedido(id: string): Promise<Pedido> {
    const pedido = this.pedidos.get(id);

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    return { ...pedido };
  }

  async atualizarPedido(id: string, pedido: Pedido): Promise<Pedido> {
    const pedidoAtualizado = this.pedidos.get(id);

    if (!pedidoAtualizado) {
      throw new Error('Pedido não encontrado');
    }

    if (pedido.mesa) pedidoAtualizado.mesa = pedido.mesa;
    if (pedido.produtosVendidos)
      pedidoAtualizado.produtosVendidos = pedido.produtosVendidos;
    if (pedido.valorConta) pedidoAtualizado.valorConta = pedido.valorConta;

    return { ...pedidoAtualizado };
  }

  async removerPedido(id: string): Promise<void> {
    if (!this.pedidos.delete(id)) {
      throw new Error('Pedido não encontrado');
    }
  }
}
