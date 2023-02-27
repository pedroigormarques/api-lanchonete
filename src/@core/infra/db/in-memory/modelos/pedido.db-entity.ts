import { randomUUID } from 'crypto';

import { Pedido } from './../../../../dominio/pedido.entity';

export class PedidoDB extends Pedido {
  constructor(mesa: number) {
    super({ mesa });
    this.id = randomUUID();
  }

  atualizarDados(pedido: Pedido) {
    pedido.verificarSeDadosSaoValidosOuErro();
    super.atualizarDados(pedido);
  }
}
