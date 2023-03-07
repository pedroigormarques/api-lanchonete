import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';
import { ProdutoEstoqueDB } from '../modelos/produto-estoque.db-entity';
import { ForbiddenException } from './../../../../custom-exception/forbidden-exception.error';
import { NotFoundException } from './../../../../custom-exception/not-found-exception.error';
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

  async carregarProdutos(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoEstoque[]> {
    const listaProdutos = [] as ProdutoEstoque[];
    if (listaIds) {
      listaIds.forEach((idProduto) => {
        const produto = this.produtos.get(idProduto);
        if (!produto) {
          throw new Error(
            `Produto de id ${idProduto} presente na lista passada não foi encontrado no estoque`,
          );
        }
        if (produto.idUsuario === idUsuario) {
          listaProdutos.push(new ProdutoEstoque(produto));
        }
      });
    } else {
      this.produtos.forEach((produtoDb) => {
        if (produtoDb.idUsuario === idUsuario) {
          listaProdutos.push(new ProdutoEstoque(produtoDb));
        }
      });
    }
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

  async atualizarProdutos(
    produtosEstoque: ProdutoEstoque[],
  ): Promise<ProdutoEstoque[]> {
    produtosEstoque.forEach((pe) => {
      const produtoAtualizado = this.produtos.get(pe.id);
      if (!produtoAtualizado) {
        throw new Error(
          `Produto de id ${pe.id} presente na lista de produtos não foi encontrado no estoque`,
        );
      }
      pe.verificarSeDadosSaoValidosOuErro();
    });

    return produtosEstoque.map((pe) => {
      const produtoAtualizado = this.produtos.get(pe.id);
      produtoAtualizado.atualizarDados(pe);
      return new ProdutoEstoque(produtoAtualizado);
    });
  }

  async removerProduto(id: string): Promise<void> {
    const produto = this.produtos.get(id);
    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    if (produto.usadoPor.size > 0) {
      throw new UnprocessableEntityException(
        `Produto de id ${id} está sendo utilizado por algum produto do cardápio. Remoção cancelada`,
      );
    }

    this.produtos.delete(id);
  }

  async marcarRelacoes(
    idProdutoCardapio: string,
    idUsuarioProdutoCardapio: string,
    idProdutos: string[],
  ) {
    await this.validarListaIds(idUsuarioProdutoCardapio, idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.add(idProdutoCardapio);
    });
  }

  async removerRelacoes(
    idProdutoCardapio: string,
    idUsuarioProdutoCardapio: string,
    idProdutos: string[],
  ) {
    await this.validarListaIds(idUsuarioProdutoCardapio, idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.delete(idProdutoCardapio);
    });
  }

  async validarListaIds(
    idUsuarioProdutoCardapio: string,
    idProdutos: string[],
  ): Promise<void> {
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw new Error(
          `Produto de id ${idProduto} presente no produto do cardapio não encontrado no estoque`,
        );
      }
      if (produto.idUsuario !== idUsuarioProdutoCardapio) {
        throw new ForbiddenException();
      }
    });
  }

  private erroProdutoNaoEncontrado(id: string) {
    return new NotFoundException(
      `Produto de id ${id} não encontrado no estoque`,
    );
  }
}
