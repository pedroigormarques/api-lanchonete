import { Test } from '@nestjs/testing';

import { GeradorDeObjetos } from './../../test/gerador-objetos.faker';
import { Usuario, DadosBaseUsuario } from './../dominio/usuario.entity';
import { UsuarioRepositorio } from './../infra/db/in-memory/repositorios/usuario.repository';
import { UsuarioService } from './usuario-service.use-case';

describe('Usuario Service', () => {
  let usuarioService: UsuarioService;
  let usuarioRespositorio: UsuarioRepositorio;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: UsuarioService,
          useFactory: (usuarioRepositorio: UsuarioRepositorio) =>
            new UsuarioService(usuarioRepositorio),
          inject: [UsuarioRepositorio],
        },
        {
          provide: UsuarioRepositorio,
          useClass: UsuarioRepositorio,
        },
      ],
    }).compile();

    usuarioRespositorio = moduleRef.get<UsuarioRepositorio>(UsuarioRepositorio);
    usuarioService = moduleRef.get<UsuarioService>(UsuarioService);
  });

  it('instanciado', () => {
    expect(usuarioRespositorio).toBeDefined();
    expect(usuarioService).toBeDefined();
  });

  describe('Validar Usuario', () => {
    it('Retorno de usuario com dados corretos', async () => {
      const emailSimulado = 'teste@teste.com';
      const senhaSimulada = 'teste';

      const usuarioRespondido = GeradorDeObjetos.criarUsuario(true);
      usuarioRespondido.email = emailSimulado;
      jest
        .spyOn(usuarioRespositorio, 'validarUsuario')
        .mockResolvedValue(usuarioRespondido);

      const resposta = await usuarioService.validarUsuario(
        emailSimulado,
        senhaSimulada,
      );

      expect(resposta).toBeInstanceOf(Usuario);
      expect(resposta.email).toEqual(emailSimulado);
    });

    it('Retornado null ao passar  dados incorretos', async () => {
      const email = 'teste@teste.com';
      const senha = 'teste';

      jest.spyOn(usuarioRespositorio, 'validarUsuario').mockResolvedValue(null);

      const resposta = await usuarioService.validarUsuario(email, senha);

      expect(resposta).toBeNull();
    });
  });

  describe('Registrar Usuario', () => {
    it('Retorno de usuario registrado ao passar dados corretos', async () => {
      const usuarioResposta = GeradorDeObjetos.criarUsuario(true);

      jest
        .spyOn(usuarioRespositorio, 'registrarUsuario')
        .mockResolvedValue(usuarioResposta);

      const dadosCriacao = {} as DadosBaseUsuario;
      dadosCriacao.email = usuarioResposta.email;
      dadosCriacao.senha = usuarioResposta.senha;
      dadosCriacao.nomeLanchonete = usuarioResposta.nomeLanchonete;
      dadosCriacao.endereco = usuarioResposta.endereco;

      const resposta = await usuarioService.registrarUsuario(dadosCriacao);

      expect(resposta).toBeInstanceOf(Usuario);
      expect(resposta.id).toBeDefined();
      expect(resposta.senha).toEqual(dadosCriacao.senha);
      expect(resposta.email).toEqual(dadosCriacao.email);
      expect(resposta.endereco).toEqual(dadosCriacao.endereco);
      expect(resposta.nomeLanchonete).toEqual(dadosCriacao.nomeLanchonete);
    });

    it('Erro ao passar dados insuficientes ou dados incorretos', async () => {
      jest
        .spyOn(usuarioRespositorio, 'registrarUsuario')
        .mockResolvedValue(null);

      await expect(
        usuarioService.registrarUsuario({} as DadosBaseUsuario),
      ).rejects.toThrowError();

      expect(usuarioRespositorio.registrarUsuario).toBeCalledTimes(0);
    });

    it('Erro ao passar email já utilizado', async () => {
      const usuarioAux = GeradorDeObjetos.criarUsuario(true);

      jest
        .spyOn(usuarioRespositorio, 'registrarUsuario')
        .mockImplementation(() => {
          throw new Error('Email já sendo utilizado');
        });

      const dadosCriacao = {} as DadosBaseUsuario;
      dadosCriacao.email = usuarioAux.email;
      dadosCriacao.senha = usuarioAux.senha;
      dadosCriacao.nomeLanchonete = usuarioAux.nomeLanchonete;
      dadosCriacao.endereco = usuarioAux.endereco;

      await expect(
        usuarioService.registrarUsuario(dadosCriacao),
      ).rejects.toThrowError();
      expect(usuarioRespositorio.registrarUsuario).toBeCalledTimes(1);
    });
  });

  describe('Atualizar Usuario', () => {
    it('Retorno de usuario atualizado ao passar alguns dados corretos', async () => {
      const usuarioBanco = GeradorDeObjetos.criarUsuario(true);

      jest
        .spyOn(usuarioRespositorio, 'carregarUsuario')
        .mockResolvedValue(usuarioBanco);

      jest
        .spyOn(usuarioRespositorio, 'atualizarUsuario')
        .mockImplementation(async (id, usuario) => new Usuario(usuario));

      const dadosAtualizacao = {
        email: 'teste@teste.com',
        nomeLanchonete: 'lanchonete',
      } as Partial<DadosBaseUsuario>;

      const resposta = await usuarioService.atualizarUsuario(
        usuarioBanco.id,
        dadosAtualizacao,
      );

      expect(resposta).toBeInstanceOf(Usuario);
      expect(resposta.id).toEqual(usuarioBanco.id);
      expect(resposta.senha).toEqual(usuarioBanco.senha);
      expect(resposta.endereco).toEqual(usuarioBanco.endereco);
      expect(resposta.email).toEqual(dadosAtualizacao.email);
      expect(resposta.nomeLanchonete).toEqual(dadosAtualizacao.nomeLanchonete);
    });

    it('Erro ao tentar atualizar id não existente', async () => {
      jest
        .spyOn(usuarioRespositorio, 'carregarUsuario')
        .mockImplementation(() => {
          throw new Error('Id nao encontrado');
        });
      jest
        .spyOn(usuarioRespositorio, 'atualizarUsuario')
        .mockResolvedValue(GeradorDeObjetos.criarUsuario());

      const dadosAtualizacao = {} as Partial<DadosBaseUsuario>;

      await expect(
        usuarioService.atualizarUsuario('a', dadosAtualizacao),
      ).rejects.toThrowError();

      expect(usuarioRespositorio.carregarUsuario).toBeCalledTimes(1);
      expect(usuarioRespositorio.atualizarUsuario).toBeCalledTimes(0);
    });

    it('Erro ao passar email já utilizado', async () => {
      const usuarioAux = GeradorDeObjetos.criarUsuario(true);
      const email = 'teste@TestScheduler.com';

      jest
        .spyOn(usuarioRespositorio, 'carregarUsuario')
        .mockResolvedValue(usuarioAux);

      jest
        .spyOn(usuarioRespositorio, 'atualizarUsuario')
        .mockImplementation(() => {
          throw new Error('Email já sendo utilizado');
        });

      const dadosAtualizacao = {} as Partial<DadosBaseUsuario>;
      dadosAtualizacao.email = email;

      await expect(
        usuarioService.atualizarUsuario(usuarioAux.id, dadosAtualizacao),
      ).rejects.toThrowError();
      expect(usuarioRespositorio.carregarUsuario).toBeCalledTimes(1);
      expect(usuarioRespositorio.atualizarUsuario).toBeCalledTimes(1);
    });
  });
});
