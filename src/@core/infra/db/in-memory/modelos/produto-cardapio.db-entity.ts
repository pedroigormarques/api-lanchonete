import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';
import { ProdutoCardapio } from './../../../../dominio/produto-cardapio.entity';

import { randomUUID } from 'crypto';

export class ProdutoCardapioDB extends ProdutoCardapio {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoCardapio) {
    super();
    this.id = randomUUID();
    this.carregarDadosBase(produto);
  }

  carregarDadosBase(produto: ProdutoCardapio) {
    this.descricao = produto.descricao;
    this.nomeProduto = produto.nomeProduto;
    this.categoria = produto.categoria;
    this.composicao = new Map(produto.composicao.entries());
    this.preco = produto.preco;
  }

  paraProdutoCardapio(): ProdutoCardapio {
    return criarObjetoComCopiaProfunda<ProdutoCardapioDB, ProdutoCardapio>(
      this,
      ProdutoCardapio,
      ['usadoPor'],
    );
  }
}
