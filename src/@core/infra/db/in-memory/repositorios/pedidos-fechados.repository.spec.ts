import { Test } from '@nestjs/testing';

import { PedidoFechadoDB } from '../modelos/pedido-fechado.db-entity';
import { GeradorDeObjetos } from './../../../../../test/gerador-objetos.faker';
import { PedidoFechado } from './../../../../dominio/pedido-fechado.entity';
import { PedidosFechadosRepository } from './pedidos-fechados.repository';

describe('Pedidos Fechados Repositorio', () => {
  let pedidosFechadosRepository: PedidosFechadosRepository;
  let pedidoFechado1: PedidoFechado;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: PedidosFechadosRepository,
          useClass: PedidosFechadosRepository,
        },
      ],
    }).compile();

    pedidosFechadosRepository = moduleRef.get(PedidosFechadosRepository);

    pedidoFechado1 = registrarPedidoFechadoDeTeste(pedidosFechadosRepository);
  });

  it('Instanciado', async () => {
    expect(pedidosFechadosRepository).toBeDefined();
  });

  describe('Cadastrar Pedido Fechado', () => {
    it('Registro realizado com dados válidos', async () => {
      const pedidoFechado = GeradorDeObjetos.criarPedidoFechado();

      const resposta = await pedidosFechadosRepository.cadastrarPedidoFechado(
        pedidoFechado,
      );

      expect(resposta).toBeInstanceOf(PedidoFechado);
      expect(resposta.valorConta).toEqual(pedidoFechado.valorConta);
      expect(resposta.mesa).toEqual(pedidoFechado.mesa);
      expect(resposta.produtosVendidos).toEqual(pedidoFechado.produtosVendidos);
      expect(resposta.produtosUtilizados).toEqual(
        pedidoFechado.produtosUtilizados,
      );
      expect(resposta.horaFechamento).toBeDefined();
      expect(resposta.id).toBeDefined();

      expect(
        (pedidosFechadosRepository as any).pedidosFechados.has(resposta.id),
      ).toBeTruthy();
      expect((pedidosFechadosRepository as any).pedidosFechados.size).toEqual(
        2,
      ); //1+1 do criado para auxilio dos teste
    });

    it('Erro ao passar dados insuficientes', async () => {
      const pedidoFechado = new PedidoFechado();
      await expect(
        pedidosFechadosRepository.cadastrarPedidoFechado(pedidoFechado),
      ).rejects.toThrowError();

      expect((pedidosFechadosRepository as any).pedidosFechados.size).toEqual(
        1,
      ); //1 do criado para auxilio dos teste
    });

    it('Erro ao passar mesa com número menor ou igual a 0', async () => {
      const pedidoFechado = GeradorDeObjetos.criarPedidoFechado();
      pedidoFechado.mesa = -1;

      await expect(
        pedidosFechadosRepository.cadastrarPedidoFechado(pedidoFechado),
      ).rejects.toThrowError();

      expect((pedidosFechadosRepository as any).pedidosFechados.size).toEqual(
        1,
      ); //1 do criado para auxilio dos teste
    });
  });

  describe('Carregar Pedidos', () => {
    it('Retorno de produtos', async () => {
      const pedidoFechadoRegistrado = registrarPedidoFechadoDeTeste(
        pedidosFechadosRepository,
      );
      const resposta =
        await pedidosFechadosRepository.carregarPedidosFechados();

      expect(resposta).toBeInstanceOf(Array<PedidoFechado>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(pedidoFechado1);
      expect(resposta).toContainEqual(pedidoFechadoRegistrado);

      expect((pedidosFechadosRepository as any).pedidosFechados.size).toEqual(
        2,
      );
    });
  });
});

function registrarPedidoFechadoDeTeste(
  pedidosFechadosRepositorio: PedidosFechadosRepository,
): PedidoFechado {
  const pedidoFechadoRegistrado = GeradorDeObjetos.criarPedidoFechado();
  const pedidoFechadoBanco = new PedidoFechadoDB(pedidoFechadoRegistrado);

  pedidoFechadoRegistrado.id = pedidoFechadoBanco.id;

  (pedidosFechadosRepositorio as any).pedidosFechados //pela quebra de proteção "private"
    .set(pedidoFechadoBanco.id, pedidoFechadoBanco);
  return pedidoFechadoRegistrado;
}
