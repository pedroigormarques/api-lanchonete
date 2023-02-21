import { ProdutoCardapio } from 'src/@core/dominio/produto-cardapio.entity';

export interface IProdutosCardapioRepository {
  cadastrarProduto(produto: ProdutoCardapio): Promise<ProdutoCardapio>;

  carregarProdutos(listaIds?: string[]): Promise<ProdutoCardapio[]>;

  carregarProduto(id: string): Promise<ProdutoCardapio>;

  atualizarProduto(
    id: string,
    produto: ProdutoCardapio,
  ): Promise<ProdutoCardapio>;

  removerProduto(id: string): Promise<void>;
}
