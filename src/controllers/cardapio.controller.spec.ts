import { Test } from '@nestjs/testing';
import { Observable } from 'rxjs';

import { CardapioService } from './../@core/aplicacao/cardapio-service.use-case';
import { ErroDetalhado } from './../@core/custom-exception/exception-detalhado.error';
import { GeradorDeObjetos } from './../test/gerador-objetos.faker';
import { CardapioController } from './cardapio.controller';
import {
  CreateProdutoCardapioDto,
  UpdateProdutoCardapioDto,
} from './Validation/produto-cardapio.dto';

describe('Cardapio Controller', () => {
  let cardapioService: CardapioService;
  let cardapioController: CardapioController;

  const usuarioReq = {
    user: { idUsuarioLogado: 'idTeste', email: 'email@teste.com' },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CardapioController],
      providers: [CardapioService],
    }).compile();

    cardapioService = moduleRef.get<CardapioService>(CardapioService);
    cardapioController = moduleRef.get<CardapioController>(CardapioController);
  });

  it('Instanciado', () => {
    expect(cardapioService).toBeDefined();
    expect(cardapioController).toBeDefined();
  });

  describe('Carregar Emissor Eventos', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const observable = new Observable<any>();

      jest.spyOn(cardapioService, 'abrirConexao').mockResolvedValue(observable);

      const resposta = await cardapioController.carregarEmissorEventos(
        usuarioReq,
      );

      expect(cardapioService.abrirConexao).toBeCalledTimes(1);
      expect(cardapioService.abrirConexao).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
      );

      expect(resposta).toEqual(observable);
    });

    it('Caso ocorra um erro no servico', async () => {
      jest
        .spyOn(cardapioService, 'abrirConexao')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        cardapioController.carregarEmissorEventos(usuarioReq),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Adicionar Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarProdutoCardapio(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosCriacao = {} as CreateProdutoCardapioDto;
      dadosCriacao.descricao = aux.descricao;
      dadosCriacao.idUsuario = aux.idUsuario;
      dadosCriacao.nomeProduto = aux.nomeProduto;
      dadosCriacao.categoria = aux.categoria;
      dadosCriacao.composicao = aux.composicao;
      dadosCriacao.preco = aux.preco;

      jest
        .spyOn(cardapioService, 'cadastrarProdutoCardapio')
        .mockResolvedValue(aux);

      const resposta = await cardapioController.adicionarProduto(
        usuarioReq,
        dadosCriacao,
      );

      expect(cardapioService.cadastrarProdutoCardapio).toBeCalledTimes(1);
      expect(cardapioService.cadastrarProdutoCardapio).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        dadosCriacao,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarProdutoCardapio(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosCriacao = {} as CreateProdutoCardapioDto;
      dadosCriacao.descricao = aux.descricao;
      dadosCriacao.idUsuario = aux.idUsuario;
      dadosCriacao.nomeProduto = aux.nomeProduto;
      dadosCriacao.categoria = aux.categoria;
      dadosCriacao.composicao = aux.composicao;
      dadosCriacao.preco = aux.preco;

      jest
        .spyOn(cardapioService, 'cadastrarProdutoCardapio')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        cardapioController.adicionarProduto(usuarioReq, dadosCriacao),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Atualizar Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarProdutoCardapio(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosAtualizacao = {} as UpdateProdutoCardapioDto;
      dadosAtualizacao.descricao = aux.descricao;
      dadosAtualizacao.nomeProduto = aux.nomeProduto;

      jest
        .spyOn(cardapioService, 'atualizarProdutoCardapio')
        .mockResolvedValue(aux);

      const resposta = await cardapioController.atualizarProduto(
        usuarioReq,
        aux.id,
        dadosAtualizacao,
      );

      expect(cardapioService.atualizarProdutoCardapio).toBeCalledTimes(1);
      expect(cardapioService.atualizarProdutoCardapio).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        aux.id,
        dadosAtualizacao,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarProdutoCardapio(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosAtualizacao = {} as UpdateProdutoCardapioDto;
      dadosAtualizacao.descricao = aux.descricao;
      dadosAtualizacao.nomeProduto = aux.nomeProduto;

      jest
        .spyOn(cardapioService, 'atualizarProdutoCardapio')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        cardapioController.atualizarProduto(
          usuarioReq,
          aux.id,
          dadosAtualizacao,
        ),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Carregar Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarProdutoCardapio(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockResolvedValue(aux);

      const resposta = await cardapioController.carregarProduto(
        usuarioReq,
        aux.id,
      );

      expect(cardapioService.carregarProdutoCardapio).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutoCardapio).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        aux.id,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarProdutoEstoque(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      jest
        .spyOn(cardapioService, 'carregarProdutoCardapio')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        cardapioController.carregarProduto(usuarioReq, aux.id),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Carregar Produtos', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const produtos = [
        GeradorDeObjetos.criarProdutoCardapio(
          true,
          usuarioReq.user.idUsuarioLogado,
        ),
        GeradorDeObjetos.criarProdutoCardapio(
          true,
          usuarioReq.user.idUsuarioLogado,
        ),
      ];

      jest
        .spyOn(cardapioService, 'carregarProdutosCardapio')
        .mockResolvedValue(produtos);

      const resposta = await cardapioController.carregarProdutos(usuarioReq);

      expect(cardapioService.carregarProdutosCardapio).toBeCalledTimes(1);
      expect(cardapioService.carregarProdutosCardapio).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
      );

      expect(resposta).toEqual(produtos);
    });

    it('Caso ocorra um erro no servico', async () => {
      jest
        .spyOn(cardapioService, 'carregarProdutosCardapio')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        cardapioController.carregarProdutos(usuarioReq),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Remover Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const idProduto = 'idProduto';

      jest
        .spyOn(cardapioService, 'removerProdutoCardapio')
        .mockResolvedValue(null);

      await cardapioController.removerProduto(usuarioReq, idProduto);

      expect(cardapioService.removerProdutoCardapio).toBeCalledTimes(1);
      expect(cardapioService.removerProdutoCardapio).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        idProduto,
      );
    });

    it('Caso ocorra um erro no servico', async () => {
      const idProduto = 'idProduto';

      jest
        .spyOn(cardapioService, 'removerProdutoCardapio')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        cardapioController.removerProduto(usuarioReq, idProduto),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });
});

function erroDetalhadoGenerico() {
  return new ErroDetalhado('', 0, 'erro');
}
