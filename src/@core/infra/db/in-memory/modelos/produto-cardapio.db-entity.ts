import { randomUUID } from 'crypto';

import { CATEGORIAS } from './../../../../dominio/enums/categorias.enum';
import { ProdutoCardapio } from './../../../../dominio/produto-cardapio.entity';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';
import { possuiUmValorValidoParaOEnum } from './../../../../helper/manipular-enum.function';

export class ProdutoCardapioDB extends ProdutoCardapio {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoCardapio) {
    super();
    ProdutoCardapioDB.validarDados(produto);

    this.id = randomUUID();
    this.descricao = produto.descricao;
    this.nomeProduto = produto.nomeProduto;
    this.composicao = new Map(produto.composicao.entries());
    this.preco = produto.preco;
    this.categoria = produto.categoria;
  }

  static validarDados(produto: ProdutoCardapio): void {
    if (
      typeof produto.descricao !== 'string' ||
      typeof produto.nomeProduto !== 'string' ||
      typeof produto.preco !== 'number' ||
      !possuiUmValorValidoParaOEnum(produto.categoria, CATEGORIAS) ||
      !(produto.composicao instanceof Map) ||
      produto.composicao.size === 0
    ) {
      throw new Error('Dados insuficientes/incorretos');
    }
  }

  carregarDadosBase(produto: ProdutoCardapio) {
    ProdutoCardapioDB.validarDados(produto);
    this.descricao = produto.descricao;
    this.nomeProduto = produto.nomeProduto;
    this.composicao = new Map(produto.composicao.entries());
    this.preco = produto.preco;
    this.categoria = produto.categoria;
  }

  paraProdutoCardapio(): ProdutoCardapio {
    return criarObjetoComCopiaProfunda<ProdutoCardapioDB, ProdutoCardapio>(
      this,
      ProdutoCardapio,
      ['usadoPor'],
    );
  }
}
