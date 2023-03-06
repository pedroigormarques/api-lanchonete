import { CardapioService } from './../@core/aplicacao/cardapio-service.use-case';
import {
  CreateProdutoCardapioDto,
  UpdateProdutoCardapioDto,
} from './Validation/produto-cardapio.dto';
import { ProdutoCardapio } from './../@core/dominio/produto-cardapio.entity';
import { ListaEvento } from './../@core/dominio/lista-evento.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Sse,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from './../exception/exception-filter';
import { Observable } from 'rxjs';
import { HttpCode } from '@nestjs/common/decorators';
import { HttpStatus } from '@nestjs/common/enums';

@Controller('cardapio')
export class CardapioController {
  constructor(private readonly cardapioService: CardapioService) {}

  @Sse('sse')
  async carregarEmissorEventos(): Promise<
    Observable<ListaEvento<ProdutoCardapio>>
  > {
    return this.cardapioService.abrirConexao('idLogado');
  }

  @Get()
  @UseFilters(HttpExceptionFilter)
  async carregarProdutos(): Promise<Array<ProdutoCardapio>> {
    return await this.cardapioService.carregarProdutosCardapio('idLogado');
  }

  @Post()
  @UseFilters(HttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async adicionarProduto(
    @Body() dadosProduto: CreateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    return await this.cardapioService.cadastrarProdutoCardapio(
      'idLogado',
      dadosProduto,
    );
  }

  @Get(':id')
  @UseFilters(HttpExceptionFilter)
  async carregarProduto(@Param() id: string): Promise<ProdutoCardapio> {
    return await this.cardapioService.carregarProdutoCardapio('idLogado', id);
  }

  @Put(':id')
  @UseFilters(HttpExceptionFilter)
  async atualizarProduto(
    @Param() id: string,
    @Body() dadosProduto: UpdateProdutoCardapioDto,
  ): Promise<ProdutoCardapio> {
    return await this.cardapioService.atualizarProdutoCardapio(
      'idLogado',
      id,
      dadosProduto,
    );
  }

  @Delete(':id')
  @UseFilters(HttpExceptionFilter)
  async removerProduto(@Param() id: string): Promise<void> {
    return await this.cardapioService.removerProdutoCardapio('idLogado', id);
  }
}
