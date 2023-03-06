import { ListaEvento } from './../@core/dominio/lista-evento.entity';
import { ProdutoEstoque } from './../@core/dominio/produto-estoque.entity';
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
  Sse,
  UseFilters,
} from '@nestjs/common';
import {
  CreateProdutoEstoqueDto,
  UpdateProdutoEstoqueDto,
} from './Validation/produto-estoque.dto';
import { HttpExceptionFilter } from './../exception/exception-filter';
import { EstoqueService } from './../@core/aplicacao/estoque-service.use-case';
import { Observable } from 'rxjs';

@Controller('estoque')
export class EstoqueController {
  constructor(private readonly estoqueService: EstoqueService) {}

  @Sse('sse')
  async carregarEmissorEventos(): Promise<
    Observable<ListaEvento<ProdutoEstoque>>
  > {
    return this.estoqueService.abrirConexao('idLogado');
  }

  @Get()
  @UseFilters(HttpExceptionFilter)
  async carregarProdutos(): Promise<Array<ProdutoEstoque>> {
    return await this.estoqueService.carregarProdutosEstoque('idLogado');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(HttpExceptionFilter)
  async adicionarProduto(
    @Body() dadosProduto: CreateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    return await this.estoqueService.cadastrarProdutoEstoque(
      'idLogado',
      dadosProduto,
    );
  }

  @Get(':id')
  @UseFilters(HttpExceptionFilter)
  async carregarProduto(@Param() id: string): Promise<ProdutoEstoque> {
    return await this.estoqueService.carregarProdutoEstoque('idLogado', id);
  }

  @Put(':id')
  @UseFilters(HttpExceptionFilter)
  async atualizarProduto(
    @Param() id: string,
    @Body() dadosProduto: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    return await this.estoqueService.atualizarProdutoEstoque(
      'idLogado',
      id,
      dadosProduto,
    );
  }

  @Delete(':id')
  @UseFilters(HttpExceptionFilter)
  async removerProduto(@Param() id: string): Promise<void> {
    return await this.estoqueService.removerProdutoEstoque('idLogado', id);
  }
}
