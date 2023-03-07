import { Test } from '@nestjs/testing';

import { BadRequestException } from './../custom-exception/bad-request-exception.error';
import { ForbiddenException } from './../custom-exception/forbidden-exception.error';
import { ErroDetalhado } from './../custom-exception/exception-detalhado.error';
import { IProdutosCardapioRepository } from '../infra/contratos/produtos-cardapio.repository.interface';
import { ProdutosCardapioRepository } from '../infra/db/in-memory/repositorios/produtos-cardapio.repository';
import { NotFoundException } from './../custom-exception/not-found-exception.error';
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
      const idUsuario = 'idTeste';
      const produtoResposta = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );

      jest
        .spyOn(cardapioRepositorio, 'cadastrarProduto')
        .mockResolvedValue(produtoResposta);

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      const dadosCriacao = {} as DadosBaseProdutoCardapio;
      dadosCriacao.idUsuario = produtoResposta.idUsuario;
      dadosCriacao.descricao = produtoResposta.descricao;
      dadosCriacao.nomeProduto = produtoResposta.nomeProduto;
      dadosCriacao.categoria = produtoResposta.categoria;
      dadosCriacao.preco = produtoResposta.preco;
      dadosCriacao.composicao = new Map(produtoResposta.composicao.entries());

      const resposta = await cardapioService.cadastrarProdutoCardapio(
        idUsuario,
        dadosCriacao,
      );

      expect(resposta).toBeInstanceOf(ProdutoCardapio);
      expect(resposta.id).toBeDefined();
      expect(resposta.idUsuario).toEqual(dadosCriacao.idUsuario);
      expect(resposta.descricao).toEqual(dadosCriacao.descricao);
      expect(resposta.nomeProduto).toEqual(dadosCriacao.nomeProduto);
      expect(resposta.composicao).toEqual(dadosCriacao.composicao);
      expect(resposta.categoria).toEqual(dadosCriacao.categoria);
      expect(resposta.preco).toEqual(dadosCriacao.preco);

      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Erro ao passar dados insuficientes ou dados incorretos', async () => {
      jest
        .spyOn(cardapioRepositorio, 'cadastrarProduto')
        .mockResolvedValue(null);
      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        cardapioService.cadastrarProdutoCardapio(
          'idteste',
          {} as DadosBaseProdutoCardapio,
        ),
      ).rejects.toThrowError(BadRequestException);

      expect(cardapioRepositorio.cadastrarProduto).toBeCalledTimes(0);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao tentar cadastrar produto para outro usuario', async () => {
      const idUsuario = 'idTeste';
      const produtoAux = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'cadastrarProduto')
        .mockResolvedValue(produtoAux);

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      const dadosCriacao = {} as DadosBaseProdutoCardapio;
      dadosCriacao.idUsuario = produtoAux.idUsuario;
      dadosCriacao.descricao = produtoAux.descricao;
      dadosCriacao.nomeProduto = produtoAux.nomeProduto;
      dadosCriacao.categoria = produtoAux.categoria;
      dadosCriacao.preco = produtoAux.preco;
      dadosCriacao.composicao = new Map(produtoAux.composicao.entries());

      await expect(
        cardapioService.cadastrarProdutoCardapio(idUsuario, dadosCriacao),
      ).rejects.toThrowError(ForbiddenException);

      expect(cardapioRepositorio.cadastrarProduto).toBeCalledTimes(0);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(0);
    });
  });

  describe('Atualizar Produto Cardapio', () => {
    it('Retorno de produto atualizado ao passar alguns dados corretos', async () => {
      const idUsuario = 'idTeste';

      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest
        .spyOn(cardapioRepositorio, 'atualizarProduto')
        .mockImplementation(
          async (id, produto) => new ProdutoCardapio(produto),
        );

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      const dadosAtualizacao = {
        preco: 15.99,
        nomeProduto: 'teste',
        descricao: 'teste',
      };

      const resposta = await cardapioService.atualizarProdutoCardapio(
        idUsuario,
        produtoBanco.id,
        dadosAtualizacao,
      );

      expect(resposta).toBeInstanceOf(ProdutoCardapio);
      expect(resposta.id).toEqual(produtoBanco.id);
      expect(resposta.idUsuario).toEqual(produtoBanco.idUsuario);
      expect(resposta.descricao).toEqual(dadosAtualizacao.descricao);
      expect(resposta.preco).toEqual(dadosAtualizacao.preco);
      expect(resposta.nomeProduto).toEqual(dadosAtualizacao.nomeProduto);
      expect(resposta.composicao).toEqual(produtoBanco.composicao);
      expect(resposta.categoria).toEqual(produtoBanco.categoria);

      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Erro ao tentar atualizar id não existente', async () => {
      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest
        .spyOn(cardapioRepositorio, 'atualizarProduto')
        .mockResolvedValue(null);

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        cardapioService.atualizarProdutoCardapio(
          'idTeste',
          'a',
          {} as DadosBaseProdutoCardapio,
        ),
      ).rejects.toThrowError(ErroDetalhado);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.atualizarProduto).toBeCalledTimes(0);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao tentar atualizar produto de outro usuario', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest
        .spyOn(cardapioRepositorio, 'atualizarProduto')
        .mockResolvedValue(produtoBanco);

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        cardapioService.atualizarProdutoCardapio(
          idUsuario,
          produtoBanco.id,
          {} as DadosBaseProdutoCardapio,
        ),
      ).rejects.toThrowError(ForbiddenException);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.atualizarProduto).toBeCalledTimes(0);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro no processo de atualização', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest
        .spyOn(cardapioRepositorio, 'atualizarProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        cardapioService.atualizarProdutoCardapio(
          idUsuario,
          produtoBanco.id,
          {} as DadosBaseProdutoCardapio,
        ),
      ).rejects.toThrowError(ErroDetalhado);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.atualizarProduto).toBeCalledTimes(1);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(0);
    });
  });

  describe('Carregar Produto Cardapio', () => {
    it('Retorno de produto ao inserir id válido para o usuário', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );
      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      const resposta = await cardapioService.carregarProdutoCardapio(
        idUsuario,
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
        cardapioService.carregarProdutoCardapio('idteste', 'a'),
      ).rejects.toThrowError(ErroDetalhado);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
    });

    it('Erro ao tentar carregar o produto de outro usuário', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      await expect(
        cardapioService.carregarProdutoCardapio(idUsuario, produtoBanco.id),
      ).rejects.toThrowError(ForbiddenException);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
    });
  });

  describe('Carregar Produtos Cardapio', () => {
    it('Retorno de produtos', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco1 = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );
      const produtoBanco2 = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );

      jest
        .spyOn(cardapioRepositorio, 'carregarProdutos')
        .mockResolvedValue([produtoBanco1, produtoBanco2]);

      const resposta = await cardapioService.carregarProdutosCardapio(
        idUsuario,
      );

      expect(resposta).toBeInstanceOf(Array<ProdutoCardapio>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(produtoBanco1);
      expect(resposta).toContainEqual(produtoBanco2);

      expect(cardapioRepositorio.carregarProdutos).toBeCalledTimes(1);
    });

    it('Retorno de produtos ao inserir lista com ids válidos para o usuário', async () => {
      const idUsuario = 'idTeste';

      const produtoBanco1 = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );
      const produtoBanco2 = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );
      const produtoBanco3 = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProdutos')
        .mockImplementation(async (idUsuario, idLista) => {
          return [produtoBanco1, produtoBanco2, produtoBanco3].filter(
            (pe) => idLista.includes(pe.id) && pe.idUsuario === idUsuario,
          );
        });

      const resposta = await cardapioService.carregarProdutosCardapio(
        idUsuario,
        [produtoBanco2.id],
      );

      expect(resposta).toBeInstanceOf(Array<ProdutoCardapio>);
      expect(resposta.length).toEqual(1);
      expect(resposta).toContainEqual(produtoBanco2);

      expect(cardapioRepositorio.carregarProdutos).toBeCalledTimes(1);
    });

    it('Erro ao passar algum id de outro usuário', async () => {
      const idUsuario = 'idTeste';

      const produtoBanco1 = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );
      const produtoBanco2 = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );
      const produtoBanco3 = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProdutos')
        .mockImplementation(async (idUsuario, idLista) => {
          return [produtoBanco1, produtoBanco2, produtoBanco3].filter(
            (pe) => idLista.includes(pe.id) && pe.idUsuario === idUsuario,
          );
        });

      await expect(
        cardapioService.carregarProdutosCardapio(idUsuario, [
          produtoBanco2.id,
          produtoBanco3.id,
        ]),
      ).rejects.toThrowError(ForbiddenException);

      expect(cardapioRepositorio.carregarProdutos).toBeCalledTimes(1);
    });

    it('Erro ao não encontrar produto com um dos ids passados', async () => {
      jest
        .spyOn(cardapioRepositorio, 'carregarProdutos')
        .mockRejectedValue(erroIdNaoEncontrado());

      await expect(
        cardapioService.carregarProdutosCardapio('idteste', ['a']),
      ).rejects.toThrowError(ErroDetalhado);

      expect(cardapioRepositorio.carregarProdutos).toBeCalledTimes(1);
    });
  });

  describe('Remover Produto Cardapio', () => {
    it('Remoção do produto ao inserir id válido', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest.spyOn(cardapioRepositorio, 'removerProduto').mockResolvedValue(null);

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      await cardapioService.removerProdutoCardapio(idUsuario, produtoBanco.id);
      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.removerProduto).toBeCalledTimes(1);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(1);
    });

    it('Erro no processo de remoção', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(
        true,
        idUsuario,
      );

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest
        .spyOn(cardapioRepositorio, 'removerProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        cardapioService.removerProdutoCardapio(idUsuario, produtoBanco.id),
      ).rejects.toThrowError(ErroDetalhado);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.removerProduto).toBeCalledTimes(1);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(0);
    });

    it('Erro ao tentar remover produto de outro usuário', async () => {
      const idUsuario = 'idTeste';
      const produtoBanco = GeradorDeObjetos.criarProdutoCardapio(true);

      jest
        .spyOn(cardapioRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest.spyOn(cardapioRepositorio, 'removerProduto').mockResolvedValue(null);

      jest.spyOn(cardapioService, 'emitirAlteracaoItem').mockReturnValue(null);

      await expect(
        cardapioService.removerProdutoCardapio(idUsuario, produtoBanco.id),
      ).rejects.toThrowError(ForbiddenException);

      expect(cardapioRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(cardapioRepositorio.removerProduto).toBeCalledTimes(0);
      expect(cardapioService.emitirAlteracaoItem).toBeCalledTimes(0);
    });
  });
});

function erroIdNaoEncontrado() {
  return new NotFoundException('Produto com o id passado não foi encontrado');
}
