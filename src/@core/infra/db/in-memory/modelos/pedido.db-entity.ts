import { randomUUID } from 'crypto';

import { Pedido } from './../../../../dominio/pedido.entity';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';

export class PedidoDB extends Pedido {
  constructor(mesa: number) {
    super();
    if (typeof mesa !== 'number' || mesa <= 0)
      throw new Error('Dados insuficientes/incorretos');

    this.id = randomUUID();
    this.horaAbertura = new Date();
    this.mesa = mesa;
    this.produtosVendidos = new Map<string, number>();
    this.valorConta = 0;
  }

  carregarDadosBase(pedido: Pedido) {
    PedidoDB.validarDadosAtualizacao(pedido);

    this.mesa = pedido.mesa;
    this.produtosVendidos = new Map(pedido.produtosVendidos.entries());
    this.valorConta = pedido.valorConta;
  }

  paraPedido(): Pedido {
    return criarObjetoComCopiaProfunda<PedidoDB, Pedido>(this, Pedido, []);
  }

  static validarDadosAtualizacao(pedido: Pedido) {
    if (
      typeof pedido.mesa !== 'number' ||
      pedido.mesa <= 0 ||
      !(pedido.produtosVendidos instanceof Map) ||
      typeof pedido.valorConta !== 'number' ||
      pedido.valorConta <= 0
    )
      throw new Error('Dados insuficientes/incorretos');
  }
}
