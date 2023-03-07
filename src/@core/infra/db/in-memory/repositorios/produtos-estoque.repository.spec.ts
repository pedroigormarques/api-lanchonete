import { NotFoundException } from './../../../../custom-exception/not-found-exception.error';
import { BadRequestException } from './../../../../custom-exception/bad-request-exception.error';
import { ForbiddenException } from './../../../../custom-exception/forbidden-exception.error';
import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';

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
      ).rejects.toThrowError(BadRequestException);
    });

    it('Erro ao passar quantidade menor que 0 com dados válidos', async () => {
      const produto = GeradorDeObjetos.criarProdutoEstoque();
      produto.quantidade = -100;

      await expect(
        estoqueRepositorio.cadastrarProduto(produto),
      ).rejects.toThrowError(BadRequestException);
    });
  });

  describe('Carregar Produtos', () => {
    it('Retorno de produtos do usuario passado', async () => {
      const idUsuarioTeste = 'idTeste';
      const { produtoRegistrado: produtoDoUsuario1 } = registrarProdutoDeTeste(
        estoqueRepositorio,
        idUsuarioTeste,
      );
      const { produtoRegistrado: produtoDoUsuario2 } = registrarProdutoDeTeste(
        estoqueRepositorio,
        idUsuarioTeste,
      );
      const resposta = await estoqueRepositorio.carregarProdutos(
        idUsuarioTeste,
      );

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(produtoDoUsuario1);
      expect(resposta[0].idUsuario).toEqual(idUsuarioTeste);
      expect(resposta).toContainEqual(produtoDoUsuario2);
      expect(resposta[1].idUsuario).toEqual(idUsuarioTeste);
    });

    it('Retorno de produtos ao inserir lista com ids válidos do usuário', async () => {
      const idUsuarioTeste = 'idTeste';
      const { produtoRegistrado: produto2 } = registrarProdutoDeTeste(
        estoqueRepositorio,
        idUsuarioTeste,
      );
      registrarProdutoDeTeste(estoqueRepositorio);

      const resposta = await estoqueRepositorio.carregarProdutos(
        idUsuarioTeste,
        [produto2.id],
      );

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(1);
      expect(resposta).toContainEqual(produto2);
      expect(resposta[0].idUsuario).toEqual(idUsuarioTeste);
    });

    it('Erro ao tentar carregar produto que não existe', async () => {
      const idUsuarioTeste = 'idTeste';
      await expect(
        estoqueRepositorio.carregarProdutos(idUsuarioTeste, ['a']),
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
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('Atualizar Produto', () => {
    it('Retorno de produto atualizado ao inserir dados válido', async () => {
      const produtoAux = GeradorDeObjetos.criarProdutoEstoque(
        false,
        produto1.idUsuario,
      );

      produtoAux.id = produto1.id;

      const resposta = await estoqueRepositorio.atualizarProduto(
        produtoAux.id,
        produtoAux,
      );

      expect(resposta.id).toEqual(produto1.id);
      expect(resposta).toEqual(produtoAux);

      expect(new ProdutoEstoque(produto1Banco)).toEqual(produtoAux);
    });

    it('Erro ao não encontrar produto a ser atualizado com o id passado', async () => {
      const produtoAux = GeradorDeObjetos.criarProdutoEstoque(
        false,
        produto1.idUsuario,
      );

      await expect(
        estoqueRepositorio.atualizarProduto(produtoAux.id, produtoAux),
      ).rejects.toThrowError(NotFoundException);

      expect(
        new ProdutoEstoque(
          (estoqueRepositorio as any).produtos.get(produto1.id),
        ),
      ).toEqual(produto1);
    });

    it('Erro ao passar quantidade menor que 0 com dados válidos', async () => {
      const produto = new ProdutoEstoque(produto1);

      produto.quantidade = -100;

      await expect(
        estoqueRepositorio.atualizarProduto(produto.id, produto),
      ).rejects.toThrowError(BadRequestException);

      expect(
        (estoqueRepositorio as any).produtos.get(produto1.id).quantidade,
      ).toEqual(produto1.quantidade);
    });

    it('Erro ao tentar trocar a unidade de um produto sendo utilizado', async () => {
      produto1Banco.usadoPor.add('idTeste');
      const produto = new ProdutoEstoque(produto1);

      produto.unidade =
        produto.unidade === UNIDADES.L ? UNIDADES.g : UNIDADES.L;

      await expect(
        estoqueRepositorio.atualizarProduto(produto.id, produto),
      ).rejects.toThrowError();

      expect(
        (estoqueRepositorio as any).produtos.get(produto1.id).unidade,
      ).toEqual(produto1.unidade);
    });
  });

  describe('Atualizar Produtos', () => {
    it('Retorno de produtos atualizados ao inserir lista válida', async () => {
      const { produtoRegistrado: produto2, produtoBanco: produtoBanco2 } =
        registrarProdutoDeTeste(estoqueRepositorio, produto1.idUsuario);

      const produtoAux = GeradorDeObjetos.criarProdutoEstoque(
        false,
        produto1.idUsuario,
      );
      const produtoAux2 = GeradorDeObjetos.criarProdutoEstoque(
        false,
        produto1.idUsuario,
      );

      produtoAux.id = produto1.id;
      produtoAux2.id = produto2.id;

      const resposta = await estoqueRepositorio.atualizarProdutos([
        produtoAux,
        produtoAux2,
      ]);

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(produtoAux);
      expect(resposta).toContainEqual(produtoAux2);

      expect(new ProdutoEstoque(produto1Banco)).toEqual(produtoAux);
      expect(new ProdutoEstoque(produtoBanco2)).toEqual(produtoAux2);
    });

    it('Erro ao não encontrar produto a ser atualizado com o id passado', async () => {
      const produtoAux = GeradorDeObjetos.criarProdutoEstoque();
      const produtoAux2 = GeradorDeObjetos.criarProdutoEstoque();

      produtoAux.id = produto1.id;

      await expect(
        estoqueRepositorio.atualizarProdutos([produtoAux, produtoAux2]),
      ).rejects.toThrowError();

      expect(
        new ProdutoEstoque(
          (estoqueRepositorio as any).produtos.get(produto1.id),
        ),
      ).toEqual(produto1);
      expect((estoqueRepositorio as any).produtos.size).toEqual(1);
    });

    it('Erro ao passar algum dos dados inválidos', async () => {
      const produtoAux = GeradorDeObjetos.criarProdutoEstoque();

      produtoAux.id = produto1.id;
      produtoAux.quantidade = -10;

      await expect(
        estoqueRepositorio.atualizarProdutos([produtoAux]),
      ).rejects.toThrowError(BadRequestException);

      expect(
        new ProdutoEstoque(
          (estoqueRepositorio as any).produtos.get(produto1.id),
        ),
      ).toEqual(produto1);
      expect((estoqueRepositorio as any).produtos.size).toEqual(1);
    });
  });

  describe('Remover Produto', () => {
    it('Remoção do produto ao inserir id válido', async () => {
      await estoqueRepositorio.removerProduto(produto1.id);

      expect((estoqueRepositorio as any).produtos.size).toEqual(0);
      expect((estoqueRepositorio as any).produtos.has(produto1.id)).toBeFalsy();
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      await expect(estoqueRepositorio.removerProduto('a')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('Erro ao tentar remover produto sendo utilizado', async () => {
      produto1Banco.usadoPor.add('a');

      await expect(
        estoqueRepositorio.removerProduto(produto1.id),
      ).rejects.toThrowError(UnprocessableEntityException);
    });
  });

  describe('Marcar Relacoes', () => {
    it('Criado marca de relação no produto ao inserir dados válidos', async () => {
      const idTeste = 'idTeste';
      const idUsuarioTeste = 'idUsuarioTeste';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        estoqueRepositorio,
        idUsuarioTeste,
      );

      await estoqueRepositorio.marcarRelacoes(idTeste, idUsuarioTeste, [
        produtoRegistrado.id,
      ]);

      expect(produtoBanco.usadoPor.size).toEqual(1);
      expect(produtoBanco.usadoPor.has(idTeste)).toBeTruthy();
    });

    it('Erro ao não encontrar produto com algum dos ids passado', async () => {
      await expect(
        estoqueRepositorio.marcarRelacoes('idTeste', 'idUsuarioTeste', ['a']),
      ).rejects.toThrowError();
    });

    it('Não marcar demais relações ao não encontrar algum dos produtos passado', async () => {
      const idTeste = 'idTeste';
      const idUsuarioTeste = 'idUsuarioTeste';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        estoqueRepositorio,
        idUsuarioTeste,
      );

      await expect(
        estoqueRepositorio.marcarRelacoes(idTeste, idUsuarioTeste, [
          produtoRegistrado.id,
          'a',
        ]),
      ).rejects.toThrowError();

      expect(produtoBanco.usadoPor.size).toEqual(0);
      expect(produtoBanco.usadoPor.has(idTeste)).toBeFalsy();
    });

    it('Não marcar produtos de outro usuario', async () => {
      const idTeste = 'idTeste';
      const idUsuarioTeste = 'idUsuarioTeste';

      await expect(
        estoqueRepositorio.marcarRelacoes(idTeste, idUsuarioTeste, [
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
      const idUsuarioTeste = 'idUsuarioTeste';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        estoqueRepositorio,
        idUsuarioTeste,
      );
      produtoBanco.usadoPor.add(idTeste);

      await estoqueRepositorio.removerRelacoes(idTeste, idUsuarioTeste, [
        produtoRegistrado.id,
      ]);

      expect(produtoBanco.usadoPor.size).toEqual(0);
      expect(produtoBanco.usadoPor.has(idTeste)).toBeFalsy();
    });

    it('Erro ao não encontrar produto com algum dos ids passado', async () => {
      const idTeste = 'idTeste';

      await expect(
        estoqueRepositorio.removerRelacoes(idTeste, 'idUsuarioTeste', ['a']),
      ).rejects.toThrowError();
    });

    it('Não remover demais relações ao não encontrar algum dos produtos passado', async () => {
      const idTeste = 'idTeste';
      const idUsuarioTeste = 'idUsuarioTeste';

      const { produtoRegistrado, produtoBanco } = registrarProdutoDeTeste(
        estoqueRepositorio,
        idUsuarioTeste,
      );

      produtoBanco.usadoPor.add(idTeste);

      await expect(
        estoqueRepositorio.removerRelacoes(idTeste, idUsuarioTeste, [
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
  estoqueRepositorio: ProdutosEstoqueRepository,
  idUsuario?: string,
): { produtoRegistrado: ProdutoEstoque; produtoBanco: ProdutoEstoqueDB } {
  const produtoRegistrado = GeradorDeObjetos.criarProdutoEstoque(
    false,
    idUsuario,
  );
  const produtoBanco = new ProdutoEstoqueDB(produtoRegistrado);
  produtoRegistrado.id = produtoBanco.id;

  (estoqueRepositorio as any).produtos //pela quebra de proteção "private"
    .set(produtoBanco.id, produtoBanco);
  return { produtoRegistrado, produtoBanco };
}
