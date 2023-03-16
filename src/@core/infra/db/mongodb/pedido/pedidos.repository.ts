import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { NotFoundException } from '../../../../custom-exception/not-found-exception.error';
import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';
import { Pedido } from '../../../../dominio/pedido.entity';
import { ForbiddenException } from './../../../../custom-exception/forbidden-exception.error';
import { IPedidosRepository } from './../../../../infra/contratos/pedidos.repository.interface';
import { PedidoMongoDB } from './pedidos.model';

@Injectable()
export class PedidosRepository implements IPedidosRepository {
  constructor(
    @InjectModel('Pedido')
    private readonly pedidoModel: Model<PedidoMongoDB>,
  ) {}

  async cadastrarPedido(pedido: Pedido): Promise<Pedido> {
    pedido.verificarSeDadosSaoValidosOuErro();

    const pedidoAux = new this.pedidoModel({
      ...pedido,
      _id: randomUUID(),
      produtosVendidos: [],
    });

    const pedidoCadastrado = await pedidoAux.save();
    return this.gerarPedido(pedidoCadastrado);
  }

  async carregarPedidos(idUsuario: string): Promise<Pedido[]> {
    const pedidos = await this.pedidoModel.find({
      idUsuario,
    });

    return pedidos.map((pedidoDb) => this.gerarPedido(pedidoDb));
  }

  async carregarPedido(id: string): Promise<Pedido> {
    const pedido = await this.pedidoModel.findById(id);

    if (!pedido) {
      throw this.erroPedidoNaoEncontrado(id);
    }

    return this.gerarPedido(pedido);
  }

  async atualizarPedido(id: string, pedido: Pedido): Promise<Pedido> {
    pedido.verificarSeDadosSaoValidosOuErro();

    let pedidoAtualizado = await this.pedidoModel.findById(id);

    if (!pedidoAtualizado) {
      throw this.erroPedidoNaoEncontrado(id);
    }

    const novosProdutosVendidosBanco = this.gerarProdutosVendidosBanco(
      pedido.produtosVendidos,
    );
    await this.validarProdutosVendidos(
      novosProdutosVendidosBanco,
      pedido.idUsuario,
    );

    pedidoAtualizado.mesa = pedido.mesa;
    pedidoAtualizado.valorConta = pedido.valorConta;
    pedidoAtualizado.produtosVendidos = novosProdutosVendidosBanco;

    pedidoAtualizado = await pedidoAtualizado.save();

    return this.gerarPedido(pedidoAtualizado);
  }

  async removerPedido(id: string): Promise<void> {
    const pedido = await this.pedidoModel.findById(id);
    if (!pedido) {
      throw this.erroPedidoNaoEncontrado(id);
    }

    await pedido.delete();
  }

  private gerarPedido(dados: PedidoMongoDB): Pedido {
    const pedido = new Pedido();

    pedido.id = dados.id;
    pedido.idUsuario = dados.idUsuario;
    pedido.horaAbertura = new Date(dados.horaAbertura);
    pedido.mesa = dados.mesa;
    pedido.valorConta = dados.valorConta;

    pedido.produtosVendidos = this.gerarProdutosVendidosPedido(
      dados.produtosVendidos,
    );

    return pedido;
  }

  private erroPedidoNaoEncontrado(id: string) {
    return new NotFoundException(`Pedido de id ${id} não encontrado`);
  }

  private gerarProdutosVendidosBanco(produtosVendidos: Map<string, number>) {
    return [...produtosVendidos.entries()].map(
      ([idProdutoCardapio, quantidade]) => {
        return {
          idProdutoCardapio,
          quantidade,
        };
      },
    );
  }

  private gerarProdutosVendidosPedido(
    composicao: Array<{ idProdutoCardapio: string; quantidade: number }>,
  ) {
    return new Map(
      composicao.map(
        (value) =>
          [value.idProdutoCardapio, value.quantidade] as [string, number],
      ),
    );
  }

  private async validarProdutosVendidos(
    produtosVendidos: Array<{
      idProdutoCardapio: string;
      quantidade: number;
    }>,
    idUsuario: string,
  ) {
    // retorna para aux['idsProdutosVendidosValidos'] = [{ _id: string; idUsuario: string }]
    const aux = await new this.pedidoModel({
      produtosVendidos,
    }).populate('idsProdutosVendidosValidos', '_id idUsuario');

    const dadosValidos = new Map();
    aux['idsProdutosVendidosValidos'].forEach(
      (value: { _id: string; idUsuario: string }) =>
        dadosValidos.set(value._id, value.idUsuario),
    );

    const chavesComposicao = produtosVendidos.map((v) => v.idProdutoCardapio);

    chavesComposicao.forEach((idProduto) => {
      if (!dadosValidos.has(idProduto)) {
        throw new UnprocessableEntityException(
          `Produto de id ${idProduto} presente no produto do cardapio não encontrado no estoque`,
        );
      }

      if (dadosValidos.get(idProduto) !== idUsuario) {
        throw new ForbiddenException();
      }
    });
  }
}
