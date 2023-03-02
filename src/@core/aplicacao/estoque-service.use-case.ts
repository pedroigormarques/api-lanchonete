import { ForbiddenException } from '@nestjs/common';

import { TipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { ListaEvento } from '../dominio/lista-evento.entity';
import { ProdutoEstoque } from '../dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from '../infra/contratos/produtos-estoque.repository.interface';
import { DocChangeEvent } from './../dominio/doc-change-event.entity';
import { DadosBaseProdutoEstoque } from './../dominio/produto-estoque.entity';
import { NotificadorDeEventos } from './notificador-de-eventos';

export class EstoqueService extends NotificadorDeEventos<ProdutoEstoque> {
  constructor(private estoqueRepositorio: IProdutosEstoqueRepository) {
    super();
  }

  static async create(
    estoqueRepositorio: IProdutosEstoqueRepository,
  ): Promise<EstoqueService> {
    const estoqueService = new EstoqueService(estoqueRepositorio);

    //Modificar a lógica do NotificadorDeEventos
    //const dadosIniciais = await estoqueService.carregarProdutosEstoque();
    //estoqueService.carregarDadosIniciais(dadosIniciais);

    return estoqueService;
  }

  async cadastrarProdutoEstoque(
    idUsuario: string,
    dadosProdutoEstoque: DadosBaseProdutoEstoque,
  ): Promise<ProdutoEstoque> {
    let produto = new ProdutoEstoque(dadosProdutoEstoque);

    this.acaoEstaAutorizada(idUsuario, dadosProdutoEstoque);

    produto = await this.estoqueRepositorio.cadastrarProduto(produto);

    const evento = new ListaEvento<ProdutoEstoque>([
      new DocChangeEvent(TipoManipulacaoDado.Adicionado, produto.id, produto),
    ]);
    this.emitirAlteracao(evento);

    return produto;
  }

  async atualizarProdutosEstoque(
    idUsuario: string,
    produtos: ProdutoEstoque[],
  ): Promise<ProdutoEstoque[]> {
    produtos.forEach((produto) => {
      this.acaoEstaAutorizada(idUsuario, produto);
    });

    const produtosAtualizados = await this.estoqueRepositorio.atualizarProdutos(
      produtos,
    );

    const listaAtualizacoes = [] as DocChangeEvent<ProdutoEstoque>[];
    produtosAtualizados.forEach(async (pe) => {
      listaAtualizacoes.push(
        new DocChangeEvent(TipoManipulacaoDado.Alterado, pe.id, pe),
      );
    });
    this.emitirAlteracao(new ListaEvento<ProdutoEstoque>(listaAtualizacoes));

    return produtosAtualizados;
  }

  async atualizarProdutoEstoque(
    idUsuario: string,
    idProduto: string,
    dadosProdutoEstoque: Omit<Partial<DadosBaseProdutoEstoque>, 'idUsuario'>,
  ): Promise<ProdutoEstoque> {
    let produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    this.acaoEstaAutorizada(idUsuario, produto);

    produto.atualizarDados(dadosProdutoEstoque);

    produto = await this.estoqueRepositorio.atualizarProduto(
      idProduto,
      produto,
    );

    const evento = new ListaEvento<ProdutoEstoque>([
      new DocChangeEvent(TipoManipulacaoDado.Alterado, idProduto, produto),
    ]);
    this.emitirAlteracao(evento);

    return produto;
  }

  async carregarProdutosEstoque(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoEstoque[]> {
    const produtosEstoque = await this.estoqueRepositorio.carregarProdutos(
      idUsuario,
      listaIds,
    );

    if (listaIds && listaIds.length !== produtosEstoque.length) {
      throw this.erroAutorizacao();
    }

    return produtosEstoque;
  }

  async carregarProdutoEstoque(
    idUsuario: string,
    idProduto: string,
  ): Promise<ProdutoEstoque> {
    const produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    this.acaoEstaAutorizada(idUsuario, produto);

    return produto;
  }

  async removerProdutoEstoque(
    idUsuario: string,
    idProduto: string,
  ): Promise<void> {
    const produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    this.acaoEstaAutorizada(idUsuario, produto);

    await this.estoqueRepositorio.removerProduto(idProduto);

    const evento = new ListaEvento<ProdutoEstoque>([
      new DocChangeEvent(TipoManipulacaoDado.Removido, idProduto),
    ]);
    this.emitirAlteracao(evento);

    return;
  }

  async atualizarProdutosComGastos(
    idUsuario: string,
    gastosProdutosEstoque: Map<string, number>,
  ) {
    const produtosEstoque = await this.carregarProdutosEstoque(idUsuario, [
      ...gastosProdutosEstoque.keys(),
    ]);

    produtosEstoque.forEach((pe) => {
      this.acaoEstaAutorizada(idUsuario, pe);

      pe.quantidade -= gastosProdutosEstoque.get(pe.id);
      if (pe.quantidade < 0) {
        throw new Error(
          `Quantidade insuficiente do produto ${pe.nomeProduto} no estoque`,
        );
      }
    });

    await this.atualizarProdutosEstoque(idUsuario, produtosEstoque);
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
