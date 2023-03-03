import { ForbiddenException } from '@nestjs/common';

import { TipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { ProdutoCardapio } from '../dominio/produto-cardapio.entity';
import { IProdutosCardapioRepository } from '../infra/contratos/produtos-cardapio.repository.interface';
import { DadosBaseProdutoCardapio } from './../dominio/produto-cardapio.entity';
import { NotificadorDeEventos } from './notificador-de-eventos';

export class CardapioService extends NotificadorDeEventos<ProdutoCardapio> {
  constructor(private cardapioRepositorio: IProdutosCardapioRepository) {
    super();
  }

  static async create(
    cardapioRepositorio: IProdutosCardapioRepository,
  ): Promise<CardapioService> {
    const cardapioService = new CardapioService(cardapioRepositorio);
    cardapioService.configurarFuncaoColetaDados(
      cardapioService.carregarProdutosCardapio,
    );
    return cardapioService;
  }

  async cadastrarProdutoCardapio(
    idUsuario: string,
    dadosProdutoCardapio: DadosBaseProdutoCardapio,
  ): Promise<ProdutoCardapio> {
    let produto = new ProdutoCardapio(dadosProdutoCardapio);

    this.acaoEstaAutorizada(idUsuario, dadosProdutoCardapio);

    produto = await this.cardapioRepositorio.cadastrarProduto(produto);

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Adicionado,
      produto.id,
      produto,
    );

    return produto;
  }

  async atualizarProdutoCardapio(
    idUsuario: string,
    idProduto: string,
    dadosProdutoCardapio: Omit<Partial<DadosBaseProdutoCardapio>, 'idUsuario'>,
  ): Promise<ProdutoCardapio> {
    let produto = await this.cardapioRepositorio.carregarProduto(idProduto);

    this.acaoEstaAutorizada(idUsuario, produto);

    produto.atualizarDados(dadosProdutoCardapio);

    produto = await this.cardapioRepositorio.atualizarProduto(
      idProduto,
      produto,
    );

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Alterado,
      idProduto,
      produto,
    );

    return produto;
  }

  async carregarProdutosCardapio(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoCardapio[]> {
    const produtosCardapio = await this.cardapioRepositorio.carregarProdutos(
      idUsuario,
      listaIds,
    );

    if (listaIds && listaIds.length !== produtosCardapio.length) {
      throw this.erroAutorizacao();
    }

    return produtosCardapio;
  }

  async carregarProdutoCardapio(
    idUsuario: string,
    idProduto: string,
  ): Promise<ProdutoCardapio> {
    const produtosCardapio = await this.cardapioRepositorio.carregarProduto(
      idProduto,
    );

    this.acaoEstaAutorizada(idUsuario, produtosCardapio);

    return produtosCardapio;
  }

  async removerProdutoCardapio(
    idUsuario: string,
    idProduto: string,
  ): Promise<void> {
    const produto = await this.cardapioRepositorio.carregarProduto(idProduto);

    this.acaoEstaAutorizada(idUsuario, produto);

    await this.cardapioRepositorio.removerProduto(idProduto);

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Removido,
      idProduto,
    );

    return;
  }

  private acaoEstaAutorizada(
    idUsuario: string,
    dadoAutorizado: { idUsuario: string },
  ) {
    if (dadoAutorizado.idUsuario !== idUsuario) {
      throw this.erroAutorizacao();
    }
  }

  private erroAutorizacao() {
    return new ForbiddenException();
  }
}
