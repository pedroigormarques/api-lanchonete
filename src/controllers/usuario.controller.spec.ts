import { Test } from '@nestjs/testing';

import { UsuarioService } from './../@core/aplicacao/usuario-service.use-case';
import { ErroDetalhado } from './../@core/custom-exception/exception-detalhado.error';
import { GeradorDeObjetos } from './../test/gerador-objetos.faker';
import { UsuarioController } from './usuario.controller';
import { CreateUsuarioDto, UpdateUsuarioDto } from './Validation/usuario.dto';

describe('Usuario Controller', () => {
  let usuarioService: UsuarioService;
  let usuariocontroller: UsuarioController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [UsuarioService],
    }).compile();

    usuarioService = moduleRef.get<UsuarioService>(UsuarioService);
    usuariocontroller = moduleRef.get<UsuarioController>(UsuarioController);
  });

  it('Instanciado', () => {
    expect(usuarioService).toBeDefined();
    expect(usuariocontroller).toBeDefined();
  });

  describe('Registrar Usuario', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarUsuario(true);

      const dadosCriacao = {} as CreateUsuarioDto;
      dadosCriacao.email = aux.email;
      dadosCriacao.endereco = aux.endereco;
      dadosCriacao.nomeLanchonete = aux.nomeLanchonete;
      dadosCriacao.senha = aux.senha;

      jest
        .spyOn(usuarioService, 'registrarUsuario')
        .mockResolvedValue(aux.gerarUsuarioDeRetorno());

      const resposta = await usuariocontroller.registrarUsuario(dadosCriacao);

      expect(usuarioService.registrarUsuario).toBeCalledTimes(1);
      expect(usuarioService.registrarUsuario).toBeCalledWith(dadosCriacao);

      expect(resposta).toEqual(aux.gerarUsuarioDeRetorno());
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarUsuario(true);

      const dadosCriacao = {} as CreateUsuarioDto;
      dadosCriacao.email = aux.email;
      dadosCriacao.endereco = aux.endereco;
      dadosCriacao.nomeLanchonete = aux.nomeLanchonete;
      dadosCriacao.senha = aux.senha;

      jest
        .spyOn(usuarioService, 'registrarUsuario')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        usuariocontroller.registrarUsuario(dadosCriacao),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });

  describe('Logar', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarUsuario(true);
      const dadosLogin = { email: aux.email, senha: aux.senha };

      jest.spyOn(usuarioService, 'logar').mockResolvedValue({
        token: 'token',
        usuario: aux.gerarUsuarioDeRetorno(),
      });

      const resposta = await usuariocontroller.logar(dadosLogin);

      expect(usuarioService.logar).toBeCalledTimes(1);
      expect(usuarioService.logar).toBeCalledWith(
        dadosLogin.email,
        dadosLogin.senha,
      );

      expect(resposta.token).toBeDefined();
      expect(resposta.usuario).toBeDefined();
      expect(resposta.usuario).toEqual(aux.gerarUsuarioDeRetorno());
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarUsuario(true);
      const dadosLogin = { email: aux.email, senha: aux.senha };

      jest
        .spyOn(usuarioService, 'logar')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(usuariocontroller.logar(dadosLogin)).rejects.toThrowError(
        ErroDetalhado,
      );
    });
  });

  describe('Atualizar Usuario', () => {
    it('Passando o valores recebidos e retornando corretamente', async () => {
      const aux = GeradorDeObjetos.criarUsuario(true);

      const dadosAtualizacao = {} as UpdateUsuarioDto;
      dadosAtualizacao.endereco = aux.endereco;
      dadosAtualizacao.nomeLanchonete = aux.nomeLanchonete;

      jest
        .spyOn(usuarioService, 'atualizarUsuario')
        .mockResolvedValue(aux.gerarUsuarioDeRetorno());

      const resposta = await usuariocontroller.atualizarUsuario(
        { user: { idUsuarioLogado: aux.id, email: aux.id } },
        dadosAtualizacao,
      );

      expect(usuarioService.atualizarUsuario).toBeCalledTimes(1);
      expect(usuarioService.atualizarUsuario).toBeCalledWith(
        aux.id,
        dadosAtualizacao,
      );

      expect(resposta).toEqual(aux.gerarUsuarioDeRetorno());
    });

    it('Caso ocorra um erro no servico', async () => {
      const aux = GeradorDeObjetos.criarUsuario(true);

      const dadosAtualizacao = {} as UpdateUsuarioDto;
      dadosAtualizacao.endereco = aux.endereco;
      dadosAtualizacao.nomeLanchonete = aux.nomeLanchonete;

      jest
        .spyOn(usuarioService, 'atualizarUsuario')
        .mockRejectedValue(erroDetalhadoGenerico());

      await expect(
        usuariocontroller.atualizarUsuario(
          { user: { idUsuarioLogado: aux.id, email: aux.id } },
          dadosAtualizacao,
        ),
      ).rejects.toThrowError(ErroDetalhado);
    });
  });
});

function erroDetalhadoGenerico() {
  return new ErroDetalhado('', 0, 'erro');
}
