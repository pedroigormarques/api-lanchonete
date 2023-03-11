import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';
import { ForbiddenException } from './../../../../custom-exception/forbidden-exception.error';
import { NotFoundException } from './../../../../custom-exception/not-found-exception.error';
import { ProdutoCardapio } from './../../../../dominio/produto-cardapio.entity';
import { IProdutosCardapioRepository } from './../../../contratos/produtos-cardapio.repository.interface';
import { ProdutoCardapioDB } from './../modelos/produto-cardapio.db-entity';
import { ProdutosEstoqueRepository } from './produtos-estoque.repository';

export class ProdutosCardapioRepository implements IProdutosCardapioRepository {
  constructor(private estoqueRepository: ProdutosEstoqueRepository) {}

  private produtos = new Map<string, ProdutoCardapioDB>();

  async cadastrarProduto(produto: ProdutoCardapio): Promise<ProdutoCardapio> {
    const produtoCadastrado = new ProdutoCardapioDB(produto);
    const id = produtoCadastrado.id;

    const listaUsoAtual = [...produto.composicao.keys()];
    await this.estoqueRepository.marcarRelacoes(
      id,
      produto.idUsuario,
      listaUsoAtual,
    );

    this.produtos.set(id, produtoCadastrado);

    return new ProdutoCardapio(produtoCadastrado);
  }

  async carregarProdutos(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoCardapio[]> {
    const listaProdutos = [] as ProdutoCardapio[];
    if (listaIds) {
      listaIds.forEach((idProduto) => {
        const produto = this.produtos.get(idProduto);
        if (!produto) {
          throw new UnprocessableEntityException(
            `Produto de id ${idProduto} presente na lista passada não foi encontrado no cardapio`,
          );
        }
        if (produto.idUsuario === idUsuario) {
          listaProdutos.push(new ProdutoCardapio(produto));
        }
      });
    } else {
      this.produtos.forEach((produtoDb) => {
        if (produtoDb.idUsuario === idUsuario) {
          listaProdutos.push(new ProdutoCardapio(produtoDb));
        }
      });
    }
    return listaProdutos;
  }

  async carregarProduto(id: string): Promise<ProdutoCardapio> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    return new ProdutoCardapio(produto);
  }

  async atualizarProduto(
    id: string,
    produto: ProdutoCardapio,
  ): Promise<ProdutoCardapio> {
    const produtoAtualizado = this.produtos.get(id);
    if (!produtoAtualizado) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    produto.verificarSeDadosSaoValidosOuErro();

    const listaUsoAtual: string[] = [...produto.composicao.keys()];
    await this.estoqueRepository.validarListaIds(
      produto.idUsuario,
      listaUsoAtual,
    );

    const listaUsoAnterior = [...produtoAtualizado.composicao.keys()];
    await this.estoqueRepository.removerRelacoes(
      id,
      produto.idUsuario,
      listaUsoAnterior,
    );
    await this.estoqueRepository.marcarRelacoes(
      id,
      produto.idUsuario,
      listaUsoAtual,
    );

    produtoAtualizado.atualizarDados(produto);

    return new ProdutoCardapio(produtoAtualizado);
  }

  async removerProduto(id: string): Promise<void> {
    const produto = this.produtos.get(id);
    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    if (produto.usadoPor.size > 0) {
      throw this.erroProdutoSendoUtilizado(id);
    }

    const listaUsoAnterior = [...produto.composicao.keys()];
    await this.estoqueRepository.removerRelacoes(
      id,
      produto.idUsuario,
      listaUsoAnterior,
    );

    this.produtos.delete(id);
  }

  async marcarRelacoes(
    idPedido: string,
    idUsuarioPedido: string,
    idProdutos: string[],
  ) {
    await this.validarListaIds(idUsuarioPedido, idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.add(idPedido);
    });
  }

  async removerRelacoes(
    idPedido: string,
    idUsuarioPedido: string,
    idProdutos: string[],
  ) {
    await this.validarListaIds(idUsuarioPedido, idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.delete(idPedido);
    });
  }

  async validarListaIds(
    idUsuarioPedido: string,
    idProdutos: string[],
  ): Promise<void> {
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw new UnprocessableEntityException(
          `Produto de id ${idProduto} presente no pedido não encontrado no cardapio`,
        );
      }
      if (produto.idUsuario !== idUsuarioPedido) {
        throw new ForbiddenException();
      }
    });
  }

  private erroProdutoNaoEncontrado(id: string) {
    return new NotFoundException(
      `Produto de id ${id} não encontrado no cardapio`,
    );
  }

  private erroProdutoSendoUtilizado(id: string) {
    return new UnprocessableEntityException(
      `Produto de id ${id} está sendo utilizado em algum pedido aberto`,
    );
  }
}
