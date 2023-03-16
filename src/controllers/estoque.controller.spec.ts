import { Test } from '@nestjs/testing';
import { Observable } from 'rxjs';

import { EstoqueService } from './../@core/aplicacao/estoque-service.use-case';
import { ErroDetalhado } from './../@core/custom-exception/exception-detalhado.error';
import { GeradorDeObjetos } from './../test/gerador-objetos.faker';
import { EstoqueController } from './estoque.controller';
import {
  CreateProdutoEstoqueDto,
  UpdateProdutoEstoqueDto,
} from './Validation/produto-estoque.dto';

describe('Estoque Controller', () => {
  let estoqueService: EstoqueService;
  let estoqueController: EstoqueController;

  const usuarioReq = {
    user: { idUsuarioLogado: 'idTeste', email: 'email@teste.com' },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EstoqueController],
      providers: [EstoqueService],
    }).compile();

    estoqueService = moduleRef.get<EstoqueService>(EstoqueService);
    estoqueController = moduleRef.get<EstoqueController>(EstoqueController);
  });

  it('Instanciado', () => {
    expect(estoqueService).toBeDefined();
    expect(estoqueController).toBeDefined();
  });

  describe('Carregar Emissor Eventos', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const observable = new Observable<any>();

      jest.spyOn(estoqueService, 'abrirConexao').mockResolvedValue(observable);

      const resposta = await estoqueController.carregarEmissorEventos(
        usuarioReq,
      );

      expect(estoqueService.abrirConexao).toBeCalledTimes(1);
      expect(estoqueService.abrirConexao).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
      );

      expect(resposta).toEqual(observable);
    });

    it('Caso ocorra um erro no servico', async () => {
      jest
        .spyOn(estoqueService, 'abrirConexao')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        estoqueController.carregarEmissorEventos(usuarioReq),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Adicionar Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarProdutoEstoque(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosCriacao = {} as CreateProdutoEstoqueDto;
      dadosCriacao.descricao = aux.descricao;
      dadosCriacao.idUsuario = aux.idUsuario;
      dadosCriacao.nomeProduto = aux.nomeProduto;
      dadosCriacao.quantidade = aux.quantidade;
      dadosCriacao.unidade = aux.unidade;

      jest
        .spyOn(estoqueService, 'cadastrarProdutoEstoque')
        .mockResolvedValue(aux);

      const resposta = await estoqueController.adicionarProduto(
        usuarioReq,
        dadosCriacao,
      );

      expect(estoqueService.cadastrarProdutoEstoque).toBeCalledTimes(1);
      expect(estoqueService.cadastrarProdutoEstoque).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        dadosCriacao,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarProdutoEstoque(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosCriacao = {} as CreateProdutoEstoqueDto;
      dadosCriacao.descricao = aux.descricao;
      dadosCriacao.idUsuario = aux.idUsuario;
      dadosCriacao.nomeProduto = aux.nomeProduto;
      dadosCriacao.quantidade = aux.quantidade;
      dadosCriacao.unidade = aux.unidade;

      jest
        .spyOn(estoqueService, 'cadastrarProdutoEstoque')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        estoqueController.adicionarProduto(usuarioReq, dadosCriacao),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Atualizar Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarProdutoEstoque(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosAtualizacao = {} as UpdateProdutoEstoqueDto;
      dadosAtualizacao.descricao = aux.descricao;
      dadosAtualizacao.nomeProduto = aux.nomeProduto;

      jest
        .spyOn(estoqueService, 'atualizarProdutoEstoque')
        .mockResolvedValue(aux);

      const resposta = await estoqueController.atualizarProduto(
        usuarioReq,
        aux.id,
        dadosAtualizacao,
      );

      expect(estoqueService.atualizarProdutoEstoque).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutoEstoque).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        aux.id,
        dadosAtualizacao,
      );

      expect(resposta).toEqual(aux);
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarProdutoEstoque(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      const dadosAtualizacao = {} as UpdateProdutoEstoqueDto;
      dadosAtualizacao.descricao = aux.descricao;
      dadosAtualizacao.nomeProduto = aux.nomeProduto;

      jest
        .spyOn(estoqueService, 'atualizarProdutoEstoque')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        estoqueController.atualizarProduto(
          usuarioReq,
          aux.id,
          dadosAtualizacao,
        ),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Carregar Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarProdutoEstoque(
        true,
        usuarioReq.user.idUsuarioLogado,
      );

      jest
        .spyOn(estoqueService, 'carregarProdutoEstoque')
        .mockResolvedValue(aux);

      const resposta = await estoqueController.carregarProduto(
        usuarioReq,
        aux.id,
      );

      expect(estoqueService.carregarProdutoEstoque).toBeCalledTimes(1);
      expect(estoqueService.carregarProdutoEstoque).toBeCalledWith(
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
        .spyOn(estoqueService, 'carregarProdutoEstoque')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        estoqueController.carregarProduto(usuarioReq, aux.id),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Carregar Produtos', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const produtos = [
        GeradorDeObjetos.criarProdutoEstoque(
          true,
          usuarioReq.user.idUsuarioLogado,
        ),
        GeradorDeObjetos.criarProdutoEstoque(
          true,
          usuarioReq.user.idUsuarioLogado,
        ),
      ];

      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockResolvedValue(produtos);

      const resposta = await estoqueController.carregarProdutos(usuarioReq);

      expect(estoqueService.carregarProdutosEstoque).toBeCalledTimes(1);
      expect(estoqueService.carregarProdutosEstoque).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
      );

      expect(resposta).toEqual(produtos);
    });

    it('Caso ocorra um erro no servico', async () => {
      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        estoqueController.carregarProdutos(usuarioReq),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Remover Produto', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const idProduto = 'idProduto';

      jest
        .spyOn(estoqueService, 'removerProdutoEstoque')
        .mockResolvedValue(null);

      await estoqueController.removerProduto(usuarioReq, idProduto);

      expect(estoqueService.removerProdutoEstoque).toBeCalledTimes(1);
      expect(estoqueService.removerProdutoEstoque).toBeCalledWith(
        usuarioReq.user.idUsuarioLogado,
        idProduto,
      );
    });

    it('Caso ocorra um erro no servico', async () => {
      const idProduto = 'idProduto';

      jest
        .spyOn(estoqueService, 'removerProdutoEstoque')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        estoqueController.removerProduto(usuarioReq, idProduto),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });
});

function erroDetalhadoGenerico() {
  return new ErroDetalhado('', 0, 'erro');
}
