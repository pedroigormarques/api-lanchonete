import { randomUUID } from 'crypto';

import { Pedido } from './../../../../dominio/pedido.entity';

export class PedidoDB extends Pedido {
  constructor(idUsuario: string, mesa: number) {
    super({ mesa: mesa, idUsuario: idUsuario });
    this.id = randomUUID();
  }

  atualizarDados(pedido: Pedido) {
    pedido.verificarSeDadosSaoValidosOuErro();
    super.atualizarDados(pedido);
  }
}
