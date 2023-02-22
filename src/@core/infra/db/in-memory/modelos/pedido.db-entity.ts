import { randomUUID } from 'crypto';
import { Pedido } from 'src/@core/dominio/pedido.entity';
import { criarObjetoComCopiaProfunda } from 'src/@core/helper/criador-copia-profunda.function';

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
    this.produtosVendidos = new Map(pedido.produtosVendidos.entries());
    this.valorConta = pedido.valorConta;
  }

  paraPedido(): Pedido {
    return criarObjetoComCopiaProfunda<PedidoDB, Pedido>(this, Pedido, []);
  }
}
