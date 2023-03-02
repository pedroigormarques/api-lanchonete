import { PedidoFechado } from '../dominio/pedido-fechado.entity';
import { DadosBasePedido, Pedido } from '../dominio/pedido.entity';
import { ProdutoCardapio } from '../dominio/produto-cardapio.entity';
import { ProdutoEstoque } from '../dominio/produto-estoque.entity';
import { IPedidosFechadosRepository } from '../infra/contratos/pedidos-fechados.repository.interface';
import { IPedidosRepository } from '../infra/contratos/pedidos.repository.interface';
import { DocChangeEvent } from './../dominio/doc-change-event.entity';
import { TipoManipulacaoDado } from './../dominio/enums/tipo-manipulacao-dado.enum';
import { ListaEvento } from './../dominio/lista-evento.entity';
import { DadosBasePedidoFechado } from './../dominio/pedido-fechado.entity';
import { CardapioService } from './cardapio-service.use-case';
import { EstoqueService } from './estoque-service.use-case';
import { NotificadorDeEventos } from './notificador-de-eventos';

export class PedidosService extends NotificadorDeEventos<Pedido> {
  constructor(
    private pedidosRepositorio: IPedidosRepository,
    private pedidosFechadosRepositorio: IPedidosFechadosRepository,
    private cardapioService: CardapioService,
    private estoqueService: EstoqueService,
  ) {
    super();
  }

  static async create(
    pedidosRepositorio: IPedidosRepository,
    pedidosFechadosRepositorio: IPedidosFechadosRepository,
    cardapioService: CardapioService,
    estoqueService: EstoqueService,
  ): Promise<PedidosService> {
    const pedidosService = new PedidosService(
      pedidosRepositorio,
      pedidosFechadosRepositorio,
      cardapioService,
      estoqueService,
    );
    const dadosIniciais = await pedidosService.carregarPedidos();
    pedidosService.carregarDadosIniciais(dadosIniciais);
    return pedidosService;
  }

