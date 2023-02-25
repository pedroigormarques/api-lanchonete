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
    await this.estoqueRepository.marcarRelacoes(id, listaUsoAtual);

    this.produtos.set(id, produtoCadastrado);

    return produtoCadastrado.paraProdutoCardapio();
  }

  async carregarProdutos(listaIds?: string[]): Promise<ProdutoCardapio[]> {
    const lista = listaIds ?? [...this.produtos.keys()];

    const listaProdutos = [] as ProdutoCardapio[];
    lista.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      if (!produto) {
        throw this.erroProdutoNaoEncontrado(idProduto);
      }
      listaProdutos.push(produto.paraProdutoCardapio());
    });
    return listaProdutos;
  }

  async carregarProduto(id: string): Promise<ProdutoCardapio> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    return produto.paraProdutoCardapio();
  }

  async atualizarProduto(
    id: string,
    produto: ProdutoCardapio,
  ): Promise<ProdutoCardapio> {
    const produtoAtualizado = this.produtos.get(id);
    if (!produtoAtualizado) {
      throw this.erroProdutoNaoEncontrado(id);
    }

    if (produto.composicao instanceof Map) {
      if (produto.composicao.size === 0) {
        throw new Error('Composição não inserida (composição vazia)');
      }
    } else {
      throw new Error('Erro no formato da composição');
    }

    const listaUsoAtual: string[] = [...produto.composicao.keys()];
    await this.estoqueRepository.validarListaIds(listaUsoAtual);

    const listaUsoAnterior = [...produtoAtualizado.composicao.keys()];
    await this.estoqueRepository.removerRelacoes(id, listaUsoAnterior);
    await this.estoqueRepository.marcarRelacoes(id, listaUsoAtual);

    produtoAtualizado.carregarDadosBase(produto);

    return produtoAtualizado.paraProdutoCardapio();
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
    await this.estoqueRepository.removerRelacoes(id, listaUsoAnterior);

    this.produtos.delete(id);
  }

  async marcarRelacoes(idPedido: string, idProdutos: string[]) {
    await this.validarListaIds(idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.add(idPedido);
    });
  }

  async removerRelacoes(idPedido: string, idProdutos: string[]) {
    await this.validarListaIds(idProdutos);
    idProdutos.forEach((idProduto) => {
      const produto = this.produtos.get(idProduto);
      produto.usadoPor.delete(idPedido);
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

  private erroProdutoSendoUtilizado(id: string) {
    return new Error(
      `produto de id ${id} está sendo utilizado em algum pedido aberto`,
    );
  }
}
