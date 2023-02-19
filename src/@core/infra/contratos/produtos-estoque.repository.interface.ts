import { UpdateProdutoEstoqueDto } from './../../dominio/DTOs/update-produto-estoque.dto';
import { CreateProdutoEstoqueDto } from './../../dominio/DTOs/create-produto-estoque.dto';
import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';

export interface IProdutosEstoqueRepository {
  cadastrarProduto(produto: CreateProdutoEstoqueDto): Promise<ProdutoEstoque>;
  carregarProdutos(): Promise<ProdutoEstoque[]>;
  carregarProduto(id: string): Promise<ProdutoEstoque>;
  atualizarProduto(
    id: string,
    produto: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque>;
  removerProduto(id: string): Promise<void>;
}
