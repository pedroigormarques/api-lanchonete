import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  Sse,
  HttpStatus,
  UseFilters,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { CardapioService } from './../@core/aplicacao/cardapio-service.use-case';
import { Evento } from '../@core/dominio/notificacao.entity';
import { ProdutoCardapio } from './../@core/dominio/produto-cardapio.entity';
import { JwtAuthGuard } from './../autenticacao/jwt.guard';
import { ErroDetalhadoEHttpExceptionFilter } from './../exception/exception-filter';
import {
  CreateProdutoCardapioDto,
  UpdateProdutoCardapioDto,
} from './Validation/produto-cardapio.dto';

@Controller('cardapio')
export class CardapioController {
  constructor(private readonly cardapioService: CardapioService) {}

  @Sse('sse')
  @UseGuards(JwtAuthGuard)
  async carregarEmissorEventos(
    @Request() req,
  ): Promise<Observable<Evento<ProdutoCardapio>>> {
    return this.cardapioService.abrirConexao(req.user.idUsuarioLogado);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async carregarProdutos(@Request() req): Promise<Array<ProdutoCardapio>> {
    return await this.cardapioService.carregarProdutosCardapio(
      req.user.idUsuarioLogado,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async adicionarProduto(
    @Request() req,
    @Body() dadosProduto: CreateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    return await this.cardapioService.cadastrarProdutoCardapio(
      req.user.idUsuarioLogado,
      dadosProduto,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async carregarProduto(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ProdutoCardapio> {
    return await this.cardapioService.carregarProdutoCardapio(
      req.user.idUsuarioLogado,
      id,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async atualizarProduto(
    @Request() req,
    @Param('id') id: string,
    @Body() dadosProduto: UpdateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    return await this.cardapioService.atualizarProdutoCardapio(
      req.user.idUsuarioLogado,
      id,
      dadosProduto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async removerProduto(@Request() req, @Param('id') id: string): Promise<void> {
    return await this.cardapioService.removerProdutoCardapio(
      req.user.idUsuarioLogado,
      id,
    );
  }
}
