import { Test } from '@nestjs/testing';

import { GeradorDeObjetos } from './../../../../../test/gerador-objetos.faker';
import { BadRequestException } from './../../../../custom-exception/bad-request-exception.error';
import { ErroDetalhado } from './../../../../custom-exception/exception-detalhado.error';
import { NotFoundException } from './../../../../custom-exception/not-found-exception.error';
import { Pedido } from './../../../../dominio/pedido.entity';
import { PedidoDB } from './../modelos/pedido.db-entity';
import { PedidosRepository } from './pedidos.repository';
import { ProdutosCardapioRepository } from './produtos-cardapio.repository';

describe('Pedidos Repositorio', () => {
  let pedidosRespository: PedidosRepository;
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
    pedidosRespository = moduleRef.get(PedidosRepository);

    const pedidos = registrarPedidoDeTeste(pedidosRespository);
    pedido1 = pedidos.pedidoRegistrado;
    pedidoBanco1 = pedidos.pedidoBanco;
  });

  it('Instanciado', async () => {
    expect(cardapioRespository).toBeDefined();

    expect(pedidosRespository).toBeDefined();
  });

  describe('Cadastrar Pedido', () => {
    it('Registro realizado com dados válidos', async () => {
      const idUsuario = 'idTeste';
      const pedido = new Pedido({ mesa: 5, idUsuario });

      const resposta = await pedidosRespository.cadastrarPedido(pedido);

      expect(resposta).toBeInstanceOf(Pedido);
      expect(resposta.valorConta).toEqual(0);
      expect(resposta.idUsuario).toEqual(pedido.idUsuario);
      expect(resposta.mesa).toEqual(pedido.mesa);
      expect(resposta.horaAbertura).toBeDefined();
      expect(resposta.produtosVendidos).toBeDefined();
      expect(resposta.produtosVendidos.size).toEqual(0);
      expect(resposta.id).toBeDefined();

      expect((pedidosRespository as any).pedidos.has(resposta.id)).toBeTruthy();
      expect((pedidosRespository as any).pedidos.size).toEqual(2); //1+1 do criado para auxilio dos teste
    });

    it('Erro ao passar dados insuficientes', async () => {
      const pedido = new Pedido();
      await expect(
        pedidosRespository.cadastrarPedido(pedido),
      ).rejects.toThrowError(BadRequestException);

      expect((pedidosRespository as any).pedidos.size).toEqual(1); //1 do criado para auxilio dos teste
    });

    it('Erro ao passar mesa com número menor ou igual a 0', async () => {
      const pedido = GeradorDeObjetos.criarPedido();
      pedido.mesa = -1;

      await expect(
        pedidosRespository.cadastrarPedido(pedido),
      ).rejects.toThrowError(BadRequestException);

      expect((pedidosRespository as any).pedidos.size).toEqual(1); //1 do criado para auxilio dos teste
    });
  });

  describe('Carregar Pedido', () => {
    it('Retorno de pedido ao inserir id válido', async () => {
      const resposta = await pedidosRespository.carregarPedido(pedido1.id);

      expect(resposta).toEqual(pedido1);
    });

    it('Erro ao não encontrar pedido com o id passado', async () => {
      await expect(pedidosRespository.carregarPedido('a')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('Carregar Pedidos', () => {
    it('Retorno de pedidos', async () => {
      const idUsuario = 'idTeste';
      const { pedidoRegistrado: pedidoRegistrado1 } = registrarPedidoDeTeste(
        pedidosRespository,
        idUsuario,
      );
      const { pedidoRegistrado: pedidoRegistrado2 } = registrarPedidoDeTeste(
        pedidosRespository,
        idUsuario,
      );
      const resposta = await pedidosRespository.carregarPedidos(idUsuario);

      expect(resposta).toBeInstanceOf(Array<Pedido>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(pedidoRegistrado1);
      expect(resposta).toContainEqual(pedidoRegistrado2);

      expect((pedidosRespository as any).pedidos.size).toEqual(3);
    });
  });

  describe('Atualizar Pedido', () => {
    it('Retorno de pedido atualizado ao inserir dados válido', async () => {
      const pedido = GeradorDeObjetos.criarPedido();
      pedido.id = pedido1.id;
      pedido.idUsuario = pedido1.idUsuario;
      pedido.horaAbertura = pedido1.horaAbertura;

      jest
        .spyOn(cardapioRespository, 'validarListaIds')
        .mockResolvedValue(null);
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);
      jest.spyOn(cardapioRespository, 'marcarRelacoes').mockResolvedValue(null);

      const resposta = await pedidosRespository.atualizarPedido(
        pedido.id,
        pedido,
      );

      expect(resposta.id).toEqual(pedido1.id);
      expect(resposta).toEqual(pedido);
    });

    it('Erro ao não encontrar pedido a ser atualizado com o id passado', async () => {
      await expect(
        pedidosRespository.atualizarPedido('a', pedido1),
      ).rejects.toThrowError(NotFoundException);
    });

    it('Erro ao passar pedido com dados basicos inválidos', async () => {
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
        pedidosRespository.atualizarPedido(pedido.id, pedido),
      ).rejects.toThrowError(BadRequestException);

      expect(cardapioRespository.removerRelacoes).toBeCalledTimes(0);
      expect(cardapioRespository.marcarRelacoes).toBeCalledTimes(0);
    });

    it('Erro ao passar produtos vendidos com produto invalido', async () => {
      const pedido = GeradorDeObjetos.criarPedido();
      pedido.id = pedido1.id;

      jest
        .spyOn(cardapioRespository, 'validarListaIds')
        .mockRejectedValue(new ErroDetalhado('', 0, `produto não encontrado`));

      jest.spyOn(cardapioRespository, 'marcarRelacoes').mockResolvedValue(null);
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);

      await expect(
        pedidosRespository.atualizarPedido(pedido.id, pedido),
      ).rejects.toThrowError(ErroDetalhado);

      expect([...pedidoBanco1.produtosVendidos.keys()]).toEqual([
        ...pedido1.produtosVendidos.keys(),
      ]);

      expect(cardapioRespository.removerRelacoes).toBeCalledTimes(0);
      expect(cardapioRespository.marcarRelacoes).toBeCalledTimes(0);
    });
  });

  describe('Remover Pedido', () => {
    it('Remoção do pedido ao inserir id válido', async () => {
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockResolvedValue(null);

      await pedidosRespository.removerPedido(pedido1.id);

      expect((pedidosRespository as any).pedidos.size).toEqual(0);
      expect((pedidosRespository as any).pedidos.has(pedido1.id)).toBeFalsy();
    });

    it('Erro ao não encontrar pedido com o id passado', async () => {
      await expect(pedidosRespository.removerPedido('a')).rejects.toThrowError(
        NotFoundException,
      );

      expect((pedidosRespository as any).pedidos.size).toEqual(1);
    });

    it('Erro ao tentar remover relacao de produto da composição', async () => {
      jest
        .spyOn(cardapioRespository, 'removerRelacoes')
        .mockRejectedValue(new ErroDetalhado('', 0, `produto não encontrado`));

      await expect(
        pedidosRespository.removerPedido(pedido1.id),
      ).rejects.toThrowError(ErroDetalhado);

      expect((pedidosRespository as any).pedidos.size).toEqual(1);
    });
  });
});

function registrarPedidoDeTeste(
  pedidosRepositorio: PedidosRepository,
  idUsuario?: string,
): {
  pedidoRegistrado: Pedido;
  pedidoBanco: PedidoDB;
} {
  const pedidoRegistrado = GeradorDeObjetos.criarPedido(false, idUsuario);
  const pedidoBanco = new PedidoDB(
    pedidoRegistrado.idUsuario,
    pedidoRegistrado.mesa,
  );
  pedidoBanco.atualizarDados(pedidoRegistrado);
  pedidoRegistrado.id = pedidoBanco.id;
  pedidoRegistrado.horaAbertura = pedidoBanco.horaAbertura;

  (pedidosRepositorio as any).pedidos //pela quebra de proteção "private"
    .set(pedidoBanco.id, pedidoBanco);
  return { pedidoRegistrado: pedidoRegistrado, pedidoBanco: pedidoBanco };
}
