import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { GeradorDeObjetos } from './../../../../../test/gerador-objetos.faker';
import { ProdutoCardapio } from './../../../../dominio/produto-cardapio.entity';
import { ProdutoCardapioDB } from './../modelos/produto-cardapio.db-entity';
import { ProdutosCardapioRepository } from './produtos-cardapio.repository';
import { ProdutosEstoqueRepository } from './produtos-estoque.repository';

describe('Produto Cardapio Repositorio', () => {
  let estoqueRepositorio: ProdutosEstoqueRepository;
  let cardapioRepositorio: ProdutosCardapioRepository;

  let produto1: ProdutoCardapio;
  let produto1Banco: ProdutoCardapioDB;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ProdutosCardapioRepository,
          useFactory: (estoque: ProdutosEstoqueRepository) =>
            new ProdutosCardapioRepository(estoque),
          inject: [ProdutosEstoqueRepository],
        },
        {
          provide: ProdutosEstoqueRepository,
          useClass: ProdutosEstoqueRepository,
        },
      ],
    }).compile();

    estoqueRepositorio = moduleRef.get<ProdutosEstoqueRepository>(
      ProdutosEstoqueRepository,
    );
    cardapioRepositorio = moduleRef.get<ProdutosCardapioRepository>(
      ProdutosCardapioRepository,
    );

    //registrando ao menos um produto antes de cada teste para os testes de update, carregamento e remoção
    const produtoCompleto = registrarProdutoDeTeste(cardapioRepositorio);
    produto1 = produtoCompleto.produtoRegistrado;
    produto1Banco = produtoCompleto.produtoBanco;
  });

  it('Instanciado', async () => {
    expect(estoqueRepositorio).toBeDefined();
    expect(cardapioRepositorio).toBeDefined();
  });

  describe('Cadastrar Produto', () => {
    it('Registro realizado com dados válidos', async () => {
      const produto = GeradorDeObjetos.criarProdutoCardapio();

      jest.spyOn(estoqueRepositorio, 'marcarRelacoes').mockResolvedValue(null);

      const resposta = await cardapioRepositorio.cadastrarProduto(produto);

      expect(resposta).toBeInstanceOf(ProdutoCardapio);
      expect(resposta.descricao).toEqual(produto.descricao);
      expect(resposta.nomeProduto).toEqual(produto.nomeProduto);
      expect(resposta.composicao).toEqual(produto.composicao);
      expect(resposta.preco).toEqual(produto.preco);
      expect(resposta.categoria).toEqual(produto.categoria);
      expect(resposta.id).toBeDefined();

      expect(
        (cardapioRepositorio as any).produtos.get(resposta.id).usadoPor,
      ).toBeDefined();
      expect((cardapioRepositorio as any).produtos.size).toEqual(2); //1+1 do criado para auxilio dos teste
    });

    it('Erro ao passar dados insuficientes', async () => {
      const produto = new ProdutoCardapio();
      await expect(
        cardapioRepositorio.cadastrarProduto(produto),
      ).rejects.toThrowError();

      expect((cardapioRepositorio as any).produtos.size).toEqual(1); //1 do criado para auxilio dos teste
    });

    it('Erro ao passar composicao com id errado', async () => {
      const produto = GeradorDeObjetos.criarProdutoCardapio();

      jest
        .spyOn(estoqueRepositorio, 'marcarRelacoes')
        .mockRejectedValue(new Error(`produto não encontrado`));

      await expect(
        cardapioRepositorio.cadastrarProduto(produto),
      ).rejects.toThrowError();

      expect((cardapioRepositorio as any).produtos.size).toEqual(1); //1 do criado para auxilio dos teste
    });

    it('Erro ao passar composicao sem produto', async () => {
      const produto = GeradorDeObjetos.criarProdutoCardapio();
      produto.composicao = new Map<string, number>();

      jest.spyOn(estoqueRepositorio, 'marcarRelacoes').mockResolvedValue(null);

      await expect(
        cardapioRepositorio.cadastrarProduto(produto),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.marcarRelacoes).toBeCalledTimes(0);

      expect((cardapioRepositorio as any).produtos.size).toEqual(1); //1 do criado para auxilio dos teste
    });
  });

  describe('Carregar Produto', () => {
    it('Retorno de produto ao inserir id válido', async () => {
      const resposta = await cardapioRepositorio.carregarProduto(produto1.id);

      expect(resposta).toEqual(produto1);
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      await expect(
        cardapioRepositorio.carregarProduto('a'),
      ).rejects.toThrowError();
    });
  });

  describe('Carregar Produtos', () => {
    it('Retorno de produtos do usuário', async () => {
      const idUsuarioTeste = 'idTeste';
      const { produtoRegistrado: produtoRegistrado1 } = registrarProdutoDeTeste(
        cardapioRepositorio,
        idUsuarioTeste,
      );
      const { produtoRegistrado: produtoRegistrado2 } = registrarProdutoDeTeste(
        cardapioRepositorio,
        idUsuarioTeste,
      );

      const resposta = await cardapioRepositorio.carregarProdutos(
        idUsuarioTeste,
      );

      expect(resposta).toBeInstanceOf(Array<ProdutoCardapio>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(produtoRegistrado1);
      expect(resposta).toContainEqual(produtoRegistrado2);

      expect((cardapioRepositorio as any).produtos.size).toEqual(3);
    });

    it('Retorno de produtos ao inserir lista com ids válidos para o usuário', async () => {
      const idUsuarioTeste = 'idTeste';
      const { produtoRegistrado: produtoRegistrado1 } = registrarProdutoDeTeste(
        cardapioRepositorio,
        idUsuarioTeste,
      );
      registrarProdutoDeTeste(cardapioRepositorio, idUsuarioTeste);

      const resposta = await cardapioRepositorio.carregarProdutos(
        idUsuarioTeste,
        [produtoRegistrado1.id],
      );

      expect(resposta).toBeInstanceOf(Array<ProdutoCardapio>);
      expect(resposta.length).toEqual(1);
      expect(resposta).toContainEqual(produtoRegistrado1);

      expect((cardapioRepositorio as any).produtos.size).toEqual(3);
    });

    it('Erro ao não encontrar produto com um dos ids passados', async () => {
      await expect(
        cardapioRepositorio.carregarProdutos('idTeste', ['a']),
      ).rejects.toThrowError();
    });
  });

  describe('Atualizar Produto', () => {
    it('Retorno de produto atualizado ao inserir dados válido', async () => {
      const produto = GeradorDeObjetos.criarProdutoCardapio();
      produto.id = produto1.id;

      jest.spyOn(estoqueRepositorio, 'validarListaIds').mockResolvedValue(null);
      jest.spyOn(estoqueRepositorio, 'marcarRelacoes').mockResolvedValue(null);
      jest.spyOn(estoqueRepositorio, 'removerRelacoes').mockResolvedValue(null);

      const resposta = await cardapioRepositorio.atualizarProduto(
        produto.id,
        produto,
      );

      expect(resposta.id).toEqual(produto1.id);
      expect(resposta).toEqual(produto);
    });

    it('Erro ao não encontrar produto a ser atualizado com o id passado', async () => {
      await expect(
        cardapioRepositorio.atualizarProduto('a', produto1),
      ).rejects.toThrowError();
    });

    it('Erro ao passar produto com dados inválidos', async () => {
      jest.spyOn(estoqueRepositorio, 'validarListaIds').mockResolvedValue(null);
      jest.spyOn(estoqueRepositorio, 'marcarRelacoes').mockResolvedValue(null);
      jest.spyOn(estoqueRepositorio, 'removerRelacoes').mockResolvedValue(null);

      const produto = new ProdutoCardapio();
      produto.id = produto1.id;

      await expect(
        cardapioRepositorio.atualizarProduto(produto.id, produto),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.removerRelacoes).toBeCalledTimes(0);
      expect(estoqueRepositorio.marcarRelacoes).toBeCalledTimes(0);
    });

    it('Erro ao passar composicao com produto invalido', async () => {
      const produto = GeradorDeObjetos.criarProdutoCardapio();
      produto.id = produto1.id;

      jest
        .spyOn(estoqueRepositorio, 'validarListaIds')
        .mockRejectedValue(new Error(`produto não encontrado`));

      jest.spyOn(estoqueRepositorio, 'marcarRelacoes').mockResolvedValue(null);
      jest.spyOn(estoqueRepositorio, 'removerRelacoes').mockResolvedValue(null);

      await expect(
        cardapioRepositorio.atualizarProduto(produto.id, produto),
      ).rejects.toThrowError();

      expect([...produto1Banco.composicao.keys()]).toEqual([
        ...produto1.composicao.keys(),
      ]);

      expect(estoqueRepositorio.removerRelacoes).toBeCalledTimes(0);
      expect(estoqueRepositorio.marcarRelacoes).toBeCalledTimes(0);
    });

    it('Erro ao passar composicao sem produto', async () => {
      const produto = GeradorDeObjetos.criarProdutoCardapio();
      produto.id = produto1.id;
      produto.composicao = new Map<string, number>();

      jest.spyOn(estoqueRepositorio, 'validarListaIds').mockResolvedValue(null);
      jest.spyOn(estoqueRepositorio, 'marcarRelacoes').mockResolvedValue(null);
      jest.spyOn(estoqueRepositorio, 'removerRelacoes').mockResolvedValue(null);

      await expect(
        cardapioRepositorio.atualizarProduto(produto.id, produto),
      ).rejects.toThrowError();

      expect([...produto1Banco.composicao.keys()]).toEqual([
        ...produto1.composicao.keys(),
      ]);

      expect(estoqueRepositorio.removerRelacoes).toBeCalledTimes(0);
      expect(estoqueRepositorio.marcarRelacoes).toBeCalledTimes(0);
    });
  });

  describe('Remover Produto', () => {
    it('Remoção do produto ao inserir id válido', async () => {
      jest.spyOn(estoqueRepositorio, 'removerRelacoes').mockResolvedValue(null);

      await cardapioRepositorio.removerProduto(produto1.id);

      expect((cardapioRepositorio as any).produtos.size).toEqual(0);
      expect(
        (cardapioRepositorio as any).produtos.has(produto1.id),
      ).toBeFalsy();
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      await expect(
        cardapioRepositorio.removerProduto('a'),
      ).rejects.toThrowError();

      expect((cardapioRepositorio as any).produtos.size).toEqual(1);
    });

    it('Erro ao tentar remover produto sendo utilizado', async () => {
      produto1Banco.usadoPor.add('a');

      await expect(
        cardapioRepositorio.removerProduto(produto1.id),
      ).rejects.toThrowError();
    });

    it('Erro ao tentar remover relacao de produto da composição', async () => {
      jest
        .spyOn(estoqueRepositorio, 'removerRelacoes')
        .mockRejectedValue(new Error(`erro`));

      await expect(
        cardapioRepositorio.removerProduto(produto1.id),
      ).rejects.toThrowError();
      expect((cardapioRepositorio as any).produtos.size).toEqual(1);
    });
  });

  describe('Marcar Relacoes', () => {
    it('Criado marca de relação no produto ao inserir dados válidos', async () => {
      const idTeste = 'idTeste';
      const idUsuarioPedido = 'idUsuario';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        cardapioRepositorio,
        idUsuarioPedido,
      );

      await cardapioRepositorio.marcarRelacoes(idTeste, idUsuarioPedido, [
        produtoRegistrado.id,
      ]);

      expect(produtoBanco.usadoPor.size).toEqual(1);
      expect(produtoBanco.usadoPor.has(idTeste)).toBeTruthy();
    });

    it('Erro ao não encontrar produto com algum dos ids passado', async () => {
      await expect(
        cardapioRepositorio.marcarRelacoes('idTeste', 'idUsuario', ['a']),
      ).rejects.toThrowError();
    });

    it('Não marcar demais relações ao não encontrar algum dos produtos passado', async () => {
      const idTeste = 'idTeste';
      const idUsuarioPedido = 'idUsuario';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        cardapioRepositorio,
        idUsuarioPedido,
      );

      await expect(
        cardapioRepositorio.marcarRelacoes(idTeste, idUsuarioPedido, [
          produtoRegistrado.id,
          'a',
        ]),
      ).rejects.toThrowError();

      expect(produtoBanco.usadoPor.size).toEqual(0);
      expect(produtoBanco.usadoPor.has(idTeste)).toBeFalsy();
    });

    it('Não marcar relação com produto de outro usuario', async () => {
      const idTeste = 'idTeste';
      const idUsuarioPedido = 'idUsuario';

      await expect(
        cardapioRepositorio.marcarRelacoes(idTeste, idUsuarioPedido, [
          produto1.id,
        ]),
      ).rejects.toThrowError(ForbiddenException);

      expect(produto1Banco.usadoPor.size).toEqual(0);
      expect(produto1Banco.usadoPor.has(idTeste)).toBeFalsy();
    });
  });

  describe('Remover Relacoes', () => {
    it('Removido marca de relação no produto ao inserir dados válidos', async () => {
      const idTeste = 'idTeste';
      const idUsuarioPedido = 'idUsuario';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        cardapioRepositorio,
        idUsuarioPedido,
      );
      produtoBanco.usadoPor.add(idTeste);

      await cardapioRepositorio.removerRelacoes(idTeste, idUsuarioPedido, [
        produtoRegistrado.id,
      ]);

      expect(produto1Banco.usadoPor.size).toEqual(0);
      expect(produto1Banco.usadoPor.has(idTeste)).toBeFalsy();
    });

    it('Erro ao não encontrar produto com algum dos ids passado', async () => {
      const idTeste = 'idTeste';

      await expect(
        cardapioRepositorio.removerRelacoes(idTeste, 'idUsuario', ['a']),
      ).rejects.toThrowError();
    });

    it('Não remover demais relações ao não encontrar algum dos produtos passado', async () => {
      const idTeste = 'idTeste';
      const idUsuarioPedido = 'idUsuario';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        cardapioRepositorio,
        idUsuarioPedido,
      );

      produtoBanco.usadoPor.add(idTeste);

      await expect(
        cardapioRepositorio.removerRelacoes(idTeste, idUsuarioPedido, [
          produtoRegistrado.id,
          'a',
        ]),
      ).rejects.toThrowError();

      expect(produtoBanco.usadoPor.size).toEqual(1);
      expect(produtoBanco.usadoPor.has(idTeste)).toBeTruthy();
    });
  });
});

function registrarProdutoDeTeste(
  cardapioRepositorio: ProdutosCardapioRepository,
  idUsuario?: string,
): { produtoRegistrado: ProdutoCardapio; produtoBanco: ProdutoCardapioDB } {
  const produtoRegistrado = GeradorDeObjetos.criarProdutoCardapio(
    false,
    idUsuario,
  );

  const produtoBanco = new ProdutoCardapioDB(produtoRegistrado);
  produtoRegistrado.id = produtoBanco.id;

  (cardapioRepositorio as any).produtos //pela quebra de proteção "private"
    .set(produtoBanco.id, produtoBanco);
  return { produtoRegistrado, produtoBanco };
}
