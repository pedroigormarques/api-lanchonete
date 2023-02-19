import { ProdutoCardapio } from 'src/@core/dominio/produto-cardapio.entity';

export interface IProdutosCardapioRepository {
  cadastrarProduto(produto: ProdutoCardapio): Promise<ProdutoCardapio>;
  carregarProdutos(): Promise<ProdutoCardapio[]>;
  carregarProduto(id: string): Promise<ProdutoCardapio>;
  atualizarProduto(
    id: string,
    produto: ProdutoCardapio,
  ): Promise<ProdutoCardapio>;
  removerProduto(id: string): Promise<void>;

  /*insert(todo: TodoM): Promise<void>;
  findAll(): Promise<TodoM[]>;
  findById(id: number): Promise<TodoM>;
  updateContent(id: number, isDone: boolean): Promise<void>;
  deleteById(id: number): Promise<void>;*/
}
