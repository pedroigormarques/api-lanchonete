import { randomUUID } from 'crypto';
import { PedidoFechado } from 'src/@core/dominio/pedido-fechado.entity';
import { IPedidosFechadosRepository } from 'src/@core/infra/contratos/pedidos-fechados.repository.interface';

export class PedidosFechadosRepository implements IPedidosFechadosRepository {
  private pedidosFechados = new Map<string, PedidoFechado>();

  async cadastrarPedidoFechado(
    pedidoFechado: PedidoFechado,
  ): Promise<PedidoFechado> {
    const id = randomUUID();

    const pedidoFechadoCadastrado = new PedidoFechado();

    pedidoFechadoCadastrado.id = id;
    pedidoFechadoCadastrado.horaFechamento = new Date();
    pedidoFechadoCadastrado.horaAbertura = pedidoFechado.horaAbertura;
    pedidoFechadoCadastrado.mesa = pedidoFechado.mesa;
    pedidoFechadoCadastrado.produtosUtilizados =
      pedidoFechado.produtosUtilizados;
    pedidoFechadoCadastrado.produtosVendidos = pedidoFechado.produtosVendidos;
    pedidoFechadoCadastrado.valorConta = pedidoFechado.valorConta;

    this.pedidosFechados.set(id, pedidoFechadoCadastrado);
    return { ...pedidoFechadoCadastrado };
  }
  async carregarPedidosFechados(): Promise<PedidoFechado[]> {
    return [...this.pedidosFechados.values()];
  }
}
