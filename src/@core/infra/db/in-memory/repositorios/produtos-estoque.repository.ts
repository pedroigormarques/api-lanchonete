import { ProdutoEstoqueDB } from '../modelos/produto-estoque.db-entity';
import { ProdutoEstoque } from './../../../../dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from './../../../contratos/produtos-estoque.repository.interface';

export class ProdutosEstoqueRepository implements IProdutosEstoqueRepository {
  private produtos = new Map<string, ProdutoEstoqueDB>();

  async cadastrarProduto(produto: ProdutoEstoque): Promise<ProdutoEstoque> {
    const produtoCadastrado = new ProdutoEstoqueDB(produto);
    const id = produtoCadastrado.id;
    this.produtos.set(id, produtoCadastrado);

    return new ProdutoEstoque(produtoCadastrado);
  }

  async carregarProdutos(listaIds?: string[]): Promise<ProdutoEstoque[]> {
    const lista: string[] = listaIds ?? [...this.produtos.keys()];

    const listaProdutos = [] as ProdutoEstoque[];
    lista.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw this.erroProdutoNaoEncontrado(idProduto);
      }

      listaProdutos.push(new ProdutoEstoque(produto));
    });
    return listaProdutos;
  }

  async carregarProduto(id: string): Promise<ProdutoEstoque> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    return new ProdutoEstoque(produto);
  }

  async atualizarProduto(
    id: string,
    produto: ProdutoEstoque,
  ): Promise<ProdutoEstoque> {
    const produtoAtualizado = this.produtos.get(id);
    if (!produtoAtualizado) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    produtoAtualizado.atualizarDados(produto);

    return new ProdutoEstoque(produtoAtualizado);
  }

  async removerProduto(id: string): Promise<void> {
    const produto = this.produtos.get(id);
    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    if (produto.usadoPor.size > 0) {
      throw new Error(
        `Produto de id ${id} está sendo utilizado por algum produto do cardápio. Remoção cancelada`,
      );
    }

    this.produtos.delete(id);
  }

  async marcarRelacoes(idProdutoCardapio: string, idProdutos: string[]) {
    await this.validarListaIds(idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.add(idProdutoCardapio);
    });
  }

  async removerRelacoes(idProdutoCardapio: string, idProdutos: string[]) {
    await this.validarListaIds(idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.delete(idProdutoCardapio);
    });
  }

  async validarListaIds(idProdutos: string[]): Promise<void> {
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw this.erroProdutoNaoEncontrado(idProduto);
      }
    });
  }

  private erroProdutoNaoEncontrado(id: string) {
    return new Error(`produto de id ${id} não encontrado`);
  }
}
