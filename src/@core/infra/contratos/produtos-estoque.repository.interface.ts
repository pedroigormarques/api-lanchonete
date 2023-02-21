import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';

export interface IProdutosEstoqueRepository {
  cadastrarProduto(produto: ProdutoEstoque): Promise<ProdutoEstoque>;
  carregarProdutos(listaIds?: string[]): Promise<ProdutoEstoque[]>;
  carregarProduto(id: string): Promise<ProdutoEstoque>;
  atualizarProduto(
    id: string,
    produto: ProdutoEstoque,
  ): Promise<ProdutoEstoque>;
  removerProduto(id: string): Promise<void>;
}
