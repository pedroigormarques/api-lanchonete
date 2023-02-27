import { DadosBaseProdutoEstoque } from './../dominio/produto-estoque.entity';
import { DocChangeEvent } from './../dominio/doc-change-event.entity';
import { tipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { Subject } from 'rxjs';
import { ProdutoEstoque } from '../dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from '../infra/contratos/produtos-estoque.repository.interface';

import { ListaEvento } from '../dominio/lista-evento.entity';

export class EstoqueService {
  constructor(private estoqueRepositorio: IProdutosEstoqueRepository) {}

  private estoqueEvents = new Subject();

  async abrirConexao() {
    //Verificar a maneira de adicionar o conteúdo atual assim que for aberto uma conexão

    /*const produtos = await this.carregarProdutosEstoques();

    const listaAlteracoes = [];
    produtos.forEach((pe) => {
      listaAlteracoes.push(new DocChangeEvent(ACAO.Adicionado, pe.id, pe));
    });
    const evento = new ListaEvento<ProdutoEstoque>(listaAlteracoes);

    this.emitirAlteracao(evento);*/

    return this.estoqueEvents.asObservable();
  }

  emitirAlteracao(evento: ListaEvento<ProdutoEstoque>) {
    return this.estoqueEvents.next(evento);
  }

  async cadastrarProdutoEstoque(
    dadosProdutoEstoque: DadosBaseProdutoEstoque,
  ): Promise<ProdutoEstoque> {
    let produto = new ProdutoEstoque(dadosProdutoEstoque);

    produto = await this.estoqueRepositorio.cadastrarProduto(produto);

    const evento = new ListaEvento<ProdutoEstoque>([
      new DocChangeEvent(tipoManipulacaoDado.Adicionado, produto.id, produto),
    ]);
    this.emitirAlteracao(evento);

    return produto;
  }

  async atualizarProdutosEstoque(
    produtos: ProdutoEstoque[],
  ): Promise<ProdutoEstoque[]> {
    const produtosAtualizados = await this.estoqueRepositorio.atualizarProdutos(
      produtos,
    );

    const listaAtualizacoes = [] as DocChangeEvent<ProdutoEstoque>[];
    produtosAtualizados.forEach(async (pe) => {
      listaAtualizacoes.push(
        new DocChangeEvent(tipoManipulacaoDado.Alterado, pe.id, pe),
      );
    });
    this.emitirAlteracao(new ListaEvento<ProdutoEstoque>(listaAtualizacoes));

    return produtosAtualizados;
  }

  async atualizarProdutoEstoque(
    idProduto: string,
    dadosProdutoEstoque: Partial<DadosBaseProdutoEstoque>,
  ): Promise<ProdutoEstoque> {
    let produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    produto.atualizarDados(dadosProdutoEstoque);

    produto = await this.estoqueRepositorio.atualizarProduto(
      idProduto,
      produto,
    );

    const evento = new ListaEvento<ProdutoEstoque>([
      new DocChangeEvent(tipoManipulacaoDado.Alterado, idProduto, produto),
    ]);
    this.emitirAlteracao(evento);

    return produto;
  }

  async carregarProdutosEstoque(
    listaIds?: string[],
  ): Promise<ProdutoEstoque[]> {
    return await this.estoqueRepositorio.carregarProdutos(listaIds);
  }

  async carregarProdutoEstoque(idProduto: string): Promise<ProdutoEstoque> {
    return await this.estoqueRepositorio.carregarProduto(idProduto);
  }

  async removerProdutoEstoque(idProduto: string): Promise<void> {
    await this.estoqueRepositorio.removerProduto(idProduto);

    const evento = new ListaEvento<ProdutoEstoque>([
      new DocChangeEvent(tipoManipulacaoDado.Removido, idProduto),
    ]);
    this.emitirAlteracao(evento);

    return;
  }

  async atualizarProdutosComGastos(gastosProdutosEstoque: Map<string, number>) {
    const produtosEstoque = await this.carregarProdutosEstoque([
      ...gastosProdutosEstoque.keys(),
    ]);

    produtosEstoque.forEach((pe) => {
      pe.quantidade -= gastosProdutosEstoque.get(pe.id);
      if (pe.quantidade < 0) {
        throw new Error(
          `Quantidade insuficiente do produto ${pe.nomeProduto} no estoque`,
        );
      }
    });

    await this.atualizarProdutosEstoque(produtosEstoque);
  }
}
