import { UpdatePedidoDto } from './../../../../dominio/DTOs/update-pedido.dto';
import { CreatePedidoDto } from './../../../../dominio/DTOs/create-pedido.dto';
import { Pedido } from 'src/@core/dominio/pedido.entity';
import { IPedidosRepository } from './../../../contratos/pedidos.repository.interface';
import { randomUUID } from 'crypto';

export class PedidosRepository implements IPedidosRepository {
  private pedidos = new Map<string, Pedido>();

  async cadastrarPedido(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const id = randomUUID();

    const pedido = new Pedido();

    pedido.id = id;
    pedido.horaAbertura = new Date();
    pedido.mesa = createPedidoDto.mesa;
    pedido.produtosVendidos = new Map<string, number>();
    pedido.valorConta = 0;

    this.pedidos.set(id, pedido);
    return { ...pedido };
  }

  async carregarPedidos(): Promise<Pedido[]> {
    return [...this.pedidos.values()];
  }

  async carregarPedido(id: string): Promise<Pedido> {
    const pedido = this.pedidos.get(id);

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    return { ...pedido };
  }

  async atualizarPedido(
    id: string,
    updatePedidoDto: UpdatePedidoDto,
  ): Promise<Pedido> {
    const pedido = this.pedidos.get(id);

    if (!pedido) {
      throw new Error('Pedido não encontrado');
    }

    if (updatePedidoDto.mesa) pedido.mesa = updatePedidoDto.mesa;
    if (updatePedidoDto.produtosVendidos)
      pedido.produtosVendidos = updatePedidoDto.produtosVendidos;
    if (updatePedidoDto.valorConta)
      pedido.valorConta = updatePedidoDto.valorConta;

    return { ...pedido };
  }

  async removerPedido(id: string): Promise<void> {
    if (!this.pedidos.delete(id)) {
      throw new Error('Pedido não encontrado');
    }
  }
}
