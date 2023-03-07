import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  Sse,
  UseFilters,
  HttpCode,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { PedidosService } from './../@core/aplicacao/pedidos-service.use-case';
import { Evento } from '../@core/dominio/notificacao.entity';
import { PedidoFechado } from './../@core/dominio/pedido-fechado.entity';
import { Pedido } from './../@core/dominio/pedido.entity';
import { JwtAuthGuard } from './../autenticacao/jwt.guard';
import { ErroDetalhadoEHttpExceptionFilter } from './../exception/exception-filter';
import {
  AtualizarItemPedidoDto,
  CreatePedidoDto,
} from './Validation/pedido.dto';

@Controller()
export class PedidoController {
  constructor(private readonly pedidoService: PedidosService) {}

  @Sse('pedidos/sse')
  @UseGuards(JwtAuthGuard)
  async carregarEmissorEventos(
    @Request() req,
  ): Promise<Observable<Evento<Pedido>>> {
    return this.pedidoService.abrirConexao(req.user.idUsuarioLogado);
  }

  @Get('pedidos')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async carregarPedidos(@Request() req): Promise<Array<Pedido>> {
    return await this.pedidoService.carregarPedidos(req.user.idUsuarioLogado);
  }

  @Post('pedidos')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async adicionarPedido(
    @Request() req,
    @Body() dadosPedido: CreatePedidoDto,
  ): Promise<Pedido> {
    return await this.pedidoService.cadastrarPedido(
      req.user.idUsuarioLogado,
      dadosPedido,
    );
  }

  @Get('pedidos/:id')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async carregarPedido(
    @Request() req,
    @Param('id') id: string,
  ): Promise<Pedido> {
    return await this.pedidoService.carregarPedido(
      req.user.idUsuarioLogado,
      id,
    );
  }

  @Post('pedidos/:id')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async atualizarQtdItemPedido(
    @Request() req,
    @Param('id') id: string,
    @Body() dadosPedido: AtualizarItemPedidoDto,
  ): Promise<Pedido> {
    return await this.pedidoService.alterarQtdItemDoPedido(
      req.user.idUsuarioLogado,
      id,
      dadosPedido.idProdutoCardapio,
      dadosPedido.novaQtd,
    );
  }

  @Post('pedidos/:id/deletar')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async deletarPedido(@Request() req, @Param('id') id: string): Promise<void> {
    return await this.pedidoService.deletarPedido(req.user.idUsuarioLogado, id);
  }

  @Post('pedidos/:id/fechar')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async fecharPedido(
    @Request() req,
    @Param('id') id: string,
  ): Promise<PedidoFechado> {
    return await this.pedidoService.fecharPedido(req.user.idUsuarioLogado, id);
  }

  @Get('pedidosFechados')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async carregarPedidosFechados(@Request() req): Promise<Array<PedidoFechado>> {
    return await this.pedidoService.carregarPedidosFechados(
      req.user.idUsuarioLogado,
    );
  }
}
