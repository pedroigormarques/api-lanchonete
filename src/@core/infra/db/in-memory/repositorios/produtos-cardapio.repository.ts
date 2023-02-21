import { randomUUID } from 'crypto';
import { ProdutoCardapio } from 'src/@core/dominio/produto-cardapio.entity';
import { IProdutosCardapioRepository } from 'src/@core/infra/contratos/produtos-cardapio.repository.interface';

export class ProdutosCardapioRepository implements IProdutosCardapioRepository {
  private produtos = new Map<string, ProdutoCardapio>();

  async cadastrarProduto(produto: ProdutoCardapio): Promise<ProdutoCardapio> {
    const id = randomUUID();

    const produtoCadastrado = new ProdutoCardapio();

    produtoCadastrado.id = id;
    produtoCadastrado.descricao = produto.descricao;
    produtoCadastrado.nomeProduto = produto.nomeProduto;
    produtoCadastrado.categoria = produto.categoria;
    produtoCadastrado.composicao = produto.composicao;
    produtoCadastrado.preco = produto.preco;

    this.produtos.set(id, produtoCadastrado);
    return { ...produtoCadastrado };
  }

  async carregarProdutos(listaIds?: string[]): Promise<ProdutoCardapio[]> {
    if (listaIds) {
      const lista = [] as ProdutoCardapio[];
      listaIds.forEach((l) => {
        lista.push(this.produtos.get(l));
      });
      return lista;
    }

    return [...this.produtos.values()];
  }

  async carregarProduto(id: string): Promise<ProdutoCardapio> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw new Error('produto não encontrado');
    }

    return { ...produto };
  }

  async atualizarProduto(
    id: string,
    produto: ProdutoCardapio,
  ): Promise<ProdutoCardapio> {
    const produtoAtualizado = this.produtos.get(id);

    produtoAtualizado.nomeProduto = produto.nomeProduto;
    produtoAtualizado.descricao = produto.descricao;
    produtoAtualizado.categoria = produto.categoria;
    produtoAtualizado.composicao = produto.composicao;
    produtoAtualizado.preco = produto.preco;

    return { ...produtoAtualizado };
  }

  async removerProduto(id: string): Promise<void> {
    if (!this.produtos.delete(id)) {
      throw new Error('produto não encontrado');
    }
  }

  /*private async carregarComposicao(
    produtosCardapio: ProdutoCardapio[],
  ): Promise<ProdutoCardapio[]> {
    const produtosCardapioCopia = [...produtosCardapio];
    const listaIds = [];

    produtosCardapioCopia.forEach((pc) =>
      listaIds.push(
        [...pc.composicao.keys()].filter(
          (idProduto) => !listaIds.includes(idProduto),
        ),
      ),
    );

    const produtosEstoque = await this.estoqueRepositorio.carregarProdutos(
      listaIds,
    );

    const produtosEstoqueMap = new Map<string, ProdutoEstoque>();

    produtosEstoque.forEach((pe) => produtosEstoqueMap.set(pe.id, pe));

    produtosCardapioCopia.forEach((pc) => {
      pc.composicao.forEach(
        (v, k) => (k = produtosEstoqueMap.get(k as string)),
      );
    });

    return produtosCardapioCopia;
  }*/
}
