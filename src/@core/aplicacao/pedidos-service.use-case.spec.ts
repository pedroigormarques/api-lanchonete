import { Test } from '@nestjs/testing';

import { ForbiddenException } from './../custom-exception/forbidden-exception.error';
import { BadRequestException } from './../custom-exception/bad-request-exception.error';
import { UnprocessableEntityException } from '../custom-exception/unprocessable-entity-exception.error';
import { ErroDetalhado } from './../custom-exception/exception-detalhado.error';
import { GeradorDeObjetos } from './../../test/gerador-objetos.faker';
import { PedidoFechado } from './../dominio/pedido-fechado.entity';
import { DadosBasePedido, Pedido } from './../dominio/pedido.entity';
import { ProdutoCardapio } from './../dominio/produto-cardapio.entity';
import { IPedidosFechadosRepository } from './../infra/contratos/pedidos-fechados.repository.interface';
import { IPedidosRepository } from './../infra/contratos/pedidos.repository.interface';
import { PedidosFechadosRepository } from './../infra/db/in-memory/repositorios/pedidos-fechados.repository';
import { PedidosRepository } from './../infra/db/in-memory/repositorios/pedidos.repository';
import { CardapioService } from './cardapio-service.use-case';
import { EstoqueService } from './estoque-service.use-case';
import { PedidosService } from './pedidos-service.use-case';

