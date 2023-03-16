import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { NotFoundException } from '../../../../custom-exception/not-found-exception.error';
import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';
import { ProdutoCardapio } from '../../../../dominio/produto-cardapio.entity';
import { ForbiddenException } from './../../../../custom-exception/forbidden-exception.error';
import { CATEGORIAS } from './../../../../dominio/enums/categorias.enum';
import { IProdutosCardapioRepository } from './../../../contratos/produtos-cardapio.repository.interface';
import { ProdutoCardapioMongoDB } from './produtos-cardapio.model';

@Injectable()
export class ProdutosCardapioRepository implements IProdutosCardapioRepository {
  constructor(
    @InjectModel('ProdutoCardapio')
    private readonly cardapioModel: Model<ProdutoCardapioMongoDB>,
  ) {}

  async cadastrarProduto(produto: ProdutoCardapio): Promise<ProdutoCardapio> {
    produto.verificarSeDadosSaoValidosOuErro();

    const composicaoTranformada = this.gerarComposicaoBanco(produto.composicao);

    await this.validarComposicao(composicaoTranformada, produto.idUsuario);

    const produtoAux = new this.cardapioModel({
      ...produto,
      _id: randomUUID(),
      composicao: composicaoTranformada,
    });

    const produtoCadastrado = await produtoAux.save();
    return this.gerarProdutoCardapio(produtoCadastrado);
  }

  async carregarProdutos(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoCardapio[]> {
    let produtos;
    if (listaIds) {
      produtos = await this.cardapioModel.find({
        _id: listaIds,
      });

      if (listaIds.length !== produtos.length) {
        const idsEncontrados = produtos.map((produto) => produto.id);

        listaIds.forEach((idProduto) => {
          if (!idsEncontrados.includes(idProduto)) {
            throw new UnprocessableEntityException(
              `Produto de id ${idProduto} presente na lista passada não foi encontrado no cardapio`,
            );
          }
        });
      }

      produtos = produtos.filter((p) => p.idUsuario === idUsuario);
    } else {
      produtos = await this.cardapioModel.find({
        idUsuario,
      });
    }

    return produtos.map((produtoDb) => this.gerarProdutoCardapio(produtoDb));
  }

  async carregarProduto(id: string): Promise<ProdutoCardapio> {
    const produto = await this.cardapioModel.findById(id);

    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    return this.gerarProdutoCardapio(produto);
  }

  async atualizarProduto(
    id: string,
    produto: ProdutoCardapio,
  ): Promise<ProdutoCardapio> {
    let produtoAtualizado = await this.cardapioModel.findById(id);

    if (!produtoAtualizado) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    produto.verificarSeDadosSaoValidosOuErro();

    const novaComposicaoBanco = this.gerarComposicaoBanco(produto.composicao);
    await this.validarComposicao(novaComposicaoBanco, produto.idUsuario);

    produtoAtualizado.descricao = produto.descricao;
    produtoAtualizado.nomeProduto = produto.nomeProduto;
    produtoAtualizado.composicao = novaComposicaoBanco;
    produtoAtualizado.preco = produto.preco;
    produtoAtualizado.categoria = produto.categoria;

    produtoAtualizado = await produtoAtualizado.save();

    return this.gerarProdutoCardapio(produtoAtualizado);
  }

  async removerProduto(id: string): Promise<void> {
    const produto = await this.cardapioModel.findById(id).populate('usadoPor');
    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    // 'usadoPor' - metodo virtual para contar as referencias
    if (produto['usadoPor'] !== 0)
      throw new UnprocessableEntityException(
        `Produto de id ${id} está sendo utilizado em algum pedido aberto`,
      );

    await produto.delete();
  }

  private gerarProdutoCardapio(dados: ProdutoCardapioMongoDB): ProdutoCardapio {
    const produtoCardapio = new ProdutoCardapio();

    produtoCardapio.id = dados.id;
    produtoCardapio.idUsuario = dados.idUsuario;
    produtoCardapio.nomeProduto = dados.nomeProduto;
    produtoCardapio.preco = dados.preco;
    produtoCardapio.descricao = dados.descricao;
    produtoCardapio.categoria = CATEGORIAS[dados.categoria];

    produtoCardapio.composicao = this.gerarComposicaoProduto(dados.composicao);

    return produtoCardapio;
  }

  private erroProdutoNaoEncontrado(id: string) {
    return new NotFoundException(
      `Produto de id ${id} não encontrado no cardapio`,
    );
  }

  private gerarComposicaoBanco(composicao: Map<string, number>) {
    return [...composicao.entries()].map(([idProdutoEstoque, quantidade]) => ({
      idProdutoEstoque,
      quantidade,
    }));
  }

  private gerarComposicaoProduto(
    composicao: Array<{ idProdutoEstoque: string; quantidade: number }>,
  ) {
    return new Map(
      composicao.map(
        (value) =>
          [value.idProdutoEstoque, value.quantidade] as [string, number],
      ),
    );
  }

  private async validarComposicao(
    composicao: Array<{
      idProdutoEstoque: string;
      quantidade: number;
    }>,
    idUsuario: string,
  ) {
    // retorna para aux['idsComposicaoValidos'] = [{ _id: string; idUsuario: string }]
    const aux = await new this.cardapioModel({ composicao }).populate(
      'idsComposicaoValidos',
      '_id idUsuario',
    );

    const dadosValidos = new Map();
    aux['idsComposicaoValidos'].forEach(
      (value: { _id: string; idUsuario: string }) =>
        dadosValidos.set(value._id, value.idUsuario),
    );

    const chavesComposicao = composicao.map((v) => v.idProdutoEstoque);

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
