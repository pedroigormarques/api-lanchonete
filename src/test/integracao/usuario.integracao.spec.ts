import * as request from 'supertest';

import { AuxiliadorTesteIntegracao } from './auxiliador-teste-integracao';
import { ErrosVerificacao } from './erros-verificacao';

describe('Usuario', () => {
  const auxiliar = new AuxiliadorTesteIntegracao();

  beforeAll(async () => {
    await auxiliar.beforeAll();
  });

  describe('POST registrar', () => {
    const rota = '/usuario/registrar';

    it('Registro válido', async () => {
      const usuario = {
        email: 'teste@gmail.com',
        senha: 'teste123',
        endereco: 'teste',
        nomeLanchonete: 'teste',
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(usuario)
        .expect(201);

      expect(body.id).toBeDefined();
      expect(body.senha).toBeUndefined();
      expect(body.email).toEqual(usuario.email);
      expect(body.endereco).toEqual(usuario.endereco);
      expect(body.nomeLanchonete).toEqual(usuario.nomeLanchonete);
    });

    it('Erro de dados inválidos (filtro) - 400', async () => {
      const usuario = {};

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(usuario)
        .expect(400);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroDadosInvalidos(rota)),
      );
      expect(body.errors).toBeDefined();
    });

    it('Erro de email já utilizado - 422', async () => {
      const usuario = {
        email: 'teste@gmail.com',
        senha: 'teste123',
        endereco: 'teste2',
        nomeLanchonete: 'teste2',
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(usuario)
        .expect(422);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroLogico(rota)),
      );
      expect(body.error).toEqual('Email já cadastrado no sistema');
    });
  });

  describe('POST logar', () => {
    const rota = '/usuario/entrar';

    it('Dados válido', async () => {
      const dados = {
        email: 'teste@gmail.com',
        senha: 'teste123',
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(dados)
        .expect(200);

      expect(body.token).toBeDefined();
      expect(body.usuario).toBeDefined();
    });

    it('Erro de dados inválidos (filtro) - 400', async () => {
      const usuario = {};

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(usuario)
        .expect(400);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroDadosInvalidos(rota)),
      );
      expect(body.errors).toBeDefined();
    });

    it('Erro de dados de login errados - 401', async () => {
      const dados = {
        email: 'teste@gmail.com',
        senha: 'teste1234',
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(dados)
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });
  });

  describe('PUT atualizar', () => {
    let usuarioTeste1: {
      token: string;
      idUsuario: string;
    };
    const rota = '/usuario/atualizar';

    beforeAll(async () => {
      usuarioTeste1 = await auxiliar.gerarUsuarioParaTeste();
    });

    it('Dados válidos', async () => {
      const dados = {
        endereco: 'testeNovo',
        nomeLanchonete: 'testeNovo',
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .auth(usuarioTeste1.token, { type: 'bearer' })
        .send(dados)
        .expect(200);

      expect(body.id).toBeDefined();
      expect(body.email).toBeDefined();
      expect(body.senha).toBeUndefined();
      expect(body.endereco).toEqual(dados.endereco);
      expect(body.nomeLanchonete).toEqual(dados.nomeLanchonete);
    });

    it('Erro de dados inválidos (filtro) - 400', async () => {
      const dados = {
        endereco: '',
        nomeLanchonete: '',
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .auth(usuarioTeste1.token, { type: 'bearer' })
        .send(dados)
        .expect(400);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroDadosInvalidos(rota)),
      );
      expect(body.errors).toBeDefined();
    });

    it('Erro ao não estar logado - 401', async () => {
      const dados = {
        endereco: 'testeNovo',
        nomeLanchonete: 'testeNovo',
      };

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .send(dados)
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de email já utilizado - 422', async () => {
      const emailRepetido = 'teste@gmail.com'; // usando o email passado no teste de registro

      const { body } = await request(auxiliar.httpServer)
        .put(rota)
        .auth(usuarioTeste1.token, { type: 'bearer' })
        .send({ email: emailRepetido })
        .expect(422);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroLogico(rota)),
      );
      expect(body.error).toEqual('Email já cadastrado no sistema');
    });
  });

  afterAll(async () => {
    await auxiliar.afterAll();
  });
});
