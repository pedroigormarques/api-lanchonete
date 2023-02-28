import { Test } from '@nestjs/testing';

import { IProdutosCardapioRepository } from '../infra/contratos/produtos-cardapio.repository.interface';
import { ProdutosCardapioRepository } from '../infra/db/in-memory/repositorios/produtos-cardapio.repository';
import { GeradorDeObjetos } from './../../test/gerador-objetos.faker';
import {
  DadosBaseProdutoCardapio,
  ProdutoCardapio,
} from './../dominio/produto-cardapio.entity';
import { CardapioService } from './cardapio-service.use-case';

describe('Cardapio Service', () => {
  let cardapioService: CardapioService;
  let cardapioRepositorio: ProdutosCardapioRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: CardapioService,
          useFactory: async (
            cardapioRepositorio: IProdutosCardapioRepository,
          ) => await CardapioService.create(cardapioRepositorio),
          inject: [ProdutosCardapioRepository],
        },
        {
          provide: ProdutosCardapioRepository,
          useClass: ProdutosCardapioRepository,
        },
      ],
    }).compile();

    cardapioRepositorio = moduleRef.get<ProdutosCardapioRepository>(
      ProdutosCardapioRepository,
    );
    cardapioService = moduleRef.get<CardapioService>(CardapioService);
  });

  it('Instanciado', () => {
    expect(cardapioRepositorio).toBeDefined();
    expect(cardapioService).toBeDefined();
  });

  describe('Cadastrar Produto Cardapio', () => {
    it('Retorno de produto registrado ao passar dados corretos', async () => {
      const produtoResposta = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'cadastrarProduto')
        .mockResolvedValue(produtoResposta);

      jest.spyOn(cardapioService, 'emitirAlteracao').mockReturnValue(null);

      const dadosCriacao = {} as DadosBaseProdutoCardapio;
      dadosCriacao.descricao = produtoResposta.descricao;
      dadosCriacao.nomeProduto = produtoResposta.nomeProduto;
      dadosCriacao.categoria = produtoResposta.categoria;
      dadosCriacao.preco = produtoResposta.preco;
      dadosCriacao.composicao = new Map(produtoResposta.composicao.entries());

      const resposta = await cardapioService.cadastrarProdutoCardapio(
        dadosCriacao,
      );

      expect(resposta).toBeInstanceOf(ProdutoCardapio);
      expect(resposta.id).toBeDefined();
      expect(resposta.descricao).toEqual(dadosCriacao.descricao);
      expect(resposta.nomeProduto).toEqual(dadosCriacao.nomeProduto);
      expect(resposta.composicao).toEqual(dadosCriacao.composicao);
      expect(resposta.categoria).toEqual(dadosCriacao.categoria);
      expect(resposta.preco).toEqual(dadosCriacao.preco);

      expect(cardapioService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro ao passar dados insuficientes ou dados incorretos', async () => {
      jest
        .spyOn(cardapioRepositorio, 'cadastrarProduto')
        .mockResolvedValue(null);
      jest.spyOn(cardapioService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        cardapioService.cadastrarProdutoCardapio(
          {} as DadosBaseProdutoCardapio,
        ),
      ).rejects.toThrowError();

      expect(cardapioRepositorio.cadastrarProduto).toBeCalledTimes(0);
      expect(cardapioService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Atualizar Produto Cardapio', () => {
    it('Retorno de produto atualizado ao passar alguns dados corretos', async () => {
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest
        .spyOn(cardapioRepositorio, 'atualizarProduto')
        .mockImplementation(
          async (id, produto) => new ProdutoCardapio(produto),
        );

      jest.spyOn(cardapioService, 'emitirAlteracao').mockReturnValue(null);

      const dadosAtualizacao = {
        preco: 15.99,
        nomeProduto: 'teste',
        descricao: 'teste',
      } as Partial<DadosBaseProdutoCardapio>;

      const resposta = await cardapioService.atualizarProdutoCardapio(
        produtoBanco.id,
        dadosAtualizacao,
      );

      expect(resposta).toBeInstanceOf(ProdutoCardapio);
      expect(resposta.id).toEqual(produtoBanco.id);
      expect(resposta.descricao).toEqual(dadosAtualizacao.descricao);
      expect(resposta.preco).toEqual(dadosAtualizacao.preco);
      expect(resposta.nomeProduto).toEqual(dadosAtualizacao.nomeProduto);
      expect(resposta.composicao).toEqual(produtoBanco.composicao);
      expect(resposta.categoria).toEqual(produtoBanco.categoria);

      expect(cardapioService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro ao tentar atualizar id não existente', async () => {
      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest
        .spyOn(cardapioRepositorio, 'atualizarProduto')
        .mockResolvedValue(null);

      jest.spyOn(cardapioService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        cardapioService.atualizarProdutoCardapio(
          'a',
          {} as DadosBaseProdutoCardapio,
        ),
      ).rejects.toThrowError();

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.atualizarProduto).toBeCalledTimes(0);
      expect(cardapioService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro no processo de atualização', async () => {
      const produtoAux = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoAux);

      jest
        .spyOn(cardapioRepositorio, 'atualizarProduto')
        .mockRejectedValue(new Error('erro'));

      jest.spyOn(cardapioService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        cardapioService.atualizarProdutoCardapio(
          produtoAux.id,
          {} as DadosBaseProdutoCardapio,
        ),
      ).rejects.toThrowError();

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.atualizarProduto).toBeCalledTimes(1);
      expect(cardapioService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Carregar Produto Cardapio', () => {
    it('Retorno de produto ao inserir id válido', async () => {
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      const resposta = await cardapioService.carregarProdutoCardapio(
        produtoBanco.id,
      );

      expect(resposta).toBeInstanceOf(ProdutoCardapio);
      expect(resposta).toEqual(produtoBanco);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      await expect(
        cardapioService.carregarProdutoCardapio('a'),
      ).rejects.toThrowError();

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
    });
  });

  describe('Carregar Produtos Cardapio', () => {
    it('Retorno de produtos', async () => {
      const produtoBanco1 = GeradorDeObjetos.criarProdutoCardapio(true);
      const produtoBanco2 = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProdutos')
        .mockResolvedValue([produtoBanco1, produtoBanco2]);

      const resposta = await cardapioService.carregarProdutosCardapio();

      expect(resposta).toBeInstanceOf(Array<ProdutoCardapio>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(produtoBanco1);
      expect(resposta).toContainEqual(produtoBanco2);

      expect(cardapioRepositorio.carregarProdutos).toBeCalledTimes(1);
    });

    it('Retorno de produtos ao inserir lista com ids válidos', async () => {
      const produtoBanco1 = GeradorDeObjetos.criarProdutoCardapio(true);
      const produtoBanco2 = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProdutos')
        .mockImplementation(async (idLista) => {
          return [produtoBanco1, produtoBanco2].filter((pe) =>
            idLista.includes(pe.id),
          );
        });

      const resposta = await cardapioService.carregarProdutosCardapio([
        produtoBanco2.id,
      ]);

      expect(resposta).toBeInstanceOf(Array<ProdutoCardapio>);
      expect(resposta.length).toEqual(1);
      expect(resposta).toContainEqual(produtoBanco2);

      expect(cardapioRepositorio.carregarProdutos).toBeCalledTimes(1);
    });

    it('Erro ao não encontrar produto com um dos ids passados', async () => {
      jest
        .spyOn(cardapioRepositorio, 'carregarProdutos')
        .mockRejectedValue(erroIdNaoEncontrado());

      await expect(
        cardapioService.carregarProdutosCardapio(['a']),
      ).rejects.toThrowError();

      expect(cardapioRepositorio.carregarProdutos).toBeCalledTimes(1);
    });
  });

  describe('Remover Produto Cardapio', () => {
    it('Remoção do produto ao inserir id válido', async () => {
      jest.spyOn(cardapioRepositorio, 'removerProduto').mockResolvedValue(null);

      jest.spyOn(cardapioService, 'emitirAlteracao').mockReturnValue(null);

      await cardapioService.removerProdutoCardapio('a');
      expect(cardapioRepositorio.removerProduto).toBeCalledTimes(1);
      expect(cardapioService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro no processo de remoção', async () => {
      jest
        .spyOn(cardapioRepositorio, 'removerProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(cardapioService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        cardapioService.removerProdutoCardapio('a'),
      ).rejects.toThrowError();

      expect(cardapioRepositorio.removerProduto).toBeCalledTimes(1);
      expect(cardapioService.emitirAlteracao).toBeCalledTimes(0);
    });
  });
});

function erroIdNaoEncontrado() {
  return new Error('Produto com o id passado não foi encontrado');
}
