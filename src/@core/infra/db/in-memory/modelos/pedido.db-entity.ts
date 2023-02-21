import { randomUUID } from 'crypto';
import { Pedido } from 'src/@core/dominio/pedido.entity';

export class PedidoDB extends Pedido {
  constructor(mesa: number) {
    super();
    this.id = randomUUID();
    this.horaAbertura = new Date();
    this.mesa = mesa;
    this.produtosVendidos = new Map<string, number>();
    this.valorConta = 0;
  }

  carregarDadosBase(pedido: Pedido) {
    this.mesa = pedido.mesa;
    this.produtosVendidos = pedido.produtosVendidos;
    this.valorConta = pedido.valorConta;
  }

  paraPedido(): Pedido {
    const pedido = new Pedido();
    pedido.id = this.id;
    pedido.horaAbertura = new Date(this.horaAbertura);
    pedido.mesa = this.mesa;
    pedido.produtosVendidos = this.criarCopiaProfundaComposicao(
      this.produtosVendidos,
    );
    pedido.valorConta = this.valorConta;

    return pedido;
  }

  private criarCopiaProfundaComposicao(
    composicao: Map<string, number>,
  ): Map<string, number> {
    const mapAux = new Map<string, number>();
    composicao.forEach((v, k) => mapAux.set(k, v));
    return mapAux;
  }
}
