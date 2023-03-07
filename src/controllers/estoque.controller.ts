import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  Sse,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { EstoqueService } from './../@core/aplicacao/estoque-service.use-case';
import { Evento } from '../@core/dominio/notificacao.entity';
import { ProdutoEstoque } from './../@core/dominio/produto-estoque.entity';
import { JwtAuthGuard } from './../autenticacao/jwt.guard';
import { ErroDetalhadoEHttpExceptionFilter } from './../exception/exception-filter';
import {
  CreateProdutoEstoqueDto,
  UpdateProdutoEstoqueDto,
} from './Validation/produto-estoque.dto';

@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Sse('sse')
  @UseGuards(JwtAuthGuard)
  async carregarEmissorEventos(
    @Request() req,
  ): Promise<Observable<Evento<ProdutoEstoque>>> {
    return this.estoqueService.abrirConexao(req.user.idUsuarioLogado);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async carregarProdutos(@Request() req): Promise<Array<ProdutoEstoque>> {
    return await this.estoqueService.carregarProdutosEstoque(
      req.user.idUsuarioLogado,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async adicionarProduto(
    @Request() req,
    @Body() dadosProduto: CreateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    return await this.estoqueService.cadastrarProdutoEstoque(
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
  ): Promise<ProdutoEstoque> {
    return await this.estoqueService.carregarProdutoEstoque(
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
    @Body() dadosProduto: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    return await this.estoqueService.atualizarProdutoEstoque(
      req.user.idUsuarioLogado,
      id,
      dadosProduto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  async removerProduto(@Request() req, @Param('id') id: string): Promise<void> {
    return await this.estoqueService.removerProdutoEstoque(
      req.user.idUsuarioLogado,
      id,
    );
  }
}
