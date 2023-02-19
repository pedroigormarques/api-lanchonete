import { CreatePedidoFechadoDto } from 'src/@core/dominio/DTOs/create-pedido-fechado.dto';
import { PedidoFechado } from 'src/@core/dominio/pedido-fechado.entity';

export interface IPedidosFechadosRepository {
  cadastrarPedidoFechado(
    createPedidoFechadoDto: CreatePedidoFechadoDto,
  ): Promise<PedidoFechado>;
  carregarPedidosFechados(): Promise<PedidoFechado[]>;
  //carregarPedidoFechado(id: string): Promise<PedidoFechado>;
  //removerPedidoFechado(id: string): Promise<void>;
}
