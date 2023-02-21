import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';
import { CardapioService } from './cardapio-service.use-case';
import { EstoqueService } from './estoque-service.use-case';
import { PedidoFechado } from 'src/@core/dominio/pedido-fechado.entity';
import { CreatePedidoDto } from './../dominio/DTOs/create-pedido.dto';
import { Pedido } from 'src/@core/dominio/pedido.entity';
import { ListaEvento } from './../dominio/lista-evento.entity';
import { tipoManipulacaoDado } from './../dominio/enums/tipo-manipulacao-dado.enum';
import { DocChangeEvent } from './../dominio/doc-change-event.entity';
import { IPedidosFechadosRepository } from 'src/@core/infra/contratos/pedidos-fechados.repository.interface';
import { IPedidosRepository } from 'src/@core/infra/contratos/pedidos.repository.interface';
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

    const produtoCardapio = await this.cardapioService.carregarProdutoCardapio(
      idProdutoCardapio,
    );

    //verificação, calculo e atualização das novas quantidades no estoque
    await this.estoqueService.recalcularQuantidadeProdutosEstoque(
      produtoCardapio.composicao,
      novaQuantidade -
        (produtoNoPedido ? pedido.produtosVendidos.get(idProdutoCardapio) : 0),
    );

    //atualização do pedido e lançamento do evento
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
    //otimizar código ---------------------------------------------------------------------------------------------

    const pedido = await this.pedidosRepositorio.carregarPedido(idPedido);

    pedido.produtosVendidos.forEach(async (qtd, idProduto) => {
      await this.alterarQtdItemDoPedido(idPedido, idProduto, 0);
    });

    await this.pedidosRepositorio.removerPedido(idPedido);
    return;
  }

  async fecharPedido(idPedido: string): Promise<PedidoFechado> {
    const pedido = await this.pedidosRepositorio.carregarPedido(idPedido);
    await this.pedidosRepositorio.removerPedido(idPedido);

    const pedidoFechado = new PedidoFechado();
    pedidoFechado.horaAbertura = pedido.horaAbertura;
    pedidoFechado.mesa = pedido.mesa;
    pedidoFechado.valorConta = pedido.valorConta;
    pedidoFechado.produtosVendidos = new Map<ProdutoCardapio, number>();
    pedidoFechado.produtosUtilizados = new Map<ProdutoEstoque, number>();

    const listaIds = [...pedido.produtosVendidos.keys()];
    const produtosCardapio =
      await this.cardapioService.carregarProdutosCardapio(listaIds);
    produtosCardapio.forEach((pc) => {
      pedidoFechado.produtosVendidos.set(
        pc,
        pedido.produtosVendidos.get(pc.id),
      );
    });

    const mapProdutosEstoque: Map<string, number> =
      this.extrairListaProdEstoquesUnicos(produtosCardapio);
    const produtosEstoque = await this.estoqueService.carregarProdutosEstoques([
      ...mapProdutosEstoque.keys(),
    ]);

    produtosEstoque.forEach((pe) => {
      pedidoFechado.produtosUtilizados.set(pe, mapProdutosEstoque.get(pe.id));
    });

    return await this.pedidosFechadosRepositorio.cadastrarPedidoFechado(
      pedidoFechado,
    );
  }

  async carregarPedidosFechados(): Promise<PedidoFechado[]> {
    return await this.pedidosFechadosRepositorio.carregarPedidosFechados();
  }

  private extrairListaProdEstoquesUnicos(
    produtosCardapio: ProdutoCardapio[],
  ): Map<string, number> {
    const map = new Map<string, number>();

    produtosCardapio.forEach((pc) => {
      pc.composicao.forEach((qtd, idProduto) => {
        if (map.has(idProduto)) {
          map.set(idProduto, qtd + map.get(idProduto));
        } else {
          map.set(idProduto, qtd);
        }
      });
    });

    return map;
  }
}
