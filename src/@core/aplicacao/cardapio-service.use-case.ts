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
    idUsuario: string, //fazer toda lógica de autorização para o método
    dadosProdutoCardapio: DadosBaseProdutoCardapio,
  ): Promise<ProdutoCardapio> {
    let produto = new ProdutoCardapio(dadosProdutoCardapio);

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
    idUsuario: string, //fazer toda lógica de autorização para o método
    idProduto: string,
    dadosProdutoCardapio: Partial<DadosBaseProdutoCardapio>,
  ): Promise<ProdutoCardapio> {
    let produto = await this.cardapioRepositorio.carregarProduto(idProduto);

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
    idUsuario: string, //fazer toda lógica de autorização para o método
    listaIds?: string[],
  ): Promise<ProdutoCardapio[]> {
    const produtosCardapio = await this.cardapioRepositorio.carregarProdutos(
      listaIds,
    );

    return produtosCardapio;
  }

  async carregarProdutoCardapio(
    idUsuario: string, //fazer toda lógica de autorização para o método
    idProduto: string,
  ): Promise<ProdutoCardapio> {
    const produtosCardapio = await this.cardapioRepositorio.carregarProduto(
      idProduto,
    );

    return produtosCardapio;
  }

  async removerProdutoCardapio(
    idUsuario: string, //fazer toda lógica de autorização para o método
    idProduto: string,
  ): Promise<void> {
    await this.cardapioRepositorio.removerProduto(idProduto);

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Removido,
      idProduto,
    );

    return;
  }
}
