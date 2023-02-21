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
    const produto = new ProdutoEstoque();
    produto.id = this.id;
    produto.descricao = this.descricao;
    produto.nomeProduto = this.nomeProduto;
    produto.quantidade = this.quantidade;
    produto.unidade = this.unidade;
    return produto;
  }
}
