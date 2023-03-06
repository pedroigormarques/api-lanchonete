import { PedidoFechado } from './../@core/dominio/pedido-fechado.entity';
import { Pedido } from './../@core/dominio/pedido.entity';
import {
  AtualizarItemPedidoDto,
  CreatePedidoDto,
} from './Validation/pedido.dto';
import { PedidosService } from './../@core/aplicacao/pedidos-service.use-case';
import { ListaEvento } from './../@core/dominio/lista-evento.entity';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Sse,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from './../exception/exception-filter';
import { Observable } from 'rxjs';
import { HttpCode } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';

@Controller()
export class PedidoController {
  constructor(private readonly pedidoService: PedidosService) {}

  @Sse('pedidos/sse')
  async carregarEmissorEventos(): Promise<Observable<ListaEvento<Pedido>>> {
    return this.pedidoService.abrirConexao('idLogado');
  }

  @Get('pedidos')
  @UseFilters(HttpExceptionFilter)
  async carregarPedidos(): Promise<Array<Pedido>> {
    return await this.pedidoService.carregarPedidos('idLogado');
  }

  @Post('pedidos')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async adicionarPedido(@Body() dadosPedido: CreatePedidoDto): Promise<Pedido> {
    return await this.pedidoService.cadastrarPedido('idLogado', dadosPedido);
  }

  @Get('pedidos/:id')
  @UseFilters(HttpExceptionFilter)
  async carregarPedido(@Param() id: string): Promise<Pedido> {
    return await this.pedidoService.carregarPedido('idLogado', id);
  }

  @Post('pedidos/:id')
  @UseFilters(HttpExceptionFilter)
  async atualizarQtdItemPedido(
    @Param() id: string,
    @Body() dadosPedido: AtualizarItemPedidoDto,
  ): Promise<Pedido> {
    return await this.pedidoService.alterarQtdItemDoPedido(
      'idLogado',
      id,
      dadosPedido.idProdutoCardapio,
      dadosPedido.novaQtd,
    );
  }

  @Post('pedidos/:id/deletar')
  @UseFilters(HttpExceptionFilter)
  async deletarPedido(@Param() id: string): Promise<void> {
    return await this.pedidoService.deletarPedido('idLogado', id);
  }

  @Post('pedidos/:id/fechar')
  @UseFilters(HttpExceptionFilter)
  async fecharPedido(@Param() id: string): Promise<PedidoFechado> {
    return await this.pedidoService.fecharPedido('idLogado', id);
  }

  @Get('pedidosFechados')
  @UseFilters(HttpExceptionFilter)
  async carregarPedidosFechados(): Promise<Array<PedidoFechado>> {
    return await this.pedidoService.carregarPedidosFechados('idLogado');
  }
}
