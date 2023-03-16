import { randomUUID } from 'crypto';

import { PedidoFechado } from './../../../../dominio/pedido-fechado.entity';

export class PedidoFechadoDB extends PedidoFechado {
  constructor(pedidoFechado: PedidoFechado) {
    super();
    pedidoFechado.verificarSeDadosSaoValidosOuErro();
    super.registrarDados({ id: randomUUID(), ...pedidoFechado });
  }
}
