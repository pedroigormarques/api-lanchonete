import { IUsuarioRepository } from '../infra/contratos/usuario.repository.interface';
import { DadosBaseUsuario, Usuario } from './../dominio/usuario.entity';

export class UsuarioService {
  constructor(private usuarioRepositorio: IUsuarioRepository) {}

  async validarUsuario(email: string, senha: string) {
    return await this.usuarioRepositorio.validarUsuario(email, senha);
  }

  async registrarUsuario(dadosUsuario: DadosBaseUsuario) {
    const usuario = new Usuario(dadosUsuario);

    return await this.usuarioRepositorio.registrarUsuario(usuario);
  }

  async atualizarUsuario(
    idUsuario: string,
    dadosUsuario: Partial<DadosBaseUsuario>,
  ) {
    const usuario = await this.usuarioRepositorio.carregarUsuario(idUsuario);

    usuario.atualizarDados(dadosUsuario);

    return await this.usuarioRepositorio.atualizarUsuario(idUsuario, usuario);
  }
}
