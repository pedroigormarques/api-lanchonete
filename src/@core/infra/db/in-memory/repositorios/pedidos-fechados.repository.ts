import { randomUUID } from 'crypto';
import { CreatePedidoFechadoDto } from 'src/@core/dominio/DTOs/create-pedido-fechado.dto';
import { PedidoFechado } from 'src/@core/dominio/pedido-fechado.entity';
import { IPedidosFechadosRepository } from 'src/@core/infra/contratos/pedidos-fechados.repository.interface';

export class PedidosFechadosRepository implements IPedidosFechadosRepository {
  private pedidosFechados = new Map<string, PedidoFechado>();

  async cadastrarPedidoFechado(
    createPedidoFechadoDto: CreatePedidoFechadoDto,
  ): Promise<PedidoFechado> {
    const id = randomUUID();

    const pedidoFechado = new PedidoFechado();

    pedidoFechado.id = id;
    pedidoFechado.horaFechamento = new Date();
    pedidoFechado.horaAbertura = createPedidoFechadoDto.horaAbertura;
    pedidoFechado.mesa = createPedidoFechadoDto.mesa;
    pedidoFechado.produtosUtilizados =
      createPedidoFechadoDto.produtosUtilizados;
    pedidoFechado.produtosVendidos = createPedidoFechadoDto.produtosVendidos;
    pedidoFechado.valorConta = createPedidoFechadoDto.valorConta;

    this.pedidosFechados.set(id, pedidoFechado);
    return { ...pedidoFechado };
  }
  async carregarPedidosFechados(): Promise<PedidoFechado[]> {
    return [...this.pedidosFechados.values()];
  }
}
