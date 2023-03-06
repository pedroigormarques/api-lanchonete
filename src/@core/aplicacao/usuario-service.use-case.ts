import { UnauthorizedException } from '@nestjs/common';

import { IUsuarioRepository } from '../infra/contratos/usuario.repository.interface';
import { AutenticacaoService } from './../../autenticacao/autenticacao.service';
import { DadosBaseUsuario, Usuario } from './../dominio/usuario.entity';

export class UsuarioService {
  constructor(
    private usuarioRepositorio: IUsuarioRepository,
    private autenticacaoService: AutenticacaoService,
  ) {}

  async logar(email: string, senha: string) {
    const usuario = await this.usuarioRepositorio.validarUsuario(email, senha);

    if (!usuario) {
      throw new UnauthorizedException();
    }

    const { token } = await this.autenticacaoService.login(usuario);

    return { token: token, usuario: usuario.gerarUsuarioDeRetorno() };
  }

  async registrarUsuario(dadosUsuario: DadosBaseUsuario) {
    let usuario = new Usuario(dadosUsuario);

    usuario = await this.usuarioRepositorio.registrarUsuario(usuario);

    return usuario.gerarUsuarioDeRetorno();
  }

  async atualizarUsuario(
    idUsuario: string,
    dadosUsuario: Partial<DadosBaseUsuario>,
  ) {
    let usuario = await this.usuarioRepositorio.carregarUsuario(idUsuario);

    usuario.atualizarDados(dadosUsuario);

    usuario = await this.usuarioRepositorio.atualizarUsuario(
      idUsuario,
      usuario,
    );

    return usuario.gerarUsuarioDeRetorno();
  }
}
