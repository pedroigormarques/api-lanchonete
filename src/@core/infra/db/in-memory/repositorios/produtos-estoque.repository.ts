import { UpdateProdutoEstoqueDto } from './../../../../dominio/DTOs/update-produto-estoque.dto';
import { CreateProdutoEstoqueDto } from './../../../../dominio/DTOs/create-produto-estoque.dto';
import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from 'src/@core/infra/contratos/produtos-estoque.repository.interface';

import { randomUUID } from 'crypto';

export class ProdutosEstoqueRepository implements IProdutosEstoqueRepository {
  private produtos = new Map<string, ProdutoEstoque>();

  async cadastrarProduto(
    createProdutoEstoqueDto: CreateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    const id = randomUUID();

    const produto = new ProdutoEstoque();

    produto.id = id;
    produto.descricao = createProdutoEstoqueDto.descricao;
    produto.nomeProduto = createProdutoEstoqueDto.nomeProduto;
    produto.quantidade = createProdutoEstoqueDto.quantidade;
    produto.unidade = createProdutoEstoqueDto.unidade;

    this.produtos.set(id, produto);
    return { ...produto };
  }

  async carregarProdutos(): Promise<ProdutoEstoque[]> {
    return [...this.produtos.values()];
  }

  async carregarProduto(id: string): Promise<ProdutoEstoque> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw new Error('produto não encontrado');
    }

    return { ...produto };
  }

  async atualizarProduto(
    id: string,
    updateProdutoEstoqueDto: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw new Error('produto não encontrado');
    }

    if (updateProdutoEstoqueDto.nomeProduto)
      produto.nomeProduto = updateProdutoEstoqueDto.nomeProduto;

    if (updateProdutoEstoqueDto.descricao)
      produto.descricao = updateProdutoEstoqueDto.descricao;

    if (updateProdutoEstoqueDto.quantidade)
      produto.quantidade = updateProdutoEstoqueDto.quantidade;

    if (updateProdutoEstoqueDto.unidade)
      produto.unidade = updateProdutoEstoqueDto.unidade;

    return { ...produto };
  }

  async removerProduto(id: string): Promise<void> {
    if (!this.produtos.delete(id)) {
      throw new Error('produto não encontrado');
    }
  }
}
