import { BadRequestException } from './../custom-exception/bad-request-exception.error';
import { ProdutoCardapio } from './produto-cardapio.entity';
import { ProdutoEstoque } from './produto-estoque.entity';

export interface DadosBasePedidoFechado {
  idUsuario: string;
  mesa: number;
  horaAbertura: Date;
  valorConta: number;
  produtosVendidos: Map<ProdutoCardapio, number>;
  produtosUtilizados: Map<ProdutoEstoque, number>;
}

export class PedidoFechado {
  id?: string;
  idUsuario: string;
  mesa: number;
  horaAbertura: Date;
  horaFechamento: Date;
  valorConta: number;
  produtosVendidos: Map<ProdutoCardapio, number>;
  produtosUtilizados: Map<ProdutoEstoque, number>;

  constructor();
  constructor(dadosPedido: DadosBasePedidoFechado);
  constructor(dadosPedido: PedidoFechado);
  constructor(dadosPedido?: DadosBasePedidoFechado | PedidoFechado) {
    if (typeof dadosPedido !== 'undefined') {
      PedidoFechado.dadosSaoValidosParaRegistroOuErro(dadosPedido);
      this.registrarDados(dadosPedido);
    }

    if (!(dadosPedido instanceof PedidoFechado))
      this.horaFechamento = new Date();
  }

  protected registrarDados(
    dadosPedidoFechado: {
      id?: string;
      horaFechamento?: Date;
    } & DadosBasePedidoFechado,
  ) {
    if (typeof dadosPedidoFechado.id !== 'undefined')
      this.id = dadosPedidoFechado.id;
    if (typeof dadosPedidoFechado.horaFechamento !== 'undefined')
      this.horaFechamento = new Date(dadosPedidoFechado.horaFechamento);

    this.idUsuario = dadosPedidoFechado.idUsuario;
    this.horaAbertura = new Date(dadosPedidoFechado.horaAbertura);
    this.mesa = dadosPedidoFechado.mesa;
    this.valorConta = dadosPedidoFechado.valorConta;

    this.produtosVendidos = new Map(
      dadosPedidoFechado.produtosVendidos.entries(),
    );
    this.produtosUtilizados = new Map(
      dadosPedidoFechado.produtosUtilizados.entries(),
    );
  }

  possuiTodosOsDadosValidos(): boolean {
    return PedidoFechado.possuiTodosOsDadosValidos(this);
  }

  verificarSeDadosSaoValidosOuErro() {
    PedidoFechado.dadosSaoValidosParaRegistroOuErro(this);
  }

  private static possuiTodosOsDadosValidos(
    dadosPedidoFechado: DadosBasePedidoFechado,
  ): boolean {
    if (
      typeof dadosPedidoFechado.idUsuario !== 'string' ||
      typeof dadosPedidoFechado.mesa !== 'number' ||
      dadosPedidoFechado.mesa <= 0 ||
      !(dadosPedidoFechado.horaAbertura instanceof Date) ||
      !(dadosPedidoFechado.produtosVendidos instanceof Map) ||
      !(dadosPedidoFechado.produtosUtilizados instanceof Map) ||
      typeof dadosPedidoFechado.valorConta !== 'number' ||
      dadosPedidoFechado.valorConta <= 0
    ) {
      return false;
    }
    return true;
  }

  private static dadosSaoValidosParaRegistroOuErro(
    dadosPedidoFechado: DadosBasePedidoFechado,
  ) {
    if (!PedidoFechado.possuiTodosOsDadosValidos(dadosPedidoFechado))
      throw new BadRequestException(
        'Dados incorretos/insuficientes para o pedido fechado',
      );
  }
}
