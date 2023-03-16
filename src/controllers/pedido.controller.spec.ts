import { Test } from '@nestjs/testing';
import { Observable } from 'rxjs';

import { PedidosService } from './../@core/aplicacao/pedidos-service.use-case';
import { ErroDetalhado } from './../@core/custom-exception/exception-detalhado.error';
import { GeradorDeObjetos } from './../test/gerador-objetos.faker';
import { PedidoController } from './pedido.controller';
import {
  AtualizarItemPedidoDto,
  CreatePedidoDto,
} from './Validation/pedido.dto';

describe('Pedido Controller', () => {
  let pedidosService: PedidosService;
  let pedidosController: PedidoController;

  const usuarioReq = {
    user: { idUsuarioLogado: 'idTeste', email: 'email@teste.com' },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PedidoController],
      providers: [PedidosService],
    }).compile();

    pedidosService = moduleRef.get<PedidosService>(PedidosService);
    pedidosController = moduleRef.get<PedidoController>(PedidoController);
  });

  it('Instanciado', () => {
    expect(pedidosService).toBeDefined();
    expect(pedidosController).toBeDefined();
  });

  describe('Carregar Emissor Eventos', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const observable = new Observable<any>();

      jest.spyOn(pedidosService, 'abrirConexao').mockResolvedValue(observable);

      const resposta = await pedidosController.carregarEmissorEventos(
        usuarioReq,
      );

      expect(pedidosService.abrirConexao).toBeCalledTimes(1);
      expect(pedidosService.abrirConexao).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
      );

      expect(resposta).toEqual(observable);
    });

    it('Caso ocorra um erro no servico', async () => {
      jest
        .spyOn(pedidosService, 'abrirConexao')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.carregarEmissorEventos(usuarioReq),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Adicionar Pedido', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarPedido(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosCriacao = {} as CreatePedidoDto;
      dadosCriacao.idUsuario = aux.idUsuario;
      dadosCriacao.mesa = aux.mesa;

      jest.spyOn(pedidosService, 'cadastrarPedido').mockResolvedValue(aux);

      const resposta = await pedidosController.adicionarPedido(
        usuarioReq,
        dadosCriacao,
      );

      expect(pedidosService.cadastrarPedido).toBeCalledTimes(1);
      expect(pedidosService.cadastrarPedido).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        dadosCriacao,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarPedido(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosCriacao = {} as CreatePedidoDto;
      dadosCriacao.mesa = aux.mesa;
      dadosCriacao.idUsuario = aux.idUsuario;

      jest
        .spyOn(pedidosService, 'cadastrarPedido')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.adicionarPedido(usuarioReq, dadosCriacao),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Atualizar Quantidade Item Pedido', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarPedido(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosAtualizacao = {
        idProdutoCardapio: 'idProduto',
        novaQtd: 5,
      } as AtualizarItemPedidoDto;

      jest
        .spyOn(pedidosService, 'alterarQtdItemDoPedido')
        .mockResolvedValue(aux);

      const resposta = await pedidosController.atualizarQtdItemPedido(
        usuarioReq,
        aux.id,
        dadosAtualizacao,
      );

      expect(pedidosService.alterarQtdItemDoPedido).toBeCalledTimes(1);
      expect(pedidosService.alterarQtdItemDoPedido).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        aux.id,
        dadosAtualizacao.idProdutoCardapio,
        dadosAtualizacao.novaQtd,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const idPedido = 'idPedido';
      const dadosAtualizacao = {
        idProdutoCardapio: 'idProduto',
        novaQtd: 5,
      } as AtualizarItemPedidoDto;

      jest
        .spyOn(pedidosService, 'alterarQtdItemDoPedido')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.atualizarQtdItemPedido(
          usuarioReq,
          idPedido,
          dadosAtualizacao,
        ),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Carregar Pedido', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarPedido(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      jest.spyOn(pedidosService, 'carregarPedido').mockResolvedValue(aux);

      const resposta = await pedidosController.carregarPedido(
        usuarioReq,
        aux.id,
      );

      expect(pedidosService.carregarPedido).toBeCalledTimes(1);
      expect(pedidosService.carregarPedido).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        aux.id,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarPedido(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      jest
        .spyOn(pedidosService, 'carregarPedido')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.carregarPedido(usuarioReq, aux.id),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Carregar Pedidos', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const pedidos = [
        GeradorDeObjetos.criarPedido(true, usuarioReq.user.idUsuarioLogado),
        GeradorDeObjetos.criarPedido(true, usuarioReq.user.idUsuarioLogado),
      ];

      jest.spyOn(pedidosService, 'carregarPedidos').mockResolvedValue(pedidos);

      const resposta = await pedidosController.carregarPedidos(usuarioReq);

      expect(pedidosService.carregarPedidos).toBeCalledTimes(1);
      expect(pedidosService.carregarPedidos).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
      );

      expect(resposta).toEqual(pedidos);
    });

    it('Caso ocorra um erro no servico', async () => {
      jest
        .spyOn(pedidosService, 'carregarPedidos')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.carregarPedidos(usuarioReq),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Deletar Pedido', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const idPedido = 'idProduto';

      jest.spyOn(pedidosService, 'deletarPedido').mockResolvedValue(null);

      await pedidosController.deletarPedido(usuarioReq, idPedido);

      expect(pedidosService.deletarPedido).toBeCalledTimes(1);
      expect(pedidosService.deletarPedido).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        idPedido,
      );
    });

    it('Caso ocorra um erro no servico', async () => {
      const idPedido = 'idProduto';

      jest
        .spyOn(pedidosService, 'deletarPedido')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.deletarPedido(usuarioReq, idPedido),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Fechar Pedido', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const idPedido = 'idProduto';
      const pedidoFechadoAux = GeradorDeObjetos.criarPedidoFechado(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      jest
        .spyOn(pedidosService, 'fecharPedido')
        .mockResolvedValue(pedidoFechadoAux);

      const resposta = await pedidosController.fecharPedido(
        usuarioReq,
        idPedido,
      );

      expect(pedidosService.fecharPedido).toBeCalledTimes(1);
      expect(pedidosService.fecharPedido).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        idPedido,
      );

      expect(resposta).toEqual(pedidoFechadoAux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const idPedido = 'idProduto';

      jest
        .spyOn(pedidosService, 'fecharPedido')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.fecharPedido(usuarioReq, idPedido),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Carregar Pedidos Fechados', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const pedidosFechados = [
        GeradorDeObjetos.criarPedidoFechado(
          true,
          usuarioReq.user.idUsuarioLogado,
        ),
        GeradorDeObjetos.criarPedidoFechado(
          true,
          usuarioReq.user.idUsuarioLogado,
        ),
      ];

      jest
        .spyOn(pedidosService, 'carregarPedidosFechados')
        .mockResolvedValue(pedidosFechados);

      const resposta = await pedidosController.carregarPedidosFechados(
        usuarioReq,
      );

      expect(pedidosService.carregarPedidosFechados).toBeCalledTimes(1);
      expect(pedidosService.carregarPedidosFechados).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
      );

      expect(resposta).toEqual(pedidosFechados);
    });

    it('Caso ocorra um erro no servico', async () => {
      jest
        .spyOn(pedidosService, 'carregarPedidosFechados')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        pedidosController.carregarPedidosFechados(usuarioReq),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });
});

function erroDetalhadoGenerico() {
  return new ErroDetalhado('', 0, 'erro');
}
