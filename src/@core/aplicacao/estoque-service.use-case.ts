import { DocChangeEvent } from './../dominio/doc-change-event.entity';
import { tipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { Subject } from 'rxjs';
import { CreateProdutoEstoqueDto } from 'src/@core/dominio/DTOs/create-produto-estoque.dto';
import { UpdateProdutoEstoqueDto } from 'src/@core/dominio/DTOs/update-produto-estoque.dto';
import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';
import { IProdutosEstoqueRepository } from 'src/@core/infra/contratos/produtos-estoque.repository.interface';

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
    dadosProdutoEstoque: CreateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    let produto = new ProdutoEstoque();

    produto.descricao = dadosProdutoEstoque.descricao;
    produto.nomeProduto = dadosProdutoEstoque.nomeProduto;
    produto.quantidade = dadosProdutoEstoque.quantidade;
    produto.unidade = dadosProdutoEstoque.unidade;

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
    const produtosAtualizados = [] as ProdutoEstoque[];
    const listaAtualizacoes = [] as DocChangeEvent<ProdutoEstoque>[];

    produtos.forEach(async (pe) => {
      const produtos = await this.atualizarProdutoEstoque(pe.id, pe);
      produtosAtualizados.push(produtos);
      listaAtualizacoes.push(
        new DocChangeEvent(tipoManipulacaoDado.Alterado, pe.id, pe),
      );
    });
    this.emitirAlteracao(new ListaEvento<ProdutoEstoque>(listaAtualizacoes));

    return produtosAtualizados;
  }

  async atualizarProdutoEstoque(
    idProduto: string,
    dadosProdutoEstoque: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    let produto = await this.estoqueRepositorio.carregarProduto(idProduto);

    if (dadosProdutoEstoque.nomeProduto)
      produto.nomeProduto = dadosProdutoEstoque.nomeProduto;
    if (dadosProdutoEstoque.descricao)
      produto.descricao = dadosProdutoEstoque.descricao;
    if (dadosProdutoEstoque.quantidade)
      produto.quantidade = dadosProdutoEstoque.quantidade;
    if (dadosProdutoEstoque.unidade)
      produto.unidade = dadosProdutoEstoque.unidade;

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

  async carregarProdutosEstoques(
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

  async recalcularQuantidadeProdutosEstoque(
    composicaoProdutoCardapio: Map<string, number>,
    quantidadeConsumida: number,
  ): Promise<ProdutoEstoque[]> {
    const listaIdsUnicos = [...composicaoProdutoCardapio.keys()];
    const produtosEstoque = await this.carregarProdutosEstoques(listaIdsUnicos);

    const produtosEstoqueMap = new Map<string, ProdutoEstoque>();
    produtosEstoque.forEach((pe) => produtosEstoqueMap.set(pe.id, pe));

    composicaoProdutoCardapio.forEach((qtdProducao, idProduto) => {
      const p = produtosEstoqueMap.get(idProduto);
      p.quantidade = p.quantidade - quantidadeConsumida * qtdProducao;
      if (p.quantidade < 0)
        throw new Error(
          `Quantidade insuficiente do produto ${p.nomeProduto} no estoque`,
        );
    });

    return await this.atualizarProdutosEstoque([
      ...produtosEstoqueMap.values(),
    ]);
  }
}
