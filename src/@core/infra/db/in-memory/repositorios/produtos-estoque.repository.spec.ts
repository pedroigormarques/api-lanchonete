import { Test } from '@nestjs/testing';

import { GeradorDeObjetos } from '../../../../../test/gerador-objetos.faker';
import { UNIDADES } from './../../../../dominio/enums/unidades.enum';
import { ProdutoEstoque } from './../../../../dominio/produto-estoque.entity';
import { ProdutoEstoqueDB } from './../modelos/produto-estoque.db-entity';
import { ProdutosEstoqueRepository } from './produtos-estoque.repository';

describe('Produto Estoque Repositorio', () => {
  let estoqueRepositorio: ProdutosEstoqueRepository;
  let produto1: ProdutoEstoque;
  let produto1Banco: ProdutoEstoqueDB;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ProdutosEstoqueRepository],
    }).compile();

    estoqueRepositorio = moduleRef.get<ProdutosEstoqueRepository>(
      ProdutosEstoqueRepository,
    );

    //registrando ao menos um produto antes de cada teste para os testes de update, carregamento e remoção
    const produtoCompleto = registrarProdutoDeTeste(estoqueRepositorio);
    produto1 = produtoCompleto.produtoRegistrado;
    produto1Banco = produtoCompleto.produtoBanco;
  });

  it('Instanciado', () => {
    expect(estoqueRepositorio).toBeDefined();
  });

  describe('Cadastrar Produto', () => {
    it('Registro realizado com dados válidos', async () => {
      const produto = GeradorDeObjetos.criarProdutoEstoque();

      const resposta = await estoqueRepositorio.cadastrarProduto(produto);

      expect(resposta).toBeInstanceOf(ProdutoEstoque);
      expect(resposta.descricao).toEqual(produto.descricao);
      expect(resposta.nomeProduto).toEqual(produto.nomeProduto);
      expect(resposta.quantidade).toEqual(produto.quantidade);
      expect(resposta.unidade).toEqual(produto.unidade);

      expect(
        (estoqueRepositorio as any).produtos.get(resposta.id).usadoPor,
      ).toBeDefined();
    });

    it('Erro ao passar dados insuficientes', async () => {
      const produto = new ProdutoEstoque();

      await expect(
        estoqueRepositorio.cadastrarProduto(produto),
      ).rejects.toThrowError();
    });

    it('Erro ao passar quantidade menor que 0 com dados válidos', async () => {
      const produto = GeradorDeObjetos.criarProdutoEstoque();
      produto.quantidade = -100;

      await expect(
        estoqueRepositorio.cadastrarProduto(produto),
      ).rejects.toThrowError();
    });
  });

  describe('Carregar Produtos', () => {
    it('Retorno de produtos', async () => {
      const { produtoRegistrado } = registrarProdutoDeTeste(estoqueRepositorio);
      const resposta = await estoqueRepositorio.carregarProdutos();

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(produto1);
      expect(resposta).toContainEqual(produtoRegistrado);
    });

    it('Retorno de produtos ao inserir lista com ids válidos', async () => {
      const { produtoRegistrado: produto2 } =
        registrarProdutoDeTeste(estoqueRepositorio);
      registrarProdutoDeTeste(estoqueRepositorio);

      const resposta = await estoqueRepositorio.carregarProdutos([produto2.id]);

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(1);
      expect(resposta).toContainEqual(produto2);
    });

    it('Erro ao não encontrar produto com um dos ids passados', async () => {
      await expect(
        estoqueRepositorio.carregarProdutos(['a']),
      ).rejects.toThrowError();
    });
  });

  describe('Carregar Produto', () => {
    it('Retorno de produto ao inserir id válido', async () => {
      const resposta = await estoqueRepositorio.carregarProduto(produto1.id);

      expect(resposta).toEqual(produto1);
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      await expect(
        estoqueRepositorio.carregarProduto('a'),
      ).rejects.toThrowError();
    });
  });

  describe('Atualizar Produto', () => {
    it('Retorno de produto atualizado ao inserir dados válido', async () => {
      const produtoAux = GeradorDeObjetos.criarProdutoEstoque();

      produtoAux.id = produto1.id;

      const resposta = await estoqueRepositorio.atualizarProduto(
        produtoAux.id,
        produtoAux,
      );

      expect(resposta.id).toEqual(produto1.id);
      expect(resposta).toEqual(produtoAux);
    });

    it('Erro ao não encontrar produto a ser atualizado com o id passado', async () => {
      await expect(
        estoqueRepositorio.atualizarProduto('a', produto1),
      ).rejects.toThrowError();
    });

    it('Erro ao passar quantidade menor que 0 com dados válidos', async () => {
      const produto = { ...produto1 };

      produto.quantidade = -100;

      await expect(
        estoqueRepositorio.atualizarProduto(produto.id, produto),
      ).rejects.toThrowError();
    });

    it('Erro ao tentar trocar a unidade de um produto sendo utilizado', async () => {
      produto1Banco.usadoPor.add('idTeste');
      const produto = { ...produto1 };

      produto.unidade =
        produto.unidade === UNIDADES.L ? UNIDADES.g : UNIDADES.L;

      await expect(
        estoqueRepositorio.atualizarProduto(produto.id, produto),
      ).rejects.toThrowError();
    });
  });

  describe('Remover Produto', () => {
    it('Remoção do produto ao inserir id válido', async () => {
      await estoqueRepositorio.removerProduto(produto1.id);

      expect((estoqueRepositorio as any).produtos.size).toEqual(0);
      expect((estoqueRepositorio as any).produtos.has(produto1.id)).toBeFalsy();
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      await expect(
        estoqueRepositorio.removerProduto('a'),
      ).rejects.toThrowError();
    });

    it('Erro ao tentar remover produto sendo utilizado', async () => {
      produto1Banco.usadoPor.add('a');

      await expect(
        estoqueRepositorio.removerProduto(produto1.id),
      ).rejects.toThrowError();
    });
  });

  describe('Marcar Relacoes', () => {
    it('Criado marca de relação no produto ao inserir dados válidos', async () => {
      const idTeste = 'idTeste';

      await estoqueRepositorio.marcarRelacoes(idTeste, [produto1.id]);

      expect(produto1Banco.usadoPor.size).toEqual(1);
      expect(produto1Banco.usadoPor.has(idTeste)).toBeTruthy();
    });

    it('Erro ao não encontrar produto com algum dos ids passado', async () => {
      await expect(
        estoqueRepositorio.marcarRelacoes('idTeste', ['a']),
      ).rejects.toThrowError();
    });

    it('Não marcar demais relações ao não encontrar algum dos produtos passado', async () => {
      const idTeste = 'idTeste';
      await expect(
        estoqueRepositorio.marcarRelacoes(idTeste, [produto1.id, 'a']),
      ).rejects.toThrowError();

      expect(produto1Banco.usadoPor.size).toEqual(0);
      expect(produto1Banco.usadoPor.has(idTeste)).toBeFalsy();
    });
  });

  describe('Remover Relacoes', () => {
    it('Removido marca de relação no produto ao inserir dados válidos', async () => {
      const idTeste = 'idTeste';
      produto1Banco.usadoPor.add(idTeste);

      await estoqueRepositorio.removerRelacoes(idTeste, [produto1.id]);

      expect(produto1Banco.usadoPor.size).toEqual(0);
      expect(produto1Banco.usadoPor.has(idTeste)).toBeFalsy();
    });

    it('Erro ao não encontrar produto com algum dos ids passado', async () => {
      const idTeste = 'idTeste';

      await expect(
        estoqueRepositorio.removerRelacoes(idTeste, ['a']),
      ).rejects.toThrowError();
    });

    it('Não remover demais relações ao não encontrar algum dos produtos passado', async () => {
      const idTeste = 'idTeste';
      produto1Banco.usadoPor.add(idTeste);

      await expect(
        estoqueRepositorio.removerRelacoes(idTeste, [produto1.id, 'a']),
      ).rejects.toThrowError();

      expect(produto1Banco.usadoPor.size).toEqual(1);
      expect(produto1Banco.usadoPor.has(idTeste)).toBeTruthy();
    });
  });
});

function registrarProdutoDeTeste(
  estoqueRepositorio: ProdutosEstoqueRepository,
): { produtoRegistrado: ProdutoEstoque; produtoBanco: ProdutoEstoqueDB } {
  const produtoRegistrado = GeradorDeObjetos.criarProdutoEstoque();
  const produtoBanco = new ProdutoEstoqueDB(produtoRegistrado);
  produtoRegistrado.id = produtoBanco.id;

  (estoqueRepositorio as any).produtos //pela quebra de proteção "private"
    .set(produtoBanco.id, produtoBanco);
  return { produtoRegistrado, produtoBanco };
}
