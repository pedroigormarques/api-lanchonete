import { criarObjetoComCopiaProfunda } from 'src/@core/helper/criador-copia-profunda.function';
import { randomUUID } from 'crypto';
import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';

export class ProdutoEstoqueDB extends ProdutoEstoque {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoEstoque) {
    super();
    this.id = randomUUID();
    this.carregarDadosBase(produto);
  }

  carregarDadosBase(produto: ProdutoEstoque) {
    this.descricao = produto.descricao;
    this.nomeProduto = produto.nomeProduto;
    this.quantidade = produto.quantidade;
    this.unidade = produto.unidade;
  }

  paraProdutoEstoque(): ProdutoEstoque {
    return criarObjetoComCopiaProfunda<ProdutoEstoqueDB, ProdutoEstoque>(
      this,
      ProdutoEstoque,
      ['usadoPor'],
    );
  }
}
