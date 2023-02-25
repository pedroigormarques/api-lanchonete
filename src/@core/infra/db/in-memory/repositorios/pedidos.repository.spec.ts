import { Test } from '@nestjs/testing';

import { GeradorDeObjetos } from './../../../../../test/gerador-objetos.faker';
import { Pedido } from './../../../../dominio/pedido.entity';
import { PedidoDB } from './../modelos/pedido.db-entity';
import { PedidosRepository } from './pedidos.repository';
import { ProdutosCardapioRepository } from './produtos-cardapio.repository';

describe('Pedidos', () => {
  let pedidoRespository: PedidosRepository;
  let cardapioRespository: ProdutosCardapioRepository;

  let pedido1: Pedido;
  let pedidoBanco1: PedidoDB;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PedidosRepository,
          useFactory: (cardapio: ProdutosCardapioRepository) =>
            new PedidosRepository(cardapio),
          inject: [ProdutosCardapioRepository],
        },
        {
          provide: ProdutosCardapioRepository,
          useClass: ProdutosCardapioRepository,
        },
      ],
    }).compile();

    cardapioRespository = moduleRef.get(ProdutosCardapioRepository);
    pedidoRespository = moduleRef.get(PedidosRepository);

    const pedidos = registrarPedidoDeTeste(pedidoRespository);
    pedido1 = pedidos.pedidoRegistrado;
    pedidoBanco1 = pedidos.pedidoBanco;
  });

  it('Instanciado', async () => {
    expect(cardapioRespository).toBeDefined();

    expect(pedidoRespository).toBeDefined();
  });

  describe('Cadastrar Pedido', () => {
    it('Registro realizado com dados válidos', async () => {
      const pedido = GeradorDeObjetos.criarPedido();

      const resposta = await pedidoRespository.cadastrarPedido(pedido);

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta.valorConta).toEqual(0);
      expect(resposta.mesa).toEqual(pedido.mesa);
      expect(resposta.horaAbertura).toBeDefined();
      expect(resposta.produtosVendidos).toBeDefined();
      expect(resposta.produtosVendidos.size).toEqual(0);
      expect(resposta.id).toBeDefined();

      expect((pedidoRespository as any).pedidos.has(resposta.id)).toBeTruthy();
      expect((pedidoRespository as any).pedidos.size).toEqual(2); //1+1 do criado para auxilio dos teste
    });

    it('Erro ao passar dados insuficientes', async () => {
      const pedido = new Pedido();
      await expect(
        pedidoRespository.cadastrarPedido(pedido),
      ).rejects.toThrowError();

      expect((pedidoRespository as any).pedidos.size).toEqual(1); //1 do criado para auxilio dos teste
    });

    it('Erro ao passar mesa com número menor ou igual a 0', async () => {
      const pedido = GeradorDeObjetos.criarPedido();
      pedido.mesa = -1;

      await expect(
        pedidoRespository.cadastrarPedido(pedido),
      ).rejects.toThrowError();

      expect((pedidoRespository as any).pedidos.size).toEqual(1); //1 do criado para auxilio dos teste
    });
  });

  describe('Carregar Pedido', () => {
    it('Retorno de produto ao inserir id válido', async () => {
      const resposta = await pedidoRespository.carregarPedido(pedido1.id);

      expect(resposta).toEqual(pedido1);
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      await expect(
        pedidoRespository.carregarPedido('a'),
      ).rejects.toThrowError();
    });
  });

  describe('Carregar Pedidos', () => {
    it('Retorno de produtos', async () => {
      const { pedidoRegistrado } = registrarPedidoDeTeste(pedidoRespository);
      const resposta = await pedidoRespository.carregarPedidos();

      expect(resposta).toBeInstanceOf(Array<Pedido>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(pedido1);
      expect(resposta).toContainEqual(pedidoRegistrado);

      expect((pedidoRespository as any).pedidos.size).toEqual(2);
    });
  });

  describe('Atualizar Pedido', () => {
    it('Retorno de produto atualizado ao inserir dados válido', async () => {
      const pedido = GeradorDeObjetos.criarPedido();
      pedido.id = pedido1.id;
      pedido.horaAbertura = pedido1.horaAbertura;

      jest
        .spyOn(cardapioRespository, 'validarListaIds')
        .mockResolvedValue(null);
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);
      jest.spyOn(cardapioRespository, 'marcarRelacoes').mockResolvedValue(null);

      const resposta = await pedidoRespository.atualizarPedido(
        pedido.id,
        pedido,
      );

      expect(resposta.id).toEqual(pedido1.id);
      expect(resposta).toEqual(pedido);
    });

    it('Erro ao não encontrar produto a ser atualizado com o id passado', async () => {
      await expect(
        pedidoRespository.atualizarPedido('a', pedido1),
      ).rejects.toThrowError();
    });

    it('Erro ao passar produto com dados basicos inválidos', async () => {
      jest
        .spyOn(cardapioRespository, 'validarListaIds')
        .mockResolvedValue(null);
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);
      jest.spyOn(cardapioRespository, 'marcarRelacoes').mockResolvedValue(null);

      const pedido = new Pedido();
      pedido.id = pedido1.id;
      pedido.horaAbertura = pedido1.horaAbertura;
      pedido.produtosVendidos = new Map<string, number>();
      pedido.mesa = -5;
      pedido.valorConta = -5;

      await expect(
        pedidoRespository.atualizarPedido(pedido.id, pedido),
      ).rejects.toThrowError();

      expect(cardapioRespository.removerRelacoes).toBeCalledTimes(0);
      expect(cardapioRespository.marcarRelacoes).toBeCalledTimes(0);
    });

    it('Erro ao passar produto com produtos vendidos inválidos', async () => {
      jest
        .spyOn(cardapioRespository, 'validarListaIds')
        .mockResolvedValue(null);
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);
      jest.spyOn(cardapioRespository, 'marcarRelacoes').mockResolvedValue(null);

      const pedido = GeradorDeObjetos.criarPedido();
      delete pedido.produtosVendidos;

      await expect(
        pedidoRespository.atualizarPedido(pedido.id, pedido),
      ).rejects.toThrowError();

      expect(cardapioRespository.removerRelacoes).toBeCalledTimes(0);
      expect(cardapioRespository.marcarRelacoes).toBeCalledTimes(0);
    });

    it('Erro ao passar composicao com produto invalido', async () => {
      const pedido = GeradorDeObjetos.criarPedido();
      pedido.id = pedido1.id;

      jest
        .spyOn(cardapioRespository, 'validarListaIds')
        .mockImplementation(mockErroValidacao);

      jest.spyOn(cardapioRespository, 'marcarRelacoes').mockResolvedValue(null);
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);

      await expect(
        pedidoRespository.atualizarPedido(pedido.id, pedido),
      ).rejects.toThrowError();

      expect([...pedidoBanco1.produtosVendidos.keys()]).toEqual([
        ...pedido1.produtosVendidos.keys(),
      ]);

      expect(cardapioRespository.removerRelacoes).toBeCalledTimes(0);
      expect(cardapioRespository.marcarRelacoes).toBeCalledTimes(0);
    });
  });

  describe('Remover Pedido', () => {
    it('Remoção do produto ao inserir id válido', async () => {
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);

      await pedidoRespository.removerPedido(pedido1.id);

      expect((pedidoRespository as any).pedidos.size).toEqual(0);
      expect((pedidoRespository as any).pedidos.has(pedido1.id)).toBeFalsy();
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      await expect(pedidoRespository.removerPedido('a')).rejects.toThrowError();

      expect((pedidoRespository as any).pedidos.size).toEqual(1);
    });

    it('Erro ao tentar remover relacao de produto da composição', async () => {
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockImplementation(mockErroRelacao);

      await expect(
        pedidoRespository.removerPedido(pedido1.id),
      ).rejects.toThrowError();

      expect((pedidoRespository as any).pedidos.size).toEqual(1);
    });
  });
});

function registrarPedidoDeTeste(pedidosRepositorio: PedidosRepository): {
  pedidoRegistrado: Pedido;
  pedidoBanco: PedidoDB;
} {
  const pedidoRegistrado = GeradorDeObjetos.criarPedido();
  const pedidoBanco = new PedidoDB(pedidoRegistrado.mesa);
  pedidoBanco.carregarDadosBase(pedidoRegistrado);
  pedidoRegistrado.id = pedidoBanco.id;
  pedidoRegistrado.horaAbertura = pedidoBanco.horaAbertura;

  (pedidosRepositorio as any).pedidos //pela quebra de proteção "private"
    .set(pedidoBanco.id, pedidoBanco);
  return { pedidoRegistrado: pedidoRegistrado, pedidoBanco: pedidoBanco };
}

async function mockErroValidacao(idProdutos: string[]) {
  throw new Error(`produto de id ${idProdutos[0]} não encontrado`);
}
async function mockErroRelacao(idPedido: string, idProdutos: string[]) {
  throw new Error(`produto de id ${idProdutos[0]} não encontrado`);
}
