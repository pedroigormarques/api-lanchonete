import { NotFoundException } from './../../../../custom-exception/not-found-exception.error';
import { Pedido } from './../../../../dominio/pedido.entity';
import { IPedidosRepository } from './../../../contratos/pedidos.repository.interface';
import { PedidoDB } from './../modelos/pedido.db-entity';
import { ProdutosCardapioRepository } from './produtos-cardapio.repository';

export class PedidosRepository implements IPedidosRepository {
  private pedidos = new Map<string, PedidoDB>();

  constructor(private cardapioRepositorio: ProdutosCardapioRepository) {}

  async cadastrarPedido(pedido: Pedido): Promise<Pedido> {
    const pedidoCadastrado = new PedidoDB(pedido.idUsuario, pedido.mesa);
    const id = pedidoCadastrado.id;

    this.pedidos.set(id, pedidoCadastrado);
    return new Pedido(pedidoCadastrado);
  }

  async carregarPedidos(idUsuario: string): Promise<Pedido[]> {
    const pedidos = [] as Pedido[];
    this.pedidos.forEach((pedidoDb) => {
      if (pedidoDb.idUsuario === idUsuario) {
        pedidos.push(new Pedido(pedidoDb));
      }
    });
    return pedidos;
  }

  async carregarPedido(id: string): Promise<Pedido> {
    const pedido = this.pedidos.get(id);

    if (!pedido) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    return new Pedido(pedido);
  }

  async atualizarPedido(id: string, pedido: Pedido): Promise<Pedido> {
    const pedidoAtualizado = this.pedidos.get(id);

    if (!pedidoAtualizado) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    pedido.verificarSeDadosSaoValidosOuErro();

    const listaUsoAtual = [...pedido.produtosVendidos.keys()];
    await this.cardapioRepositorio.validarListaIds(
      pedido.idUsuario,
      listaUsoAtual,
    );

    if (pedidoAtualizado.produtosVendidos.size !== 0) {
      const listaUsoAnterior = [...pedidoAtualizado.produtosVendidos.keys()];
      await this.cardapioRepositorio.removerRelacoes(
        id,
        pedido.idUsuario,
        listaUsoAnterior,
      );
    }
    await this.cardapioRepositorio.marcarRelacoes(
      id,
      pedido.idUsuario,
      listaUsoAtual,
    );

    pedidoAtualizado.atualizarDados(pedido);

    return new Pedido(pedidoAtualizado);
  }

  async removerPedido(id: string): Promise<void> {
    const pedido = this.pedidos.get(id);
    if (!pedido) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    const listaUsoAnterior = [...pedido.produtosVendidos.keys()];
    await this.cardapioRepositorio.removerRelacoes(
      id,
      pedido.idUsuario,
      listaUsoAnterior,
    );

    this.pedidos.delete(id);
    return;
  }

  private erroProdutoNaoEncontrado(id: string) {
    return new NotFoundException(`Pedido de id ${id} não encontrado`);
  }
}
