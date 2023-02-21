import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from 'src/@core/infra/contratos/produtos-estoque.repository.interface';

import { ProdutoEstoqueDB } from '../modelos/produto-estoque.db-entity';

export class ProdutosEstoqueRepository implements IProdutosEstoqueRepository {
  private produtos = new Map<string, ProdutoEstoqueDB>();

  async cadastrarProduto(produto: ProdutoEstoque): Promise<ProdutoEstoque> {
    const produtoCadastrado = new ProdutoEstoqueDB(produto);
    const id = produtoCadastrado.id;
    this.produtos.set(id, produtoCadastrado);

    return produtoCadastrado.paraProdutoEstoque();
  }

  async carregarProdutos(listaIds?: string[]): Promise<ProdutoEstoque[]> {
    const lista: string[] = listaIds ?? [...this.produtos.keys()];

    const listaProdutos = [] as ProdutoEstoque[];
    lista.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw this.erroProdutoNaoEncontrado(idProduto);
      }

      listaProdutos.push(produto.paraProdutoEstoque());
    });
    return listaProdutos;
  }

  async carregarProduto(id: string): Promise<ProdutoEstoque> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    return produto.paraProdutoEstoque();
  }

  async atualizarProduto(
    id: string,
    produto: ProdutoEstoque,
  ): Promise<ProdutoEstoque> {
    const produtoAtualizado = this.produtos.get(id);
    if (!produtoAtualizado) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    produtoAtualizado.carregarDadosBase(produto);

    return produtoAtualizado.paraProdutoEstoque();
  }

  async removerProduto(id: string): Promise<void> {
    const produto = this.produtos.get(id);
    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    if (produto.usadoPor.size > 0) {
      throw this.erroProdutoSendoUtilizado(id);
    }

    this.produtos.delete(id);
  }

  async marcarRelacoes(idProdutoCardapio: string, idProdutos: string[]) {
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw this.erroProdutoNaoEncontrado(idProduto);
      }
      produto.usadoPor.add(idProdutoCardapio);
    });
  }

  async removerRelacoes(idProdutoCardapio: string, idProdutos: string[]) {
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw this.erroProdutoNaoEncontrado(idProduto);
      }
      produto.usadoPor.delete(idProdutoCardapio);
    });
  }

  private erroProdutoNaoEncontrado(id: string) {
    return new Error(`produto de id ${id} não encontrado`);
  }

  private erroProdutoSendoUtilizado(id: string) {
    return new Error(
      `produto de id ${id} está sendo utilizado por algum produto do cardápio`,
    );
  }
}
