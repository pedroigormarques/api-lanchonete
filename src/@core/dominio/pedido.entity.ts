export interface DadosBasePedido {
  mesa: number;
  valorConta: number;
  produtosVendidos: Map<string, number>; //idProdutoCardapio, quantidade
}

function isDadosBasePedido(valor): valor is DadosBasePedido {
  if (
    typeof valor?.mesa === 'number' &&
    typeof valor?.valorConta === 'number' &&
    valor?.produtosVendidos instanceof Map
  )
    return true;
  else return false;
}

export class Pedido {
  id?: string;
  mesa: number;
  horaAbertura: Date;
  valorConta: number;
  produtosVendidos: Map<string, number>; //idProdutoCardapio, quantidade

  constructor();
  constructor(dadosPedido: Pick<DadosBasePedido, 'mesa'>);
  constructor(dadosPedido: Pedido);
  constructor(dadosPedido?: Pick<DadosBasePedido, 'mesa'> | Pedido) {
    if (dadosPedido) {
      Pedido.dadosSaoValidosParaRegistroOuErro(dadosPedido);
      this.setMesa(dadosPedido.mesa);
      if (dadosPedido instanceof Pedido) {
        this.registrarDados(dadosPedido);
      }
    }

    if (!(dadosPedido instanceof Pedido)) {
      this.inicializarComValoresPadroes();
    }
  }

  atualizarDados(dadosPedido: Partial<DadosBasePedido>) {
    if (dadosPedido.mesa) this.setMesa(dadosPedido.mesa);
    if (dadosPedido.produtosVendidos)
      this.produtosVendidos = new Map(dadosPedido.produtosVendidos.entries());
    if (dadosPedido.valorConta) this.setValorConta(dadosPedido.valorConta);
  }

  setMesa(mesa: number) {
    if (mesa > 0) this.mesa = mesa;
    else {
      throw new Error('Mesa invalida. Coloque um valor maior que zero');
    }
  }

  setValorConta(valorConta: number) {
    if (valorConta >= 0) this.valorConta = valorConta;
    else {
      throw new Error(
        'Valor da conta invalido. Coloque um valor maior ou igual a zero',
      );
    }
  }

  possuiTodosOsDadosValidos(): boolean {
    return Pedido.possuiTodosOsDadosValidos(this);
  }

  verificarSeDadosSaoValidosOuErro() {
    Pedido.dadosSaoValidosParaRegistroOuErro(this);
  }

  private inicializarComValoresPadroes() {
    this.horaAbertura = new Date();
    this.setValorConta(0);
    this.produtosVendidos = new Map<string, number>();
  }

  private registrarDados(
    dadosPedido: { id?: string; horaAbertura: Date } & DadosBasePedido,
  ) {
    if (dadosPedido.id) this.id = dadosPedido.id;

    this.horaAbertura = new Date(dadosPedido.horaAbertura);
    this.setValorConta(dadosPedido.valorConta);
    this.produtosVendidos = new Map(dadosPedido.produtosVendidos.entries());
  }

  private static possuiTodosOsDadosValidos(
    dadosPedido: Pick<DadosBasePedido, 'mesa'> | DadosBasePedido,
  ): boolean {
    if (typeof dadosPedido.mesa !== 'number' || dadosPedido.mesa <= 0) {
      return false;
    }
    if (
      isDadosBasePedido(dadosPedido) &&
      (dadosPedido.valorConta < 0 ||
        (dadosPedido.produtosVendidos.size === 0 &&
          dadosPedido.valorConta !== 0) ||
        (dadosPedido.produtosVendidos.size !== 0 &&
          dadosPedido.valorConta === 0))
    ) {
      return false;
    }
    return true;
  }

  private static dadosSaoValidosParaRegistroOuErro(
    dadosPedido: Pick<DadosBasePedido, 'mesa'> | DadosBasePedido,
  ) {
    if (!Pedido.possuiTodosOsDadosValidos(dadosPedido))
      throw new Error('Dados incorretos/insuficientes');
  }
}
