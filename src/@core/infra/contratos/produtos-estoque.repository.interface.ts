import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';

export interface IProdutosEstoqueRepository {
  cadastrarProduto(produto: ProdutoEstoque): Promise<ProdutoEstoque>;
  carregarProdutos(): Promise<ProdutoEstoque[]>;
  carregarProduto(id: string): Promise<ProdutoEstoque>;
  atualizarProduto(id: string, prduto: ProdutoEstoque): Promise<ProdutoEstoque>;
  removerProduto(id: string): Promise<void>;

  /*insert(todo: TodoM): Promise<void>;
  findAll(): Promise<TodoM[]>;
  findById(id: number): Promise<TodoM>;
  updateContent(id: number, isDone: boolean): Promise<void>;
  deleteById(id: number): Promise<void>;*/
}
