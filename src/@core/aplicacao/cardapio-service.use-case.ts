import { ListaEvento } from './../dominio/lista-evento.entity';
import { ProdutoCardapio } from '../dominio/produto-cardapio.entity';
import { IProdutosCardapioRepository } from '../infra/contratos/produtos-cardapio.repository.interface';
import { DocChangeEvent } from '../dominio/doc-change-event.entity';
import { TipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';

import { CreateProdutoCardapioDto } from '../dominio/DTOs/create-produto-cardapio.dto';
import { UpdateProdutoCardapioDto } from '../dominio/DTOs/update-produto-cardapio.dto';
import { NotificadorDeEventos } from './notificadorDeEventos';

export class CardapioService extends NotificadorDeEventos<ProdutoCardapio> {
  constructor(private cardapioRepositorio: IProdutosCardapioRepository) {
    super();
  }

  static async create(
    cardapioRepositorio: IProdutosCardapioRepository,
  ): Promise<CardapioService> {
    const cardapioService = new CardapioService(cardapioRepositorio);
    const dadosIniciais = await cardapioService.carregarProdutosCardapio();
    cardapioService.carregarDadosIniciais(dadosIniciais);
    return cardapioService;
  }

  async cadastrarProdutoCardapio(
    dadosProdutoCardapio: CreateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    let produto = new ProdutoCardapio();
    produto.descricao = dadosProdutoCardapio.descricao;
    produto.nomeProduto = dadosProdutoCardapio.nomeProduto;
    produto.categoria = dadosProdutoCardapio.categoria;
    produto.composicao = dadosProdutoCardapio.composicao;
    produto.preco = dadosProdutoCardapio.preco;

    produto = await this.cardapioRepositorio.cadastrarProduto(produto);

    const evento = new ListaEvento<ProdutoCardapio>([
      new DocChangeEvent(TipoManipulacaoDado.Adicionado, produto.id, produto),
    ]);
    this.emitirAlteracao(evento);

    return produto;
  }

  async atualizarProdutoCardapio(
    idProduto: string,
    dadosProdutoCardapio: UpdateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    let produto = await this.cardapioRepositorio.carregarProduto(idProduto);

    if (dadosProdutoCardapio.nomeProduto)
      produto.nomeProduto = dadosProdutoCardapio.nomeProduto;
    if (dadosProdutoCardapio.descricao)
      produto.descricao = dadosProdutoCardapio.descricao;
    if (dadosProdutoCardapio.categoria)
      produto.categoria = dadosProdutoCardapio.categoria;
    if (dadosProdutoCardapio.composicao)
      produto.composicao = dadosProdutoCardapio.composicao;
    if (dadosProdutoCardapio.preco) produto.preco = dadosProdutoCardapio.preco;

    produto = await this.cardapioRepositorio.atualizarProduto(
      idProduto,
      produto,
    );

    const evento = new ListaEvento<ProdutoCardapio>([
      new DocChangeEvent(TipoManipulacaoDado.Alterado, idProduto, produto),
    ]);
    this.emitirAlteracao(evento);

    return produto;
  }

  async carregarProdutosCardapio(
    listaIds?: string[],
  ): Promise<ProdutoCardapio[]> {
    const produtosCardapio = await this.cardapioRepositorio.carregarProdutos(
      listaIds,
    );

    return produtosCardapio;
  }

  async carregarProdutoCardapio(idProduto: string): Promise<ProdutoCardapio> {
    const produtosCardapio = await this.cardapioRepositorio.carregarProduto(
      idProduto,
    );

    return produtosCardapio;
  }

  async removerProdutoCardapio(idProduto: string): Promise<void> {
    await this.cardapioRepositorio.removerProduto(idProduto);

    const evento = new ListaEvento<ProdutoCardapio>([
      new DocChangeEvent(TipoManipulacaoDado.Removido, idProduto),
    ]);
    this.emitirAlteracao(evento);

    return;
  }
}