  async cadastrarPedido(
    dadosPedido: Pick<DadosBasePedido, 'mesa'>,
  ): Promise<Pedido> {
    let pedido = new Pedido(dadosPedido);

    pedido = await this.pedidosRepositorio.cadastrarPedido(pedido);

    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(TipoManipulacaoDado.Adicionado, pedido.id, pedido),
    ]);
    this.emitirAlteracao(evento);

    return pedido;
  }

  async carregarPedidos(): Promise<Pedido[]> {
    return await this.pedidosRepositorio.carregarPedidos();
  }

  async carregarPedido(idPedido: string): Promise<Pedido> {
    return await this.pedidosRepositorio.carregarPedido(idPedido);
  }

  async alterarQtdItemDoPedido(
    idUsuario: string, //fazer toda lógica de autorização para o método
    idPedido: string,
    idProdutoCardapio: string,
    novaQuantidade: number,
  ): Promise<Pedido> {
    if (novaQuantidade < 0) {
      throw new Error(
        'Quantidade invalida. Coloque um valor maior ou igual a zero',
      );
    }

    let pedido = await this.pedidosRepositorio.carregarPedido(idPedido);

    const produtoNoPedido = pedido.produtosVendidos.has(idProdutoCardapio);

    if (novaQuantidade === 0 && !produtoNoPedido) {
      // caso em que não tiver o produto no pedido e ainda sim quiser remover
      throw new Error(
        'Produto não está presente neste pedido para executar uma remoção.',
      );
    }

    const quantidadeConsumida =
      novaQuantidade -
      (produtoNoPedido ? pedido.produtosVendidos.get(idProdutoCardapio) : 0);

    const produtoCardapio = await this.cardapioService.carregarProdutoCardapio(
      idProdutoCardapio,
    );

    const produtoConsumidoEQtd = new Map<ProdutoCardapio, number>();

    produtoConsumidoEQtd.set(produtoCardapio, quantidadeConsumida);

    const qtdGasta = this.extrairQtdUsadaPorProdEstoque(produtoConsumidoEQtd);
    //verificação, calculo e atualização das novas quantidades no estoque
    await this.estoqueService.atualizarProdutosComGastos(idUsuario, qtdGasta);

    //atualização do pedido e lançamento do evento
    pedido.valorConta += quantidadeConsumida * produtoCardapio.preco;

    if (novaQuantidade === 0) {
      pedido.produtosVendidos.delete(idProdutoCardapio);
    } else {
      pedido.produtosVendidos.set(idProdutoCardapio, novaQuantidade);
    }

    pedido = await this.pedidosRepositorio.atualizarPedido(idPedido, pedido);

    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(TipoManipulacaoDado.Alterado, pedido.id, pedido),
    ]);
    this.emitirAlteracao(evento);

    return pedido;
  }

  async deletarPedido(
    idUsuario: string, //fazer toda lógica de autorização para o método
    idPedido: string,
  ): Promise<void> {
    const pedido1: Pedido = await this.pedidosRepositorio.carregarPedido(
      idPedido,
    );

    const produtosVendidosCancelados = new Map<string, number>();
    pedido1.produtosVendidos.forEach((idProdutoCardapio, qtdConsumida) => {
      produtosVendidosCancelados.set(qtdConsumida, -idProdutoCardapio);
    });

    const produtosVendidosCanceladosCompostos: Map<ProdutoCardapio, number> =
      await this.comporProdutosVendidos(produtosVendidosCancelados);

    const gastosProdutosEstoque: Map<string, number> =
      this.extrairQtdUsadaPorProdEstoque(produtosVendidosCanceladosCompostos);
    await this.estoqueService.atualizarProdutosComGastos(
      idUsuario,
      gastosProdutosEstoque,
    );

    await this.pedidosRepositorio.removerPedido(idPedido);
    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(TipoManipulacaoDado.Removido, idPedido),
    ]);
    this.emitirAlteracao(evento);

    return;
  }

  async fecharPedido(
    idUsuario: string, //fazer toda lógica de autorização para o método
    idPedido: string,
  ): Promise<PedidoFechado> {
    const pedido = await this.pedidosRepositorio.carregarPedido(idPedido);

    const dadosPedido = {} as DadosBasePedidoFechado;
    dadosPedido.horaAbertura = pedido.horaAbertura;
    dadosPedido.mesa = pedido.mesa;
    dadosPedido.valorConta = pedido.valorConta;

    dadosPedido.produtosVendidos = await this.comporProdutosVendidos(
      pedido.produtosVendidos,
    );

    dadosPedido.produtosUtilizados = await this.comporProdutosUtilizados(
      idUsuario,
      dadosPedido.produtosVendidos,
    );
    const pedidoFechado = new PedidoFechado(dadosPedido);

    await this.pedidosRepositorio.removerPedido(idPedido);
    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(TipoManipulacaoDado.Removido, idPedido),
    ]);
    this.emitirAlteracao(evento);
    return await this.pedidosFechadosRepositorio.cadastrarPedidoFechado(
      pedidoFechado,
    );
  }

  async carregarPedidosFechados(): Promise<PedidoFechado[]> {
    return await this.pedidosFechadosRepositorio.carregarPedidosFechados();
  }

  private async comporProdutosUtilizados(
    idUsuario: string, //fazer toda lógica de autorização para o método
    produtosVendidos: Map<ProdutoCardapio, number>,
  ): Promise<Map<ProdutoEstoque, number>> {
    const mapProdutosEstoque: Map<string, number> =
      this.extrairQtdUsadaPorProdEstoque(produtosVendidos);

    const produtosEstoque = await this.estoqueService.carregarProdutosEstoque(
      idUsuario,
      [...mapProdutosEstoque.keys()],
    );

    const produtosUtilizados = new Map<ProdutoEstoque, number>();
    produtosEstoque.forEach((pe) => {
      produtosUtilizados.set(pe, mapProdutosEstoque.get(pe.id));
    });

    return produtosUtilizados;
  }

  private async comporProdutosVendidos(
    produtosVendidos: Map<string, number>,
  ): Promise<Map<ProdutoCardapio, number>> {
    const composicaoProdutosVendidos = new Map<ProdutoCardapio, number>();

    const listaIdsProdutos = [...produtosVendidos.keys()];
    const produtosCardapio =
      await this.cardapioService.carregarProdutosCardapio(listaIdsProdutos);

    produtosCardapio.forEach((pc) => {
      composicaoProdutosVendidos.set(pc, produtosVendidos.get(pc.id));
    });

    return composicaoProdutosVendidos;
  }

  private extrairQtdUsadaPorProdEstoque(
    //parametros: <ProdutoCardapio, qtdConsumida>
    //retorna: <idProdutoEstoque, qtdTotalNecessário>
    produtosVendidos: Map<ProdutoCardapio, number>,
  ): Map<string, number> {
    const map = new Map<string, number>();

    produtosVendidos.forEach((qtdComprada, pc) => {
      pc.composicao.forEach((qtdParaProducao, idProduto) => {
        if (map.has(idProduto)) {
          map.set(
            idProduto,
            qtdParaProducao * qtdComprada + map.get(idProduto),
          );
        } else {
          map.set(idProduto, qtdParaProducao * qtdComprada);
        }
      });
    });

    return map;
  }
}
