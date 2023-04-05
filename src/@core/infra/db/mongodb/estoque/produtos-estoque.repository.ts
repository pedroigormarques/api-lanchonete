import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { NotFoundException } from '../../../../custom-exception/not-found-exception.error';
import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';
import { ProdutoEstoque } from '../../../../dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from '../../../contratos/produtos-estoque.repository.interface';
import { UNIDADES } from './../../../../dominio/enums/unidades.enum';
import { ProdutoEstoqueMongoDB } from './produtos-estoque.model';

@Injectable()
export class ProdutoEstoqueRepository implements IProdutosEstoqueRepository {
  constructor(
    @InjectModel('ProdutoEstoque')
    private readonly estoqueModel: Model<ProdutoEstoqueMongoDB>,
  ) {}

  async cadastrarProduto(produto: ProdutoEstoque): Promise<ProdutoEstoque> {
    produto.verificarSeDadosSaoValidosOuErro();

    const produtoAux = new this.estoqueModel({
      ...produto,
      _id: randomUUID(),
    });

    const produtoCadastrado = await produtoAux.save();

    return this.gerarProdutoEstoque(produtoCadastrado);
  }

  async carregarProdutos(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoEstoque[]> {
    let produtos: ProdutoEstoqueMongoDB[];

    if (listaIds) {
      produtos = await this.estoqueModel.find({
        _id: listaIds,
      });

      if (listaIds.length !== produtos.length) {
        const idsEncontrados = produtos.map((produto) => produto.id);

        listaIds.forEach((idProduto) => {
          if (!idsEncontrados.includes(idProduto)) {
            throw new UnprocessableEntityException(
              `Produto de id ${idProduto} presente na lista passada não foi encontrado no estoque`,
            );
          }
        });
      }

      produtos = produtos.filter((p) => p.idUsuario === idUsuario);
    } else {
      produtos = await this.estoqueModel.find({
        idUsuario,
      });
    }

    return produtos.map((produtoDb) => this.gerarProdutoEstoque(produtoDb));
  }

  async carregarProduto(id: string): Promise<ProdutoEstoque> {
    const produto = await this.estoqueModel.findById(id);

    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    return this.gerarProdutoEstoque(produto);
  }

  async atualizarProduto(
    id: string,
    produto: ProdutoEstoque,
  ): Promise<ProdutoEstoque> {
    let produtoAtualizado = await this.estoqueModel.findById(id);

    if (!produtoAtualizado) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    produto.verificarSeDadosSaoValidosOuErro();

    if (produtoAtualizado.unidade !== produto.unidade) {
      await produtoAtualizado.populate('usadoPor');
      if (produto['usadoPor'] !== 0) {
        throw new UnprocessableEntityException(
          `Produto do estoque de id ${produtoAtualizado.id} está sendo utilizado por algum produto do cardápio. Atualização cancelada`,
        );
      }
    }

    produtoAtualizado.nomeProduto = produto.nomeProduto;
    produtoAtualizado.descricao = produto.descricao;
    produtoAtualizado.unidade = produto.unidade;
    produtoAtualizado.quantidade = produto.quantidade;

    produtoAtualizado = await produtoAtualizado.save();

    return this.gerarProdutoEstoque(produtoAtualizado);
  }

  async atualizarProdutos(
    produtosEstoque: ProdutoEstoque[],
  ): Promise<ProdutoEstoque[]> {
    const produtos = await this.estoqueModel.find({
      _id: produtosEstoque.map((p) => p.id),
    });

    const idsEncontrados = produtos.map((produto) => produto.id);

    produtosEstoque.forEach((p) => {
      if (!idsEncontrados.includes(p.id)) {
        throw new UnprocessableEntityException(
          `Produto de id ${p.id} presente na lista de produtos não foi encontrado no estoque`,
        );
      }
      p.verificarSeDadosSaoValidosOuErro();
    });

    const listaAtualizada = [] as ProdutoEstoque[];

    for (const p of produtosEstoque) {
      let produtoAtualizado = await this.estoqueModel.findById(p.id);

      produtoAtualizado.nomeProduto = p.nomeProduto;
      produtoAtualizado.descricao = p.descricao;
      produtoAtualizado.unidade = p.unidade;
      produtoAtualizado.quantidade = p.quantidade;

      produtoAtualizado = await produtoAtualizado.save();

      listaAtualizada.push(this.gerarProdutoEstoque(produtoAtualizado));
    }

    return listaAtualizada;
  }

  async removerProduto(id: string): Promise<void> {
    const produto = await this.estoqueModel.findById(id).populate('usadoPor');
    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    // 'usadoPor' - metodo virtual para contar as referencias
    if (produto['usadoPor'] !== 0) {
      throw new UnprocessableEntityException(
        `Produto de id ${id} está sendo utilizado por algum produto do cardápio. Remoção cancelada`,
      );
    }

    await produto.delete();
  }

  private gerarProdutoEstoque(dados: ProdutoEstoqueMongoDB): ProdutoEstoque {
    const produtoEstoque = new ProdutoEstoque();
    produtoEstoque.id = dados.id;
    produtoEstoque.idUsuario = dados.idUsuario;
    produtoEstoque.nomeProduto = dados.nomeProduto;
    produtoEstoque.descricao = dados.descricao;
    produtoEstoque.quantidade = dados.quantidade;
    produtoEstoque.unidade = UNIDADES[dados.unidade];
    return produtoEstoque;
  }

  private erroProdutoNaoEncontrado(id: string) {
    return new NotFoundException(
      `Produto de id ${id} não encontrado no estoque`,
    );
  }
}
