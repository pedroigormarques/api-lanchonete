import { ProdutoEstoque } from '../dominio/produto-estoque.entity';
import { CardapioService } from './cardapio-service.use-case';
import { EstoqueService } from './estoque-service.use-case';
import { PedidoFechado } from '../dominio/pedido-fechado.entity';
import { CreatePedidoDto } from './../dominio/DTOs/create-pedido.dto';
import { Pedido } from '../dominio/pedido.entity';
import { ListaEvento } from './../dominio/lista-evento.entity';
import { tipoManipulacaoDado } from './../dominio/enums/tipo-manipulacao-dado.enum';
import { DocChangeEvent } from './../dominio/doc-change-event.entity';
import { IPedidosFechadosRepository } from '../infra/contratos/pedidos-fechados.repository.interface';
import { IPedidosRepository } from '../infra/contratos/pedidos.repository.interface';
import { Subject } from 'rxjs';
import { ProdutoCardapio } from '../dominio/produto-cardapio.entity';

export class PedidosService {
  constructor(
    private pedidosRepositorio: IPedidosRepository,
    private pedidosFechadosRepositorio: IPedidosFechadosRepository,
    private cardapioService: CardapioService,
    private estoqueService: EstoqueService,
  ) {}

  private pedidosEvents = new Subject();

  async abrirConexaoParaPedidos() {
    //Verificar a maneira de adicionar o conteúdo atual assim que for aberto uma conexão

    /*const pedidos = await this.carregarPedidos();
  
      const listaAlteracoes = [];
      pedidos.forEach((p) => {
        listaAlteracoes.push(new DocChangeEvent(tipoManipulacaoDado.Adicionado, p.id, p));
      });
      const evento = new ListaEvento<Pedido>(listaAlteracoes);
  
      this.emitirAlteracao(evento);*/

    return this.pedidosEvents.asObservable();
  }

  emitirAlteracao(evento: ListaEvento<Pedido>) {
    return this.pedidosEvents.next(evento);
  }

  async cadastrarPedido(dadosPedido: CreatePedidoDto): Promise<Pedido> {
    let pedido = new Pedido();
    pedido.mesa = dadosPedido.mesa;

    pedido = await this.pedidosRepositorio.cadastrarPedido(pedido);

    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(tipoManipulacaoDado.Adicionado, pedido.id, pedido),
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
    await this.estoqueService.atualizarProdutosComGastos(qtdGasta);

    //atualização do pedido e lançamento do evento
    pedido.valorConta += quantidadeConsumida * produtoCardapio.preco;

    if (novaQuantidade === 0) {
      pedido.produtosVendidos.delete(idProdutoCardapio);
    } else {
      pedido.produtosVendidos.set(idProdutoCardapio, novaQuantidade);
    }

    pedido = await this.pedidosRepositorio.atualizarPedido(idPedido, pedido);

    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(tipoManipulacaoDado.Alterado, pedido.id, pedido),
    ]);
    this.emitirAlteracao(evento);

    return pedido;
  }

  async deletarPedido(idPedido: string): Promise<void> {
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
    await this.estoqueService.atualizarProdutosComGastos(gastosProdutosEstoque);

    await this.pedidosRepositorio.removerPedido(idPedido);
    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(tipoManipulacaoDado.Removido, idPedido),
    ]);
    this.emitirAlteracao(evento);

    return;
  }

  async fecharPedido(idPedido: string): Promise<PedidoFechado> {
    const pedido = await this.pedidosRepositorio.carregarPedido(idPedido);

    const pedidoFechado = new PedidoFechado();
    pedidoFechado.horaAbertura = pedido.horaAbertura;
    pedidoFechado.mesa = pedido.mesa;
    pedidoFechado.valorConta = pedido.valorConta;

    pedidoFechado.produtosVendidos = await this.comporProdutosVendidos(
      pedido.produtosVendidos,
    );

    pedidoFechado.produtosUtilizados = await this.comporProdutosUtilizados(
      pedidoFechado.produtosVendidos,
    );

    await this.pedidosRepositorio.removerPedido(idPedido);
    const evento = new ListaEvento<Pedido>([
      new DocChangeEvent(tipoManipulacaoDado.Removido, idPedido),
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
    produtosVendidos: Map<ProdutoCardapio, number>,
  ): Promise<Map<ProdutoEstoque, number>> {
    const mapProdutosEstoque: Map<string, number> =
      this.extrairQtdUsadaPorProdEstoque(produtosVendidos);

    const produtosEstoque = await this.estoqueService.carregarProdutosEstoque([
      ...mapProdutosEstoque.keys(),
    ]);

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
