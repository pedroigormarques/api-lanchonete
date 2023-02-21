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
    this.composicao = this.criarCopiaProfundaComposicao(produto.composicao);
    this.preco = produto.preco;
  }

  paraProdutoCardapio(): ProdutoCardapio {
    const produto = new ProdutoCardapio();

    produto.id = this.id;
    produto.categoria = this.categoria;
    produto.composicao = this.criarCopiaProfundaComposicao(this.composicao);
    produto.descricao = this.descricao;
    produto.nomeProduto = this.nomeProduto;
    produto.preco = this.preco;

    return produto;
  }

  private criarCopiaProfundaComposicao(
    composicao: Map<string, number>,
  ): Map<string, number> {
    const mapAux = new Map<string, number>();
    composicao.forEach((v, k) => mapAux.set(k, v));
    return mapAux;
  }
}
