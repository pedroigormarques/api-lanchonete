import * as request from 'supertest';

import { UNIDADES } from './../../@core/dominio/enums/unidades.enum';
import { ProdutoEstoque } from './../../@core/dominio/produto-estoque.entity';
import { AuxiliadorTesteIntegracao } from './auxiliador-teste-integracao';
import { ErrosVerificacao } from './erros-verificacao';

describe('Estoque', () => {
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
    const rota = '/estoque';

    it('Cadastro válido', async () => {
      const dados = {
        descricao: 'descricao',
        nomeProduto: 'nomeProduto',
        quantidade: 10,
        unidade: 'L',
        idUsuario: usuarioTeste.idUsuario,
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(201);

      expect(body.id).toBeDefined();
      expect(body.descricao).toEqual(dados.descricao);
      expect(body.nomeProduto).toEqual(dados.nomeProduto);
      expect(body.quantidade).toEqual(dados.quantidade);
      expect(body.unidade).toEqual(dados.unidade);
      expect(body.idUsuario).toEqual(dados.idUsuario);

      //para teste do GetProdutos
      produtosCadastrados.push(body);
    });

    it('Erro ao não estar logado - 401', async () => {
      const dados = {
        descricao: 'descricao',
        nomeProduto: 'nomeProduto',
        quantidade: 10,
        unidade: 'L',
        idUsuario: usuarioTeste.idUsuario,
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

    it('Erro ao cadastrar para outro usuário - 403', async () => {
      const dados = {
        descricao: 'descricao2',
        nomeProduto: 'nomeProduto2',
        quantidade: 20,
        unidade: 'kg',
        idUsuario: usuarioTeste.idUsuario,
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
    let produtoRegistrado: ProdutoEstoque;
    let rota: string;

    beforeAll(async () => {
      produtoRegistrado = await auxiliar.gerarProdutoEstoqueParaTeste(
        usuarioTeste.idUsuario,
      );
      rota = `/estoque/${produtoRegistrado.id}`;
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
      expect(body.quantidade).toEqual(produtoRegistrado.quantidade);
      expect(body.unidade).toEqual(produtoRegistrado.unidade);
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
      };

      const rotaTeste = `/estoque/a`;
      const { body } = await request(auxiliar.httpServer)
        .put(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao atualizar unidade em uso - 422', async () => {
      const aux = await auxiliar.gerarProdutoCardapioParaTeste(
        usuarioTeste.idUsuario,
        1,
      );
      const idProdutoUsado = [...aux.composicao.keys()][0];
      const rotaTeste = `/estoque/${idProdutoUsado}`;

      const { body: produtoEstoque } = await request(auxiliar.httpServer)
        .get(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      const unidade =
        produtoEstoque.unidade === UNIDADES.L ? UNIDADES.ml : UNIDADES.L;
      const { body } = await request(auxiliar.httpServer)
        .put(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send({ unidade })
        .expect(422);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroLogico(rotaTeste)),
      );

      //para teste do GetProdutos
      produtosCadastrados.push(produtoEstoque);
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

  describe('Get carregar produto', () => {
    let produtoRegistrado: ProdutoEstoque;
    let rota: string;

    beforeAll(async () => {
      produtoRegistrado = await auxiliar.gerarProdutoEstoqueParaTeste(
        usuarioTeste.idUsuario,
      );
      rota = `/estoque/${produtoRegistrado.id}`;
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
      expect(body.quantidade).toEqual(produtoRegistrado.quantidade);
      expect(body.unidade).toEqual(produtoRegistrado.unidade);
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
      const rotaTeste = `/estoque/a`;
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

  describe('Get carregar produtos', () => {
    const rota = '/estoque';

    it('Carregamento válido', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(body.length).toEqual(4);
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
    let produtoRegistrado: ProdutoEstoque;
    let rota: string;

    beforeAll(async () => {
      produtoRegistrado = await auxiliar.gerarProdutoEstoqueParaTeste(
        usuarioTeste.idUsuario,
      );
      rota = `/estoque/${produtoRegistrado.id}`;
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
      const rotaTeste = '/estoque/a';
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
      const aux = await auxiliar.gerarProdutoCardapioParaTeste(
        usuarioTeste.idUsuario,
        1,
      );
      const idProdutoUsado = [...aux.composicao.keys()][0];

      const rotaTeste = `/estoque/${idProdutoUsado}`;
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
    //const rota = '/estoque/sse';

    it.todo('Retorno válido');

    it.todo('Erro ao não estar logado - 401');
  });

  afterAll(async () => {
    await auxiliar.afterAll();
  });
});
