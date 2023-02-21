import { randomUUID } from 'crypto';
import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from 'src/@core/infra/contratos/produtos-estoque.repository.interface';

export class ProdutosEstoqueRepository implements IProdutosEstoqueRepository {
  private produtos = new Map<string, ProdutoEstoque>();

  async cadastrarProduto(produto: ProdutoEstoque): Promise<ProdutoEstoque> {
    const id = randomUUID();

    const produtoCadastrado = new ProdutoEstoque();

    produtoCadastrado.id = id;
    produtoCadastrado.descricao = produto.descricao;
    produtoCadastrado.nomeProduto = produto.nomeProduto;
    produtoCadastrado.quantidade = produto.quantidade;
    produtoCadastrado.unidade = produto.unidade;

    this.produtos.set(id, produtoCadastrado);
    return { ...produtoCadastrado };
  }

  async carregarProdutos(listaIds?: string[]): Promise<ProdutoEstoque[]> {
    if (listaIds) {
      const lista = [] as ProdutoEstoque[];
      listaIds.forEach((l) => {
        lista.push(this.produtos.get(l));
      });
      return lista;
    }

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
    produto: ProdutoEstoque,
  ): Promise<ProdutoEstoque> {
    const produtoAtualizado = this.produtos.get(id);

    produtoAtualizado.nomeProduto = produto.nomeProduto;
    produtoAtualizado.descricao = produto.descricao;
    produtoAtualizado.quantidade = produto.quantidade;
    produtoAtualizado.unidade = produto.unidade;

    return { ...produtoAtualizado };
  }

  async removerProduto(id: string): Promise<void> {
    if (!this.produtos.delete(id)) {
      throw new Error('produto não encontrado');
    }
  }
}
