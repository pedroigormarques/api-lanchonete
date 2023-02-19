import { UpdatePedidoDto } from './../../dominio/DTOs/update-pedido.dto';
import { CreatePedidoDto } from './../../dominio/DTOs/create-pedido.dto';
import { Pedido } from 'src/@core/dominio/pedido.entity';

export interface IPedidosRepository {
  cadastrarPedido(createPedidoDto: CreatePedidoDto): Promise<Pedido>;
  carregarPedidos(): Promise<Pedido[]>;
  carregarPedido(id: string): Promise<Pedido>;
  atualizarPedido(
    id: string,
    updatePedidoDto: UpdatePedidoDto,
  ): Promise<Pedido>;
  removerPedido(id: string): Promise<void>;
}