describe('Pedidos Service', () => {
  let pedidosService: PedidosService;
  let pedidosRepository: PedidosRepository;

  let pedidosFechadosRepository: PedidosFechadosRepository;
  let cardapioService: CardapioService;
  let estoqueService: EstoqueService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PedidosService,
          useFactory: async (
            pedidosRepository: IPedidosRepository,
            pedidosFechadosRepository: IPedidosFechadosRepository,
            cardapioService: CardapioService,
            estoqueService: EstoqueService,
          ) =>
            await PedidosService.create(
              pedidosRepository,
              pedidosFechadosRepository,
              cardapioService,
              estoqueService,
            ),
          inject: [
            PedidosRepository,
            PedidosFechadosRepository,
            CardapioService,
            EstoqueService,
          ],
        },
        PedidosRepository,
        PedidosFechadosRepository,
        CardapioService,
        EstoqueService,
      ],
    }).compile();

    pedidosService = moduleRef.get<PedidosService>(PedidosService);
    pedidosRepository = moduleRef.get<PedidosRepository>(PedidosRepository);

    pedidosFechadosRepository = moduleRef.get<PedidosFechadosRepository>(
      PedidosFechadosRepository,
    );
    cardapioService = moduleRef.get<CardapioService>(CardapioService);
    estoqueService = moduleRef.get<EstoqueService>(EstoqueService);
  });

  it('Instanciado', () => {
    expect(pedidosService).toBeDefined();
    expect(pedidosRepository).toBeDefined();

    expect(pedidosFechadosRepository).toBeDefined();
    expect(cardapioService).toBeDefined();
    expect(estoqueService).toBeDefined();
  });

  describe('Cadastrar Pedido', () => {
    it('Retorno de pedido registrado ao passar uma mesa e id de usuário correto', async () => {
      const idUsuario = ' idTeste';
      const mesa = 1;
      let pedidoAux;

      jest
        .spyOn(pedidosRepository, 'cadastrarPedido')
        .mockImplementation(async (pedido) => {
          pedidoAux = pedido;
          pedidoAux.id = 'id';
          return pedidoAux;
        });

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      const dadosCriacao = { mesa, idUsuario } as Pick<
        DadosBasePedido,
        'mesa' | 'idUsuario'
      >;

      const resposta = await pedidosService.cadastrarPedido(
        idUsuario,
        dadosCriacao,
      );

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta.mesa).toEqual(dadosCriacao.mesa);
      expect(resposta.idUsuario).toEqual(dadosCriacao.idUsuario);

      expect(resposta.valorConta).toEqual(0);
      expect(resposta.horaAbertura).toBeDefined();
      expect(resposta.produtosVendidos).toBeDefined();
      expect(resposta.produtosVendidos.size).toEqual(0);
      expect(resposta.id).toBeDefined();

      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Erro ao tentar cadastrar um pedido para outro usuário', async () => {
      const idUsuario = ' idTeste';
      jest.spyOn(pedidosRepository, 'cadastrarPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.cadastrarPedido(idUsuario, {
          mesa: 1,
          idUsuario: 'a',
        } as Pick<DadosBasePedido, 'mesa' | 'idUsuario'>),
      ).rejects.toThrowError(ForbiddenException);

      expect(pedidosRepository.cadastrarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao ocorrer problema no cadastro da mesa', async () => {
      const idUsuario = ' idTeste';
      jest
        .spyOn(pedidosRepository, 'cadastrarPedido')
        .mockRejectedValue(new ErroDetalhado('', 0, 'Erro'));
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.cadastrarPedido(idUsuario, {
          mesa: 1,
          idUsuario,
        } as Pick<DadosBasePedido, 'mesa' | 'idUsuario'>),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.cadastrarPedido).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao passar mesa inválida', async () => {
      const idUsuario = ' idTeste';

      jest.spyOn(pedidosRepository, 'cadastrarPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.cadastrarPedido(idUsuario, {
          mesa: -5,
          idUsuario,
        } as Pick<DadosBasePedido, 'mesa' | 'idUsuario'>),
      ).rejects.toThrowError(BadRequestException);

      expect(pedidosRepository.cadastrarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });
  });

  describe('Carregar Pedido', () => {
    it('Retorno de pedido ao inserir id válido', async () => {
      const idUsuario = ' idTeste';
      const pedidoBanco = GeradorDeObjetos.criarPedido(true, idUsuario);

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      const resposta = await pedidosService.carregarPedido(
        idUsuario,
        pedidoBanco.id,
      );

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta).toEqual(pedidoBanco);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
    });

    it('Erro ao tentar carregar pedido de outro usuário', async () => {
      const idUsuario = 'idTeste';
      const pedidoBanco = GeradorDeObjetos.criarPedido(true);

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      await expect(
        pedidosService.carregarPedido(idUsuario, pedidoBanco.id),
      ).rejects.toThrowError(ForbiddenException);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
    });

    it('Erro ao não encontrar pedido com o id passado', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockRejectedValue(erroIdNaoEncontrado());

      await expect(
        pedidosService.carregarPedido('idTeste', 'a'),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
    });
  });

  describe('Carregar Pedidos', () => {
    it('Retorno de pedidos', async () => {
      const idUsuario = 'idTeste';

      const pedidoBanco1 = GeradorDeObjetos.criarPedido(true, idUsuario);
      const pedidoBanco2 = GeradorDeObjetos.criarPedido(true, idUsuario);

      jest
        .spyOn(pedidosRepository, 'carregarPedidos')
        .mockResolvedValue([pedidoBanco1, pedidoBanco2]);

      const resposta = await pedidosService.carregarPedidos(idUsuario);

      expect(resposta).toBeInstanceOf(Array<Pedido>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(pedidoBanco1);
      expect(resposta).toContainEqual(pedidoBanco2);

      expect(pedidosRepository.carregarPedidos).toBeCalledTimes(1);
    });
  });

  describe('Alterar Quantidade Do Item Do Pedido', () => {
    it('Retorno de pedido com produto adicionado', async () => {
      const idUsuario = 'idTeste';
      const pedido = new Pedido({ mesa: 1, idUsuario });
      const produto = GeradorDeObjetos.criarProdutoCardapio(true, idUsuario);

      jest.spyOn(pedidosRepository, 'carregarPedido').mockResolvedValue(pedido);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(produto);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest
        .spyOn(pedidosRepository, 'atualizarPedido')
        .mockImplementation(async (id, p) => p);

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      const resposta = await pedidosService.alterarQtdItemDoPedido(
        idUsuario,
        pedido.id,
        produto.id,
        10,
      );

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta.produtosVendidos.size).toEqual(1);
      expect(resposta.produtosVendidos.has(produto.id)).toBeTruthy();
      expect(resposta.produtosVendidos.get(produto.id)).toEqual(10);
      expect(resposta.valorConta).toEqual(produto.preco * 10);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Retorno de pedido com produto atualizado', async () => {
      const idUsuario = 'idTeste';
      const pedido = new Pedido({ mesa: 1, idUsuario });
      const produto = GeradorDeObjetos.criarProdutoCardapio(true, idUsuario);
      const qtdAnterior = 5;
      const qtdNova = 10;
      pedido.produtosVendidos.set(produto.id, qtdAnterior);
      pedido.valorConta = qtdAnterior * produto.preco;

      jest.spyOn(pedidosRepository, 'carregarPedido').mockResolvedValue(pedido);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(produto);

      let qtdConsumida: number;
      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockImplementation(async (idUsuario, map) => {
          map.forEach((qtdEst, idProd) => {
            qtdConsumida = qtdEst / produto.composicao.get(idProd);
          });
          return;
        });

      jest
        .spyOn(pedidosRepository, 'atualizarPedido')
        .mockImplementation(async (id, p) => p);

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      const resposta = await pedidosService.alterarQtdItemDoPedido(
        idUsuario,
        pedido.id,
        produto.id,
        qtdNova,
      );

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta.produtosVendidos.size).toEqual(1);
      expect(resposta.produtosVendidos.get(produto.id)).toEqual(10);
      expect(resposta.valorConta).toEqual(produto.preco * qtdNova);

      expect(qtdConsumida).toEqual(qtdNova - qtdAnterior);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Retorno de pedido com produto removido', async () => {
      const idUsuario = 'idTeste';
      const pedido = new Pedido({ mesa: 1, idUsuario });
      const produto = GeradorDeObjetos.criarProdutoCardapio(true, idUsuario);
      const qtdAnterior = 5;
      pedido.produtosVendidos.set(produto.id, qtdAnterior);
      pedido.valorConta = qtdAnterior * produto.preco;

      jest.spyOn(pedidosRepository, 'carregarPedido').mockResolvedValue(pedido);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(produto);

      let qtdConsumida: number;
      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockImplementation(async (idUsuario, map) => {
          map.forEach((qtdEst, idProd) => {
            qtdConsumida = qtdEst / produto.composicao.get(idProd);
          });
          return;
        });

      jest
        .spyOn(pedidosRepository, 'atualizarPedido')
        .mockImplementation(async (id, p) => p);

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      const resposta = await pedidosService.alterarQtdItemDoPedido(
        idUsuario,
        pedido.id,
        produto.id,
        0,
      );

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta.produtosVendidos.size).toEqual(0);
      expect(resposta.produtosVendidos.has(produto.id)).toBeFalsy();
      expect(resposta.valorConta).toEqual(0);

      expect(qtdConsumida).toEqual(-qtdAnterior);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Erro ao passar id do pedido inválido', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockReturnValue(null);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockReturnValue(null);

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido(
          'idUsuario', //fazer sistema inteiro de autenticação
          'a',
          'b',
          10,
        ),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(0);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao passar id de pedido de outro usuario', async () => {
      const pedidoAux = GeradorDeObjetos.criarPedido(true);
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoAux);

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockReturnValue(null);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockReturnValue(null);

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido(
          'idUsuario',
          pedidoAux.id,
          'b',
          10,
        ),
      ).rejects.toThrowError(ForbiddenException);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(0);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao passar uma quantidade inválida', async () => {
      jest.spyOn(pedidosRepository, 'carregarPedido').mockResolvedValue(null);

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(null);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido('idUsuario', 'a', 'b', -10),
      ).rejects.toThrowError(BadRequestException);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(0);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(0);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao tentar remover produto não presente', async () => {
      const idUsuario = 'idTeste';
      const pedido = new Pedido({ mesa: 1, idUsuario });
      jest.spyOn(pedidosRepository, 'carregarPedido').mockResolvedValue(pedido);

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(null);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido(idUsuario, pedido.id, 'b', 0),
      ).rejects.toThrowError(UnprocessableEntityException);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(0);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao carregar um produto do cardápio', async () => {
      const idUsuario = 'idTeste';
      const pedidoAux = GeradorDeObjetos.criarPedido(true, idUsuario);
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoAux);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockRejectedValue(new ErroDetalhado('', 0, 'erro'));

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido(idUsuario, pedidoAux.id, 'b', 10),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao passar quantidade insuficiente', async () => {
      const idUsuario = 'idTeste';
      const pedidoBanco = GeradorDeObjetos.criarPedido(true, idUsuario);
      const produtoAux = GeradorDeObjetos.criarProdutoCardapio(true, idUsuario);
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(produtoAux);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockRejectedValue(new ErroDetalhado('', 0, 'erro'));

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido(
          idUsuario,
          pedidoBanco.id,
          produtoAux.id,
          10,
        ),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao salvar atualização', async () => {
      const idUsuario = 'idTeste';
      const pedidoBanco = GeradorDeObjetos.criarPedido(true, idUsuario);
      const produtoAux = GeradorDeObjetos.criarProdutoCardapio(true, idUsuario);
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(produtoAux);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest
        .spyOn(pedidosRepository, 'atualizarPedido')
        .mockRejectedValue(new ErroDetalhado('', 0, 'erro'));
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido(
          idUsuario,
          pedidoBanco.id,
          produtoAux.id,
          10,
        ),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });
  });

  describe('Deletar Pedido', () => {
    it('remover corretamente o pedido e atualizar os produtos corretamente', async () => {
      const idUsuario = 'idTeste';
      const { pedidoBanco, pedidoFechado, produtosCardapio } =
        construirConjuntoValidoDePedidoEPedidoFechado(idUsuario);

      let produtosDevolvidos: Map<string, number>;
      const produtosDevolvidosEsperado = new Map<string, number>();
      pedidoFechado.produtosUtilizados.forEach((qtd, pe) => {
        produtosDevolvidosEsperado.set(pe.id, -qtd);
      });

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      jest
        .spyOn(cardapioService, 'carregarProdutosCardapio')
        .mockResolvedValue(produtosCardapio);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockImplementation(async (idUsuario, pd) => {
          produtosDevolvidos = pd;
        });

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      await pedidosService.deletarPedido(idUsuario, pedidoBanco.id);

      expect(produtosDevolvidos).toEqual(produtosDevolvidosEsperado);

      expect(pedidosRepository.removerPedido).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Erro ao passar pedido inválido', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(
        pedidosService.deletarPedido('idUsuario', 'a'),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(0);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao tentar remover pedido de outro usuario', async () => {
      const idUsuario = 'idTeste';
      const { pedidoBanco } = construirConjuntoValidoDePedidoEPedidoFechado();

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(
        pedidosService.deletarPedido(idUsuario, pedidoBanco.id),
      ).rejects.toThrowError(ForbiddenException);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(0);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it.todo(
      '-> Erro no processo de remoção do pedido / produtos ainda atualizados',
    ); //-----------------------
  });

  describe('Fechar Pedido', () => {
    it('Retorno de um pedido fechado ao passar id válido e exclusão do pedido aberto', async () => {
      const idUsuario = 'idTeste';
      const { pedidoBanco, pedidoFechado, produtosEstoque, produtosCardapio } =
        construirConjuntoValidoDePedidoEPedidoFechado(idUsuario);

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      jest
        .spyOn(cardapioService, 'carregarProdutosCardapio')
        .mockResolvedValue(produtosCardapio);

      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockResolvedValue(produtosEstoque);

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockImplementation(async (pf) => {
          pf.id = pedidoFechado.id;
          return pf;
        });

      const resposta = await pedidosService.fecharPedido(
        idUsuario,
        pedidoBanco.id,
      );

      expect(resposta).toBeInstanceOf(PedidoFechado);
      expect(resposta.id).toBeDefined();
      expect(resposta.horaFechamento).toBeDefined();
      expect(resposta.mesa).toEqual(pedidoFechado.mesa);
      expect(resposta.horaAbertura).toEqual(pedidoFechado.horaAbertura);
      expect(resposta.valorConta).toEqual(pedidoFechado.valorConta);

      expect(resposta.produtosVendidos).toEqual(pedidoFechado.produtosVendidos);
      expect(resposta.produtosUtilizados).toEqual(
        pedidoFechado.produtosUtilizados,
      );

      expect(pedidosRepository.removerPedido).toBeCalledTimes(1);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        1,
      );
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Erro ao passar pedido inválido', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(
        pedidosService.fecharPedido(
          'idUsuario', //fazer sistema inteiro de autenticação
          'a',
        ),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(0);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao tentar fechar pedido de outro usuário', async () => {
      const idUsuario = 'idTeste';
      const { pedidoBanco } = construirConjuntoValidoDePedidoEPedidoFechado();

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      jest
        .spyOn(cardapioService, 'carregarProdutosCardapio')
        .mockResolvedValue(null);

      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockResolvedValue(null);

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(
        pedidosService.fecharPedido(idUsuario, pedidoBanco.id),
      ).rejects.toThrowError(ForbiddenException);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(0);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro no processo de exclusão do pedido aberto', async () => {
      const idUsuario = 'idTeste';
      const { pedidoBanco, produtosEstoque, produtosCardapio } =
        construirConjuntoValidoDePedidoEPedidoFechado(idUsuario);

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      jest
        .spyOn(cardapioService, 'carregarProdutosCardapio')
        .mockResolvedValue(produtosCardapio);

      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockResolvedValue(produtosEstoque);

      jest
        .spyOn(pedidosRepository, 'removerPedido')
        .mockRejectedValue(new ErroDetalhado('', 0, 'erro'));
      jest.spyOn(pedidosService, 'emitirAlteracaoItem').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(
        pedidosService.fecharPedido(idUsuario, pedidoBanco.id),
      ).rejects.toThrowError(ErroDetalhado);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(1);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it.todo(
      '-> Erro no processo de gravação do pedido fechado / pedido já removido',
    ); //-----------------------
  });

  describe('Carregar Pedidos Fechados', () => {
    it('Retorno de pedidos fechados', async () => {
      const idUsuario = 'idTeste';
      const pedidoBanco1 = GeradorDeObjetos.criarPedidoFechado(true, idUsuario);
      const pedidoBanco2 = GeradorDeObjetos.criarPedidoFechado(true, idUsuario);
      const pedidoBanco3 = GeradorDeObjetos.criarPedidoFechado(true);

      jest
        .spyOn(pedidosFechadosRepository, 'carregarPedidosFechados')
        .mockImplementation(async (idUsuario) =>
          [pedidoBanco1, pedidoBanco2, pedidoBanco3].filter(
            (pf) => pf.idUsuario === idUsuario,
          ),
        );

      const resposta = await pedidosService.carregarPedidosFechados(idUsuario);

      expect(resposta).toBeInstanceOf(Array<PedidoFechado>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(pedidoBanco1);
      expect(resposta).toContainEqual(pedidoBanco2);

      expect(pedidosFechadosRepository.carregarPedidosFechados).toBeCalledTimes(
        1,
      );
    });
  });
});

function erroIdNaoEncontrado() {
  return new ErroDetalhado('', 0, 'Pedido com o id passado não foi encontrado');
}

function construirConjuntoValidoDePedidoEPedidoFechado(idUsuario?: string) {
  const pedidoFechado = GeradorDeObjetos.criarPedidoFechado(true, idUsuario);
  const pedidoBanco = new Pedido({
    mesa: pedidoFechado.mesa,
    idUsuario: pedidoFechado.idUsuario,
  });
  pedidoBanco.id = 'a';
  pedidoBanco.horaAbertura = pedidoFechado.horaAbertura;

  const produtosEstoque = [...pedidoFechado.produtosUtilizados.keys()];
  const produtosCardapio = [] as ProdutoCardapio[];

  pedidoFechado.produtosVendidos.forEach((qtd, pc) => {
    produtosCardapio.push(pc);
    pedidoBanco.produtosVendidos.set(pc.id, qtd);
    pedidoBanco.valorConta += qtd * pc.preco;
  });

  return { pedidoBanco, pedidoFechado, produtosEstoque, produtosCardapio };
}
