import { UpdateProdutoCardapioDto } from './../../../../dominio/DTOs/update-produto-cardapio.dto';
import { CreateProdutoCardapioDto } from './../../../../dominio/DTOs/create-produto-cardapio.dto';
import { ProdutoCardapio } from 'src/@core/dominio/produto-cardapio.entity';
import { IProdutosCardapioRepository } from 'src/@core/infra/contratos/produtos-cardapio.repository.interface';
import { randomUUID } from 'crypto';

export class ProdutosCardapioRepository implements IProdutosCardapioRepository {
  private produtos = new Map<string, ProdutoCardapio>();

  async cadastrarProduto(
    createProdutoCardapioDto: CreateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    const id = randomUUID();

    const produto = new ProdutoCardapio();

    produto.id = id;
    produto.descricao = createProdutoCardapioDto.descricao;
    produto.nomeProduto = createProdutoCardapioDto.nomeProduto;
    produto.categoria = createProdutoCardapioDto.categoria;
    produto.composicao = createProdutoCardapioDto.composicao;
    produto.preco = createProdutoCardapioDto.preco;

    this.produtos.set(id, produto);
    return { ...produto };
  }

  async carregarProdutos(): Promise<ProdutoCardapio[]> {
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
    updateProdutoCardapioDto: UpdateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    const produto = this.produtos.get(id);

    if (!produto) {
      throw new Error('produto não encontrado');
    }

    if (updateProdutoCardapioDto.nomeProduto)
      produto.nomeProduto = updateProdutoCardapioDto.nomeProduto;

    if (updateProdutoCardapioDto.descricao)
      produto.descricao = updateProdutoCardapioDto.descricao;

    if (updateProdutoCardapioDto.categoria)
      produto.categoria = updateProdutoCardapioDto.categoria;

    if (updateProdutoCardapioDto.composicao)
      produto.composicao = updateProdutoCardapioDto.composicao;

    if (updateProdutoCardapioDto.preco)
      produto.preco = updateProdutoCardapioDto.preco;

    return { ...produto };
  }

  async removerProduto(id: string): Promise<void> {
    if (!this.produtos.delete(id)) {
      throw new Error('produto não encontrado');
    }
  }
}
