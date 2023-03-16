import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { IPedidosFechadosRepository } from '../../../contratos/pedidos-fechados.repository.interface';
import { PedidoFechado } from './../../../../dominio/pedido-fechado.entity';
import { ProdutoCardapio } from './../../../../dominio/produto-cardapio.entity';
import { ProdutoEstoque } from './../../../../dominio/produto-estoque.entity';
import { PedidoFechadoMongoDB } from './pedidos-fechados.model';

@Injectable()
export class PedidosFechadosRepository implements IPedidosFechadosRepository {
  constructor(
    @InjectModel('PedidoFechado')
    private readonly pedidoFechadoModel: Model<PedidoFechadoMongoDB>,
  ) {}

  async cadastrarPedidoFechado(
    pedidoFechado: PedidoFechado,
  ): Promise<PedidoFechado> {
    pedidoFechado.verificarSeDadosSaoValidosOuErro();

    const pedidoAux = new this.pedidoFechadoModel({
      ...pedidoFechado,
      _id: randomUUID(),
      produtosVendidos: this.gerarProdutosVendidosBanco(
        pedidoFechado.produtosVendidos,
      ),
      produtosUtilizados: this.gerarProdutosUtilizadosBanco(
        pedidoFechado.produtosUtilizados,
      ),
    });

    const pedidoCadastrado = await pedidoAux.save();
    return this.gerarPedidoFechado(pedidoCadastrado);
  }

  async carregarPedidosFechados(idUsuario: string): Promise<PedidoFechado[]> {
    const pedidosFechados = await this.pedidoFechadoModel.find({
      idUsuario,
    });

    return pedidosFechados.map((pedidoDb) => this.gerarPedidoFechado(pedidoDb));
  }

  private gerarPedidoFechado(dados: PedidoFechadoMongoDB): PedidoFechado {
    const pedidoFechado = new PedidoFechado();

    pedidoFechado.id = dados.id;
    pedidoFechado.idUsuario = dados.idUsuario;
    pedidoFechado.horaAbertura = new Date(dados.horaAbertura);
    pedidoFechado.horaFechamento = new Date(dados.horaAbertura);
    pedidoFechado.mesa = dados.mesa;
    pedidoFechado.valorConta = dados.valorConta;

    pedidoFechado.produtosVendidos = this.gerarProdutosVendidosPedido(
      dados.produtosVendidos,
    );
    pedidoFechado.produtosUtilizados = this.gerarProdutosUtilizadosPedido(
      dados.produtosUtilizados,
    );

    return pedidoFechado;
  }

  private gerarProdutosVendidosBanco(
    produtosVendidos: Map<ProdutoCardapio, number>,
  ): Array<{ produtoCardapio: string; quantidade: number }> {
    return [...produtosVendidos.entries()].map(
      ([produtoCardapio, quantidade]) => {
        const aux = {
          ...produtoCardapio,
          composicao: [...produtoCardapio.composicao.entries()],
        };
        return {
          produtoCardapio: JSON.stringify(aux),
          quantidade,
        };
      },
    );
  }

  private gerarProdutosVendidosPedido(
    produtosVendidos: Array<{ produtoCardapio: string; quantidade: number }>,
  ): Map<ProdutoCardapio, number> {
    return new Map(
      produtosVendidos.map((value) => {
        const aux = JSON.parse(value.produtoCardapio);
        aux.composicao = new Map(aux.composicao);

        return [Object.assign(ProdutoCardapio, aux), value.quantidade] as [
          ProdutoCardapio,
          number,
        ];
      }),
    );
  }
  private gerarProdutosUtilizadosBanco(
    produtosUtilizados: Map<ProdutoEstoque, number>,
  ): Array<{ produtoEstoque: string; quantidade: number }> {
    return [...produtosUtilizados.entries()].map(
      ([produtoEstoque, quantidade]) => {
        return {
          produtoEstoque: JSON.stringify(produtoEstoque),
          quantidade,
        };
      },
    );
  }

  private gerarProdutosUtilizadosPedido(
    produtosUtilizados: Array<{ produtoEstoque: string; quantidade: number }>,
  ): Map<ProdutoEstoque, number> {
    return new Map(
      produtosUtilizados.map((value) => {
        return [
          Object.assign(ProdutoEstoque, JSON.parse(value.produtoEstoque)),
          value.quantidade,
        ] as [ProdutoEstoque, number];
      }),
    );
  }
}
