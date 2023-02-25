import { randomUUID } from 'crypto';

import { PedidoFechado } from './../../../../dominio/pedido-fechado.entity';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';

export class PedidoFechadoDB extends PedidoFechado {
  constructor(pedidoFechado: PedidoFechado) {
    super();

    this.validarDadosCriacao(pedidoFechado);

    this.id = randomUUID();
    this.horaFechamento = new Date();

    this.horaAbertura = new Date(pedidoFechado.horaAbertura);
    this.mesa = pedidoFechado.mesa;
    this.valorConta = pedidoFechado.valorConta;

    this.produtosVendidos = new Map(pedidoFechado.produtosVendidos.entries());
    this.produtosUtilizados = new Map(
      pedidoFechado.produtosUtilizados.entries(),
    );
  }

  paraPedidoFechado(): PedidoFechado {
    return criarObjetoComCopiaProfunda<PedidoFechadoDB, PedidoFechado>(
      this,
      PedidoFechado,
      [],
    );
  }

  private validarDadosCriacao(pedidoFechado: PedidoFechado) {
    if (
      typeof pedidoFechado.mesa !== 'number' ||
      pedidoFechado.mesa <= 0 ||
      !(pedidoFechado.horaAbertura instanceof Date) ||
      !(pedidoFechado.produtosVendidos instanceof Map) ||
      !(pedidoFechado.produtosUtilizados instanceof Map) ||
      typeof pedidoFechado.valorConta !== 'number' ||
      pedidoFechado.valorConta <= 0
    )
      throw new Error('Dados insuficientes/incorretos');
  }
}
