import { UnprocessableEntityException } from '../custom-exception/unprocessable-entity-exception.error';
import { PedidoFechado } from '../dominio/pedido-fechado.entity';
import { DadosBasePedido, Pedido } from '../dominio/pedido.entity';
import { ProdutoCardapio } from '../dominio/produto-cardapio.entity';
import { ProdutoEstoque } from '../dominio/produto-estoque.entity';
import { IPedidosFechadosRepository } from '../infra/contratos/pedidos-fechados.repository.interface';
import { IPedidosRepository } from '../infra/contratos/pedidos.repository.interface';
import { BadRequestException } from './../custom-exception/bad-request-exception.error';
import { TipoManipulacaoDado } from './../dominio/enums/tipo-manipulacao-dado.enum';
import { DadosBasePedidoFechado } from './../dominio/pedido-fechado.entity';
import { CardapioService } from './cardapio-service.use-case';
import { EstoqueService } from './estoque-service.use-case';
import { NotificadorDeEventos } from './notificador-de-eventos';
import { VerificadorDeAutorizacao } from './verificador-autorizacao';

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
    pedidosService.configurarFuncaoColetaDados(pedidosService.carregarPedidos);
    return pedidosService;
  }

  async cadastrarPedido(
    idUsuario: string,
    dadosPedido: Pick<DadosBasePedido, 'mesa' | 'idUsuario'>,
  ): Promise<Pedido> {
    let pedido = new Pedido(dadosPedido);

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, pedido);

    pedido = await this.pedidosRepositorio.cadastrarPedido(pedido);

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Adicionado,
      pedido.id,
      pedido,
    );

    return pedido;
  }

  async carregarPedidos(idUsuario: string): Promise<Pedido[]> {
    return await this.pedidosRepositorio.carregarPedidos(idUsuario);
  }

  async carregarPedido(idUsuario: string, idPedido: string): Promise<Pedido> {
    const pedido = await this.pedidosRepositorio.carregarPedido(idPedido);

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, pedido);

    return pedido;
  }

  async alterarQtdItemDoPedido(
    idUsuario: string,
    idPedido: string,
    idProdutoCardapio: string,
    novaQuantidade: number,
  ): Promise<Pedido> {
    if (novaQuantidade < 0) {
      throw new BadRequestException(
        'Quantidade invalida. Coloque um valor maior ou igual a zero',
      );
    }

    let pedido = await this.pedidosRepositorio.carregarPedido(idPedido);

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, pedido);

    const produtoNoPedido = pedido.produtosVendidos.has(idProdutoCardapio);

    if (novaQuantidade === 0 && !produtoNoPedido) {
      // caso em que não tiver o produto no pedido e ainda sim quiser remover
      throw new UnprocessableEntityException(
        `Produto de id ${idProdutoCardapio} não está presente neste pedido para executar uma remoção.`,
      );
    }

    const quantidadeConsumida =
      novaQuantidade -
      (produtoNoPedido ? pedido.produtosVendidos.get(idProdutoCardapio) : 0);

    const produtoCardapio = await this.cardapioService.carregarProdutoCardapio(
      idUsuario,
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

    this.emitirAlteracaoItem(
      idUsuario,
      TipoManipulacaoDado.Alterado,
      pedido.id,
      pedido,
    );

    return pedido;
  }

  async deletarPedido(idUsuario: string, idPedido: string): Promise<void> {
    const pedido: Pedido = await this.pedidosRepositorio.carregarPedido(
      idPedido,
    );

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, pedido);

    const produtosVendidosCancelados = new Map<string, number>();
    pedido.produtosVendidos.forEach((idProdutoCardapio, qtdConsumida) => {
      produtosVendidosCancelados.set(qtdConsumida, -idProdutoCardapio);
    });

    const produtosVendidosCanceladosCompostos: Map<ProdutoCardapio, number> =
      await this.comporProdutosVendidos(idUsuario, produtosVendidosCancelados);

    const gastosProdutosEstoque: Map<string, number> =
      this.extrairQtdUsadaPorProdEstoque(produtosVendidosCanceladosCompostos);
    await this.estoqueService.atualizarProdutosComGastos(
      idUsuario,
      gastosProdutosEstoque,
    );

    await this.pedidosRepositorio.removerPedido(idPedido);

    this.emitirAlteracaoItem(idUsuario, TipoManipulacaoDado.Removido, idPedido);

    return;
  }

  async fecharPedido(
    idUsuario: string,
    idPedido: string,
  ): Promise<PedidoFechado> {
    const pedido = await this.pedidosRepositorio.carregarPedido(idPedido);

    VerificadorDeAutorizacao.verificarAutorização(idUsuario, pedido);

    if (pedido.valorConta === 0)
      throw new UnprocessableEntityException(
        'O pedido nao possui itens. Para removê-lo, use a opção de deletar',
      );

    const dadosPedido = {} as DadosBasePedidoFechado;
    dadosPedido.horaAbertura = pedido.horaAbertura;
    dadosPedido.idUsuario = pedido.idUsuario;
    dadosPedido.mesa = pedido.mesa;
    dadosPedido.valorConta = pedido.valorConta;

    dadosPedido.produtosVendidos = await this.comporProdutosVendidos(
      idUsuario,
      pedido.produtosVendidos,
    );

    dadosPedido.produtosUtilizados = await this.comporProdutosUtilizados(
      idUsuario,
      dadosPedido.produtosVendidos,
    );
    const pedidoFechado = new PedidoFechado(dadosPedido);

    await this.pedidosRepositorio.removerPedido(idPedido);

    this.emitirAlteracaoItem(idUsuario, TipoManipulacaoDado.Removido, idPedido);
    return await this.pedidosFechadosRepositorio.cadastrarPedidoFechado(
      pedidoFechado,
    );
  }

  async carregarPedidosFechados(idUsuario: string): Promise<PedidoFechado[]> {
    return await this.pedidosFechadosRepositorio.carregarPedidosFechados(
      idUsuario,
    );
  }

  private async comporProdutosUtilizados(
    idUsuario: string,
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
    idUsuario: string,
    produtosVendidos: Map<string, number>,
  ): Promise<Map<ProdutoCardapio, number>> {
    const composicaoProdutosVendidos = new Map<ProdutoCardapio, number>();

    const listaIdsProdutos = [...produtosVendidos.keys()];
    const produtosCardapio =
      await this.cardapioService.carregarProdutosCardapio(
        idUsuario,
        listaIdsProdutos,
      );

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
