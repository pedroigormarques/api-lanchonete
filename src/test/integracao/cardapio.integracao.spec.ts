import { randomUUID } from 'crypto';
import * as request from 'supertest';

import { ProdutoCardapio } from './../../@core/dominio/produto-cardapio.entity';
import { ProdutoEstoque } from './../../@core/dominio/produto-estoque.entity';
import { AuxiliadorTesteIntegracao } from './auxiliador-teste-integracao';
import { ErrosVerificacao } from './erros-verificacao';

describe('Cardapio', () => {
  const auxiliar = new AuxiliadorTesteIntegracao();
  let usuarioTeste: {
    token: string;
    idUsuario: string;
  };
  let tokenUsuario2: string;

  const produtosCadastrados = []; //para teste do GetProdutos

  beforeAll(async () => {
    await auxiliar.beforeAll();
    usuarioTeste = await auxiliar.gerarUsuarioParaTeste();
    const aux = await auxiliar.gerarUsuarioParaTeste();
    tokenUsuario2 = aux.token;
  });

  describe('POST cadastrar', () => {
    let produtoEstoque: ProdutoEstoque;
    let produtoEstoque2: ProdutoEstoque;
    const rota = '/cardapio';

    beforeAll(async () => {
      produtoEstoque = await auxiliar.gerarProdutoEstoqueParaTeste(
        usuarioTeste.idUsuario,
      );
      produtoEstoque2 = await auxiliar.gerarProdutoEstoqueParaTeste(
        usuarioTeste.idUsuario,
      );
    });

    it('Cadastro válido', async () => {
      const dados = {
        idUsuario: usuarioTeste.idUsuario,
        nomeProduto: 'nomeProduto',
        categoria: 'bebidas',
        descricao: 'descricao',
        preco: 10.5,
        composicao: [
          [produtoEstoque.id, 2],
          [produtoEstoque2.id, 5],
        ],
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(201);

      expect(body.id).toBeDefined();
      expect(body.idUsuario).toEqual(dados.idUsuario);
      expect(body.nomeProduto).toEqual(dados.nomeProduto);
      expect(body.categoria).toEqual(dados.categoria);
      expect(body.descricao).toEqual(dados.descricao);
      expect(body.preco).toEqual(dados.preco);
      expect(body.composicao).toEqual(dados.composicao);

      //para teste do GetProdutos
      produtosCadastrados.push(body);
    });

    it('Erro ao não estar logado - 401', async () => {
      const dados = {
        idUsuario: usuarioTeste.idUsuario,
        nomeProduto: 'nomeProduto2',
        categoria: 'bebidas2',
        descricao: 'descricao2',
        preco: 20,
        composicao: [
          [produtoEstoque.id, 2],
          [produtoEstoque2.id, 4],
        ],
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(dados)
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de dados inválidos (filtro) - 400', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send({})
        .expect(400);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroDadosInvalidos(rota)),
      );
      expect(body.errors).toBeDefined();
    });

    it('Erro ao passar produto do estoque inválido - 422', async () => {
      const dados = {
        idUsuario: usuarioTeste.idUsuario,
        nomeProduto: 'nomeProduto2',
        categoria: 'bebidas',
        descricao: 'descricao2',
        preco: 20,
        composicao: [[randomUUID(), 2]],
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(422);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroLogico(rota)),
      );
    });

    it('Erro ao cadastrar para outro usuário - 403', async () => {
      const dados = {
        idUsuario: usuarioTeste.idUsuario,
        nomeProduto: 'nomeProduto2',
        categoria: 'bebidas',
        descricao: 'descricao2',
        preco: 20,
        composicao: [
          [produtoEstoque.id, 2],
          [produtoEstoque2.id, 4],
        ],
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send(dados)
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });
  });

  describe('POST atualizar', () => {
    let produtoRegistrado: ProdutoCardapio;
    let rota: string;

    beforeAll(async () => {
      produtoRegistrado = await auxiliar.gerarProdutoCardapioParaTeste(
        usuarioTeste.idUsuario,
        1,
      );
      rota = `/cardapio/${produtoRegistrado.id}`;
    });

    it('Dados válidos', async () => {
      const dados = {
        descricao: 'descricaoNova',
        nomeProduto: 'nomeProdutoNovo',
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(200);

      expect(body.id).toEqual(produtoRegistrado.id);
      expect(body.descricao).toEqual(dados.descricao);
      expect(body.nomeProduto).toEqual(dados.nomeProduto);
      expect(body.preco).toEqual(produtoRegistrado.preco);
      expect(body.categoria).toEqual(produtoRegistrado.categoria);
      expect(body.composicao).toEqual([
        ...produtoRegistrado.composicao.entries(),
      ]);
      expect(body.idUsuario).toEqual(produtoRegistrado.idUsuario);

      //para teste do GetProdutos
      produtosCadastrados.push(body);
    });

    it('Erro ao não estar logado - 401', async () => {
      const dados = {
        descricao: 'descricaoNova',
        nomeProduto: 'nomeProdutoNovo',
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .send(dados)
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de dados inválidos (filtro) - 400', async () => {
      const dados = {
        descricao: '',
        nomeProduto: '',
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(400);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroDadosInvalidos(rota)),
      );
      expect(body.errors).toBeDefined();
    });

    it('Erro de não localizar - 404', async () => {
      const dados = {
        descricao: 'descricaoNova',
        nomeProduto: 'nomeProdutoNovo',
      };

      const rotaTeste = `/cardapio/a`;
      const { body } = await request(auxiliar.httpServer)
        .put(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao passar produto do estoque inválido - 422', async () => {
      const dados = {
        composicao: [[randomUUID(), 2]],
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(422);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroLogico(rota)),
      );
    });

    it('Erro ao atualizar para outro usuário - 403', async () => {
      const dados = {
        descricao: 'descricaoNova',
        nomeProduto: 'nomeProdutoNovo',
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send(dados)
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });
  });

  describe('GET carregar produto', () => {
    let produtoRegistrado: ProdutoCardapio;
    let rota: string;

    beforeAll(async () => {
      produtoRegistrado = await auxiliar.gerarProdutoCardapioParaTeste(
        usuarioTeste.idUsuario,
        1,
      );
      rota = `/cardapio/${produtoRegistrado.id}`;
    });

    it('Carregamento válido', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(body.id).toEqual(produtoRegistrado.id);
      expect(body.descricao).toEqual(produtoRegistrado.descricao);
      expect(body.nomeProduto).toEqual(produtoRegistrado.nomeProduto);
      expect(body.preco).toEqual(produtoRegistrado.preco);
      expect(body.categoria).toEqual(produtoRegistrado.categoria);
      expect(body.composicao).toEqual([
        ...produtoRegistrado.composicao.entries(),
      ]);
      expect(body.idUsuario).toEqual(produtoRegistrado.idUsuario);

      //para teste do GetProdutos
      produtosCadastrados.push(body);
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de não localizar - 404', async () => {
      const rotaTeste = `/cardapio/a`;
      const { body } = await request(auxiliar.httpServer)
        .get(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao carregar de outro usuário - 403', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send()
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });
  });

  describe('GET carregar produtos', () => {
    const rota = '/cardapio';

    it('Carregamento válido', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(body.length).toEqual(3);
      expect(body).toEqual(produtosCadastrados);
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });
  });

  describe('DELETE remover', () => {
    let produtoRegistrado: ProdutoCardapio;
    let rota: string;

    beforeAll(async () => {
      produtoRegistrado = await auxiliar.gerarProdutoCardapioParaTeste(
        usuarioTeste.idUsuario,
        1,
      );
      rota = `/cardapio/${produtoRegistrado.id}`;
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .delete(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de não localizar - 404', async () => {
      const rotaTeste = '/cardapio/a';
      const { body } = await request(auxiliar.httpServer)
        .delete(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao remover de outro usuário - 403', async () => {
      const { body } = await request(auxiliar.httpServer)
        .delete(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send()
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });

    it('Remoção válida', async () => {
      await request(auxiliar.httpServer)
        .delete(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);
    });

    it('Erro ao remover produto em uso - 422', async () => {
      const { produtoCardapio } = await auxiliar.gerarPedidoParaTeste(
        usuarioTeste.idUsuario,
        1,
        1,
      );

      const rotaTeste = `/cardapio/${produtoCardapio.id}`;
      const { body } = await request(auxiliar.httpServer)
        .delete(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(422);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroLogico(rotaTeste)),
      );
    });
  });

  describe('GET emissor de eventos', () => {
    it.todo('Retorno válido');
    it.todo('Erro ao não estar logado - 401');
  });

  afterAll(async () => {
    await auxiliar.afterAll();
  });
});
