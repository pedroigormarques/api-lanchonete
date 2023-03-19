import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { GeradorDeObjetos } from '../../../../../test/gerador-objetos.faker';
import { Usuario } from './../../../../dominio/usuario.entity';
import { UsuarioDB } from './../modelos/usuario.db-entity';
import { UsuarioRepository } from './usuario.repository';
import { BadRequestException } from './../../../../custom-exception/bad-request-exception.error';
import { NotFoundException } from './../../../../custom-exception/not-found-exception.error';
import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';

describe('Usuario Repositorio', () => {
  let usuarioRepositorio: UsuarioRepository;
  let usuario1: Usuario;
  let usuarioBanco1: UsuarioDB;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [UsuarioRepository],
    }).compile();

    usuarioRepositorio = moduleRef.get<UsuarioRepository>(UsuarioRepository);

    //registrando ao menos um usuario antes de cada teste para os testes de validação, update e carregamento
    const aux = await registrarUsuarioDeTeste(usuarioRepositorio);
    usuario1 = aux.usuarioTeste;
    usuarioBanco1 = aux.usuarioBanco;
  });

  it('Instanciado', () => {
    expect(usuarioRepositorio).toBeDefined();
  });

  describe('Validar Usuario', () => {
    it('Retorno de usuário ao inserir dados válido', async () => {
      const { email, senha } = usuario1;

      const resposta = await usuarioRepositorio.validarUsuario(email, senha);

      expect(resposta).toBeInstanceOf(Usuario);
      expect(resposta).toEqual(usuarioBanco1);
    });
    it('null ao não encontrar usuario com esses dados', async () => {
      const email = 'a@a.com';
      const senha = 'teste';

      const resposta = await usuarioRepositorio.validarUsuario(email, senha);

      expect(resposta).toBeNull();
    });
  });

  describe('Registrar Usuario', () => {
    it('Registro realizado com dados válidos', async () => {
      const usuarioTeste = GeradorDeObjetos.criarUsuario();
      const resposta = await usuarioRepositorio.registrarUsuario(usuarioTeste);

      expect(resposta).toBeInstanceOf(Usuario);
      expect(resposta.email).toEqual(usuarioTeste.email);
      expect(resposta.endereco).toEqual(usuarioTeste.endereco);
      expect(resposta.nomeLanchonete).toEqual(usuarioTeste.nomeLanchonete);
      expect(
        await bcrypt.compare(usuarioTeste.senha, resposta.senha),
      ).toBeTruthy();
      expect(resposta.id).toBeDefined();
    });

    it('Erro ao passar dados insuficientes', async () => {
      const usuario = new Usuario();

      await expect(
        usuarioRepositorio.registrarUsuario(usuario),
      ).rejects.toThrowError(BadRequestException);
    });

    it('Erro ao passar um email já cadastrado', async () => {
      const usuario = GeradorDeObjetos.criarUsuario();
      usuario.email = usuario1.email;

      await expect(
        usuarioRepositorio.registrarUsuario(usuario),
      ).rejects.toThrowError(UnprocessableEntityException);
    });
  });

  describe('Atualizar Usuario', () => {
    it('Retorno de usuario atualizado com os dados passados', async () => {
      const usuarioComDadosNovos = new Usuario(usuarioBanco1);

      usuarioComDadosNovos.email = 'teste@teste.com';

      const resposta = await usuarioRepositorio.atualizarUsuario(
        usuarioComDadosNovos.id,
        usuarioComDadosNovos,
      );

      expect(resposta).toEqual(usuarioComDadosNovos);
    });

    it('Retorno de usuario com senha atualizada', async () => {
      const usuarioComDadosNovos = new Usuario(usuarioBanco1);

      usuarioComDadosNovos.senha = 'senha123';

      const resposta = await usuarioRepositorio.atualizarUsuario(
        usuarioComDadosNovos.id,
        usuarioComDadosNovos,
      );

      const esperado = { ...usuarioComDadosNovos };
      delete esperado.senha;

      expect(resposta).toEqual(expect.objectContaining(esperado));
      expect(
        await bcrypt.compare(usuarioComDadosNovos.senha, resposta.senha),
      ).toBeTruthy();
    });

    it('Erro ao passar dados inválidos', async () => {
      const usuario = new Usuario();
      usuario.id = usuario1.id;

      const esperado = { ...usuarioBanco1 };

      await expect(
        usuarioRepositorio.atualizarUsuario(usuario.id, usuario),
      ).rejects.toThrowError(BadRequestException);

      expect((usuarioRepositorio as any).usuarios.get(usuario1.id)).toEqual(
        esperado,
      );
    });

    it('Erro ao passar id de usuario inválido', async () => {
      await expect(
        usuarioRepositorio.atualizarUsuario('a', usuario1),
      ).rejects.toThrowError(NotFoundException);
    });

    it('Erro ao tentar atualizar com outro email em uso', async () => {
      const { usuarioTeste, usuarioBanco } = await registrarUsuarioDeTeste(
        usuarioRepositorio,
      );
      const esperado = { ...usuarioBanco };
      usuarioTeste.email = usuario1.email;

      await expect(
        usuarioRepositorio.atualizarUsuario(usuarioTeste.id, usuarioTeste),
      ).rejects.toThrowError(UnprocessableEntityException);

      expect((usuarioRepositorio as any).usuarios.get(usuarioTeste.id)).toEqual(
        esperado,
      );
    });
  });

  describe('Carregar Usuario', () => {
    it('Retorno de usuario ao passar id válido', async () => {
      const resposta = await usuarioRepositorio.carregarUsuario(usuario1.id);

      expect(resposta).toEqual(usuarioBanco1);
    });

    it('Erro ao passar id de usuario inválido', async () => {
      await expect(
        usuarioRepositorio.carregarUsuario('a'),
      ).rejects.toThrowError(NotFoundException);
    });
  });
});

async function registrarUsuarioDeTeste(usuarioRepositorio: UsuarioRepository) {
  const usuarioTeste = GeradorDeObjetos.criarUsuario();
  const usuarioBanco = new UsuarioDB(usuarioTeste);
  const hash = await bcrypt.hash(
    usuarioTeste.senha,
    (usuarioRepositorio as any).saltRounds,
  );
  usuarioBanco.senha = hash;
  usuarioTeste.id = usuarioBanco.id;

  (usuarioRepositorio as any).usuarios //pela quebra de proteção "private"
    .set(usuarioBanco.id, usuarioBanco);
  return { usuarioTeste, usuarioBanco };
}
