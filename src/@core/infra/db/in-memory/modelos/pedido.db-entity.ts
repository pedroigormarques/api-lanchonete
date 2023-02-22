import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';
import { Pedido } from './../../../../dominio/pedido.entity';
import { randomUUID } from 'crypto';

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
