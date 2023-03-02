import { ProdutoEstoque } from './../../dominio/produto-estoque.entity';

export interface IProdutosEstoqueRepository {
  cadastrarProduto(produto: ProdutoEstoque): Promise<ProdutoEstoque>;
  carregarProdutos(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoEstoque[]>;
  carregarProduto(id: string): Promise<ProdutoEstoque>;
  atualizarProduto(
    id: string,
    produto: ProdutoEstoque,
  ): Promise<ProdutoEstoque>;
  atualizarProdutos(
    produtosEstoque: ProdutoEstoque[],
  ): Promise<ProdutoEstoque[]>;
  removerProduto(id: string): Promise<void>;
}
