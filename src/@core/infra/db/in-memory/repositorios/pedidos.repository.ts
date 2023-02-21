import { PedidoDB } from './../modelos/pedido.db-entity';
import { Pedido } from 'src/@core/dominio/pedido.entity';

import { IPedidosRepository } from './../../../contratos/pedidos.repository.interface';
import { ProdutosCardapioRepository } from './produtos-cardapio.repository';

export class PedidosRepository implements IPedidosRepository {
  private pedidos = new Map<string, PedidoDB>();

  constructor(private cardapioRepositorio: ProdutosCardapioRepository) {}

  async cadastrarPedido(pedido: Pedido): Promise<Pedido> {
    const pedidoCadastrado = new PedidoDB(pedido.mesa);
    const id = pedidoCadastrado.id;

    const listaUsoAtual = [...pedido.produtosVendidos.keys()];
    this.cardapioRepositorio.marcarRelacoes(id, listaUsoAtual);

    this.pedidos.set(id, pedidoCadastrado);
    return pedidoCadastrado.paraPedido();
  }

  async carregarPedidos(): Promise<Pedido[]> {
    const pedidos = [] as Pedido[];
    this.pedidos.forEach((pedidoDb) => pedidos.push(pedidoDb.paraPedido()));
    return pedidos;
  }

  async carregarPedido(id: string): Promise<Pedido> {
    const pedido = this.pedidos.get(id);

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    return pedido.paraPedido();
  }

  async atualizarPedido(id: string, pedido: Pedido): Promise<Pedido> {
    const pedidoAtualizado = this.pedidos.get(id);

    if (!pedidoAtualizado) {
      throw new Error('Pedido não encontrado');
    }

    const listaUsoAnterior = [...pedidoAtualizado.produtosVendidos.keys()];
    this.cardapioRepositorio.removerRelacoes(id, listaUsoAnterior);
    const listaUsoAtual = [...pedido.produtosVendidos.keys()];
    this.cardapioRepositorio.marcarRelacoes(id, listaUsoAtual);

    pedidoAtualizado.carregarDadosBase(pedido);

    return pedidoAtualizado.paraPedido();
  }

  async removerPedido(id: string): Promise<void> {
    if (!this.pedidos.delete(id)) {
      throw new Error('Pedido não encontrado');
    }
  }
}
