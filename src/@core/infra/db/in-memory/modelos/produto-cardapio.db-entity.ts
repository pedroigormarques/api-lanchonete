import { criarObjetoComCopiaProfunda } from 'src/@core/helper/criador-copia-profunda.function';
import { randomUUID } from 'crypto';
import { ProdutoCardapio } from 'src/@core/dominio/produto-cardapio.entity';

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
