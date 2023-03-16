import { UnprocessableEntityException } from '../custom-exception/unprocessable-entity-exception.error';
import { VerificadorDeAutorizacao } from './verificador-autorizacao';

import { TipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { ProdutoEstoque } from '../dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from '../infra/contratos/produtos-estoque.repository.interface';
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

    estoqueService.configurarFuncaoColetaDados(
      estoqueService.carregarProdutosEstoque,
    );

    return estoqueService;
  }

  async cadastrarProdutoEstoque(
    idUsuario: string,
    dadosProdutoEstoque: DadosBaseProdutoEstoque,
  ): Promise<ProdutoEstoque> {
    let produto = new ProdutoEstoque(dadosProdutoEstoque);

    VerificadorDeAutorizacao.verificarAutorização(
      idUsuario,
      dadosProdutoEstoque,
    );

    produto = await this.estoqueRepositorio.cadastrarProduto(produto);

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Adicionado,
      produto.id,
      produto,
    );

    return produto;
  }

  async atualizarProdutosEstoque(
    idUsuario: string,
    produtos: ProdutoEstoque[],
  ): Promise<ProdutoEstoque[]> {
    produtos.forEach((produto) => {
      VerificadorDeAutorizacao.verificarAutorização(idUsuario, produto);
    });

    const produtosAtualizados = await this.estoqueRepositorio.atualizarProdutos(
      produtos,
    );

    this.emitirAlteracaoConjuntoDeDados(
      idUsuario,
      TipoManipulacaoDado.Alterado,
      produtosAtualizados.map((pe) => pe.id),
      produtosAtualizados,
    );

    return produtosAtualizados;
  }

  async atualizarProdutoEstoque(
    idUsuario: string,
    idProduto: string,
    dadosProdutoEstoque: Omit<Partial<DadosBaseProdutoEstoque>, 'idUsuario'>,
  ): Promise<ProdutoEstoque> {
    let produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, produto);

    produto.atualizarDados(dadosProdutoEstoque);

    produto = await this.estoqueRepositorio.atualizarProduto(
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

  async carregarProdutosEstoque(
    idUsuario: string,
    listaIds?: string[],
  ): Promise<ProdutoEstoque[]> {
    const produtosEstoque = await this.estoqueRepositorio.carregarProdutos(
      idUsuario,
      listaIds,
    );

    if (listaIds && listaIds.length !== produtosEstoque.length) {
      throw VerificadorDeAutorizacao.erroAutorizacao();
    }

    return produtosEstoque;
  }

  async carregarProdutoEstoque(
    idUsuario: string,
    idProduto: string,
  ): Promise<ProdutoEstoque> {
    const produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, produto);

    return produto;
  }

  async removerProdutoEstoque(
    idUsuario: string,
    idProduto: string,
  ): Promise<void> {
    const produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, produto);

    await this.estoqueRepositorio.removerProduto(idProduto);

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Removido,
      idProduto,
    );

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
      VerificadorDeAutorizacao.verificarAutorização(idUsuario, pe);

      pe.quantidade -= gastosProdutosEstoque.get(pe.id);
      if (pe.quantidade < 0) {
        throw new UnprocessableEntityException(
          `Quantidade insuficiente do produto ${pe.nomeProduto} no estoque`,
        );
      }
    });

    await this.atualizarProdutosEstoque(idUsuario, produtosEstoque);
  }
}
