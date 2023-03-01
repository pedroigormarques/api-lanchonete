import { Test } from '@nestjs/testing';

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
    it('Retorno de pedido registrado ao passar uma mesa correta', async () => {
      const mesa = 1;
      const pedidoAux = new Pedido({ mesa });
      pedidoAux.id = 'id';

      jest
        .spyOn(pedidosRepository, 'cadastrarPedido')
        .mockResolvedValue(pedidoAux);

      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      const dadosCriacao = { mesa } as Pick<DadosBasePedido, 'mesa'>;

      const resposta = await pedidosService.cadastrarPedido(dadosCriacao);

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta.mesa).toEqual(dadosCriacao.mesa);

      expect(resposta.valorConta).toEqual(0);
      expect(resposta.horaAbertura).toBeDefined();
      expect(resposta.produtosVendidos).toBeDefined();
      expect(resposta.produtosVendidos.size).toEqual(0);
      expect(resposta.id).toBeDefined();

      expect(pedidosService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro ao ocorrer problema no cadastro da mesa', async () => {
      jest
        .spyOn(pedidosRepository, 'cadastrarPedido')
        .mockRejectedValue(new Error('Erro'));
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.cadastrarPedido({ mesa: 1 } as Pick<
          DadosBasePedido,
          'mesa'
        >),
      ).rejects.toThrowError();

      expect(pedidosRepository.cadastrarPedido).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro ao passar mesa inválida', async () => {
      jest.spyOn(pedidosRepository, 'cadastrarPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.cadastrarPedido({ mesa: -5 } as Pick<
          DadosBasePedido,
          'mesa'
        >),
      ).rejects.toThrowError();

      expect(pedidosRepository.cadastrarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Carregar Pedido', () => {
    it('Retorno de pedido ao inserir id válido', async () => {
      const pedidoBanco = GeradorDeObjetos.criarPedido(true);

      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(pedidoBanco);

      const resposta = await pedidosService.carregarPedido(pedidoBanco.id);

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta).toEqual(pedidoBanco);

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
    });

    it('Erro ao não encontrar pedido com o id passado', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockRejectedValue(erroIdNaoEncontrado());

      await expect(pedidosService.carregarPedido('a')).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
    });
  });

  describe('Carregar Pedidos', () => {
    it('Retorno de pedidos', async () => {
      const pedidoBanco1 = GeradorDeObjetos.criarPedido(true);
      const pedidoBanco2 = GeradorDeObjetos.criarPedido(true);

      jest
        .spyOn(pedidosRepository, 'carregarPedidos')
        .mockResolvedValue([pedidoBanco1, pedidoBanco2]);

      const resposta = await pedidosService.carregarPedidos();

      expect(resposta).toBeInstanceOf(Array<Pedido>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(pedidoBanco1);
      expect(resposta).toContainEqual(pedidoBanco2);

      expect(pedidosRepository.carregarPedidos).toBeCalledTimes(1);
    });
  });

  describe('Alterar Quantidade Do Item Do Pedido', () => {
    it('Retorno de pedido com produto adicionado', async () => {
      const pedido = new Pedido({ mesa: 1 });
      const produto = GeradorDeObjetos.criarProdutoCardapio();

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

      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      const resposta = await pedidosService.alterarQtdItemDoPedido(
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
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Retorno de pedido com produto atualizado', async () => {
      const pedido = new Pedido({ mesa: 1 });
      const produto = GeradorDeObjetos.criarProdutoCardapio();
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
        .mockImplementation(async (map) => {
          map.forEach((qtdEst, idProd) => {
            qtdConsumida = qtdEst / produto.composicao.get(idProd);
          });
          return;
        });

      jest
        .spyOn(pedidosRepository, 'atualizarPedido')
        .mockImplementation(async (id, p) => p);

      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      const resposta = await pedidosService.alterarQtdItemDoPedido(
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
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Retorno de pedido com produto removido', async () => {
      const pedido = new Pedido({ mesa: 1 });
      const produto = GeradorDeObjetos.criarProdutoCardapio();
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
        .mockImplementation(async (map) => {
          map.forEach((qtdEst, idProd) => {
            qtdConsumida = qtdEst / produto.composicao.get(idProd);
          });
          return;
        });

      jest
        .spyOn(pedidosRepository, 'atualizarPedido')
        .mockImplementation(async (id, p) => p);

      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      const resposta = await pedidosService.alterarQtdItemDoPedido(
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
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(1);
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

      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido('a', 'b', 10),
      ).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(0);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
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

      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido('a', 'b', -10),
      ).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(0);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(0);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro ao tentar remover produto não presente', async () => {
      const pedido = new Pedido({ mesa: 1 });
      jest.spyOn(pedidosRepository, 'carregarPedido').mockResolvedValue(pedido);

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(null);

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido(pedido.id, 'b', 0),
      ).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(0);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro ao passar id do produto do cardápio inválido', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(GeradorDeObjetos.criarPedido());

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockRejectedValue(new Error('erro'));

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido('a', 'b', 10),
      ).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(0);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro ao passar quantidade insuficiente', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(GeradorDeObjetos.criarPedido());

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(GeradorDeObjetos.criarProdutoCardapio());

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockRejectedValue(new Error('erro'));

      jest.spyOn(pedidosRepository, 'atualizarPedido').mockReturnValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido('a', 'b', 10),
      ).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(0);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro ao salvar atualização', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockResolvedValue(GeradorDeObjetos.criarPedido());

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(GeradorDeObjetos.criarProdutoCardapio());

      jest
        .spyOn(estoqueService, 'atualizarProdutosComGastos')
        .mockResolvedValue(null);

      jest
        .spyOn(pedidosRepository, 'atualizarPedido')
        .mockRejectedValue(new Error('erro'));
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        pedidosService.alterarQtdItemDoPedido('a', 'b', 10),
      ).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosRepository.atualizarPedido).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Deletar Pedido', () => {
    it('remover corretamente o pedido e atualizar os produtos corretamente', async () => {
      const { pedidoBanco, pedidoFechado, produtosCardapio } =
        construirConjuntoValidoDePedidoEPedidoFechado();

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
        .mockImplementation(async (pd) => {
          produtosDevolvidos = pd;
        });

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      await pedidosService.deletarPedido(pedidoBanco.id);

      expect(produtosDevolvidos).toEqual(produtosDevolvidosEsperado);

      expect(pedidosRepository.removerPedido).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosComGastos).toBeCalledTimes(1);
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro ao passar pedido inválido', async () => {
      jest
        .spyOn(pedidosRepository, 'carregarPedido')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(pedidosService.deletarPedido('a')).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(0);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it.todo(
      '-> Erro no processo de remoção do pedido / produtos ainda atualizados',
    ); //-----------------------
  });

  describe('Fechar Pedido', () => {
    it('Retorno de um pedido fechado ao passar id válido e exclusão do pedido aberto', async () => {
      const { pedidoBanco, pedidoFechado, produtosEstoque, produtosCardapio } =
        construirConjuntoValidoDePedidoEPedidoFechado();

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
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockImplementation(async (pf) => {
          pf.id = pedidoFechado.id;
          return pf;
        });

      const resposta = await pedidosService.fecharPedido(pedidoBanco.id);

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
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro ao passar pedido inválido', async () => {
      jest.spyOn(pedidosRepository, 'carregarPedido').mockResolvedValue(null);

      jest.spyOn(pedidosRepository, 'removerPedido').mockResolvedValue(null);
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(pedidosService.fecharPedido('a')).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(0);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro no processo de exclusão do pedido aberto', async () => {
      const { pedidoBanco, produtosEstoque, produtosCardapio } =
        construirConjuntoValidoDePedidoEPedidoFechado();

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
        .mockRejectedValue(new Error('erro'));
      jest.spyOn(pedidosService, 'emitirAlteracao').mockReturnValue(null);

      jest
        .spyOn(pedidosFechadosRepository, 'cadastrarPedidoFechado')
        .mockResolvedValue(null);

      await expect(
        pedidosService.fecharPedido(pedidoBanco.id),
      ).rejects.toThrowError();

      expect(pedidosRepository.carregarPedido).toBeCalledTimes(1);
      expect(pedidosRepository.removerPedido).toBeCalledTimes(1);
      expect(pedidosFechadosRepository.cadastrarPedidoFechado).toBeCalledTimes(
        0,
      );
      expect(pedidosService.emitirAlteracao).toBeCalledTimes(0);
    });

    it.todo(
      '-> Erro no processo de gravação do pedido fechado / pedido já removido',
    ); //-----------------------
  });

  describe('Carregar Pedidos Fechados', () => {
    it('Retorno de pedidos fechados', async () => {
      const pedidoBanco1 = GeradorDeObjetos.criarPedidoFechado(true);
      const pedidoBanco2 = GeradorDeObjetos.criarPedidoFechado(true);

      jest
        .spyOn(pedidosFechadosRepository, 'carregarPedidosFechados')
        .mockResolvedValue([pedidoBanco1, pedidoBanco2]);

      const resposta = await pedidosService.carregarPedidosFechados();

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
  return new Error('Pedido com o id passado não foi encontrado');
}

function construirConjuntoValidoDePedidoEPedidoFechado() {
  const pedidoFechado = GeradorDeObjetos.criarPedidoFechado(true);
  const pedidoBanco = new Pedido({ mesa: pedidoFechado.mesa });
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
