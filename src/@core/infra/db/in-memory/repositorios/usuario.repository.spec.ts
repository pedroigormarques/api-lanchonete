import { GeradorObjetos as GeradorDeObjetos } from './../../../../../../test/gerador-objetos.faker';
import { Usuario } from './../../../../dominio/usuario.entity';
import { UsuarioDB } from './../modelos/usuario.db-entity';
import { UsuarioRepositorio } from './usuario.repository';

describe('Usuario Repositorio', () => {
  let usuarioRepositorio: UsuarioRepositorio;
  let usuario1: Usuario;

  beforeEach(() => {
    usuarioRepositorio = new UsuarioRepositorio();

    //registrando ao menos um usuario antes de cada grupo de testes para os testes de validação, update e carregamento
    usuario1 = registrarUsuarioDeTeste(usuarioRepositorio);
  });

  it('Instanciado', () => {
    expect(usuarioRepositorio).toBeDefined();
  });

  describe('Validar Usuario', () => {
    it('Retorno de usuário ao inserir dados válido', async () => {
      const { email, senha } = usuario1;

      const resposta = await usuarioRepositorio.validarUsuario(email, senha);

      const esperado = { ...usuario1 };
      delete esperado.senha;

      expect(resposta).toBeInstanceOf(Usuario);
      expect(resposta).toEqual(esperado);
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
      expect(resposta.id).toBeDefined();
      expect(resposta.senha).toBeUndefined();
    });
    it('Erro ao passar dados insuficientes', async () => {
      const usuario = new Usuario();

      await expect(
        usuarioRepositorio.registrarUsuario(usuario),
      ).rejects.toThrowError();
    });

    it('Erro ao passar um email já cadastrado', async () => {
      const usuario = GeradorDeObjetos.criarUsuario();
      usuario.email = usuario1.email;

      await expect(
        usuarioRepositorio.registrarUsuario(usuario),
      ).rejects.toThrowError();
    });
  });

  describe('Atualizar Usuario', () => {
    it('Retorno de usuario atualizado com os dados passados', async () => {
      const usuarioComDadosNovos = { ...usuario1 };

      usuarioComDadosNovos.email = 'teste@teste.com';

      const resposta = await usuarioRepositorio.atualizarUsuario(
        usuarioComDadosNovos.id,
        usuarioComDadosNovos,
      );

      const esperado = { ...usuarioComDadosNovos };
      delete esperado.senha;
      expect(resposta).toEqual(esperado);
    });

    it('Erro ao passar id de usuario inválido', async () => {
      await expect(
        usuarioRepositorio.atualizarUsuario('a', usuario1),
      ).rejects.toThrowError();
    });

    it('Erro ao tentar atualizar com outro email em uso', async () => {
      const usuario2 = registrarUsuarioDeTeste(usuarioRepositorio);
      usuario2.email = usuario1.email;

      await expect(
        usuarioRepositorio.atualizarUsuario(usuario2.id, usuario2),
      ).rejects.toThrowError();
    });
  });

  describe('Carregar Usuario', () => {
    it('Retorno de usuario ao passar id válido', async () => {
      const resposta = await usuarioRepositorio.carregarUsuario(usuario1.id);

      const esperado = { ...usuario1 };
      delete esperado.senha;
      expect(resposta).toEqual(esperado);
    });

    it('Erro ao passar id de usuario inválido', async () => {
      await expect(
        usuarioRepositorio.carregarUsuario('a'),
      ).rejects.toThrowError();
    });
  });
});

function registrarUsuarioDeTeste(usuarioRepositorio: UsuarioRepositorio) {
  const usuarioTeste = GeradorDeObjetos.criarUsuario();
  const usuarioBanco = new UsuarioDB(usuarioTeste);
  usuarioTeste.id = usuarioBanco.id;

  (usuarioRepositorio as any).usuarios //pela quebra de proteção "private"
    .set(usuarioBanco.id, usuarioBanco);
  return usuarioTeste;
}
