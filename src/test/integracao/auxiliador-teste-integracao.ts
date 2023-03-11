import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UsuarioService } from '../../@core/aplicacao/usuario-service.use-case';
import { AppModule } from '../../app.module';
import { GeradorDeObjetos } from '../gerador-objetos.faker';
import { CardapioService } from './../../@core/aplicacao/cardapio-service.use-case';
import { EstoqueService } from './../../@core/aplicacao/estoque-service.use-case';
import { PedidosService } from './../../@core/aplicacao/pedidos-service.use-case';
import { Pedido } from './../../@core/dominio/pedido.entity';
import { ProdutoCardapio } from './../../@core/dominio/produto-cardapio.entity';
import { ProdutoEstoque } from './../../@core/dominio/produto-estoque.entity';

export class AuxiliadorTesteIntegracao {
  private moduloRef: TestingModule;
  private app: INestApplication;

  public get httpServer(): any {
    return this.app.getHttpServer();
  }

  async beforeAll() {
    this.moduloRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.moduloRef.createNestApplication();
    await this.app.init();
  }

  async afterAll() {
    await this.app.close();
  }

  async gerarUsuarioParaTeste(): Promise<{ token: string; idUsuario: string }> {
    const usuarioService = this.moduloRef.get<UsuarioService>(UsuarioService);

    const aux = GeradorDeObjetos.criarUsuario();

    await usuarioService.registrarUsuario(aux);
    const { token, usuario } = await usuarioService.logar(aux.email, aux.senha);

    return { token: token, idUsuario: usuario.id };
  }

  async gerarProdutoEstoqueParaTeste(
    idUsuario: string,
  ): Promise<ProdutoEstoque> {
    const estoqueService = this.moduloRef.get<EstoqueService>(EstoqueService);
    const aux = GeradorDeObjetos.criarProdutoEstoque(false, idUsuario);
    aux.quantidade += 100;
    return await estoqueService.cadastrarProdutoEstoque(idUsuario, aux);
  }

  async gerarProdutoCardapioParaTeste(
    idUsuario: string,
    qtdProdutosNovosComposicao: number,
  ): Promise<ProdutoCardapio> {
    const cardapioService =
      this.moduloRef.get<CardapioService>(CardapioService);

    const aux = GeradorDeObjetos.criarProdutoCardapio(false, idUsuario);
    aux.composicao.clear();

    for (let i = 0; i < qtdProdutosNovosComposicao; i++) {
      const produto = await this.gerarProdutoEstoqueParaTeste(idUsuario);
      aux.composicao.set(produto.id, i + 1);
    }

    return await cardapioService.cadastrarProdutoCardapio(idUsuario, aux);
  }

  async gerarPedidoParaTeste(
    idUsuario: string,
    mesa: number,
    qtdParaProdutoConsumido?: number,
  ): Promise<{ pedido: Pedido; produtoCardapio?: ProdutoCardapio }> {
    const pedidosService = this.moduloRef.get<PedidosService>(PedidosService);

    let pedido = await pedidosService.cadastrarPedido(idUsuario, {
      idUsuario,
      mesa,
    });

    if (qtdParaProdutoConsumido) {
      const produtoCardapio = await this.gerarProdutoCardapioParaTeste(
        idUsuario,
        1,
      );

      pedido = await pedidosService.alterarQtdItemDoPedido(
        idUsuario,
        pedido.id,
        produtoCardapio.id,
        qtdParaProdutoConsumido,
      );

      return { pedido, produtoCardapio };
    }

    return { pedido };
  }
}
