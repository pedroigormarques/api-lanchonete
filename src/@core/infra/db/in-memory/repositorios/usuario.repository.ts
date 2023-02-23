import { Usuario } from '../../../../dominio/usuario.entity';
import { IUsuarioRepository } from '../../../contratos/usuario.repository.interface';
import { UsuarioDB } from './../modelos/usuario.db-entity';

export class UsuarioRepositorio implements IUsuarioRepository {
  private usuarios = new Map<string, UsuarioDB>();

  async validarUsuario(email: string, senha: string): Promise<Usuario> {
    let usuario: UsuarioDB;
    this.usuarios.forEach((u) => {
      if (u.email === email) usuario = u;
    });

    if (usuario && usuario.senha === senha) {
      return usuario.paraUsuario();
    }
    return null;
  }

  async registrarUsuario(usuario: Usuario): Promise<Usuario> {
    this.validarEmail(usuario.email);

    const usuarioRegistrado = new UsuarioDB(usuario);
    const id = usuarioRegistrado.id;

    this.usuarios.set(id, usuarioRegistrado);
    return usuarioRegistrado.paraUsuario();
  }

  async atualizarUsuario(id: string, usuario: Usuario): Promise<Usuario> {
    const usuarioAtualizado = this.usuarios.get(id);

    if (!usuarioAtualizado) {
      throw new Error('usuário não encontrado');
    }

    if (usuario.email !== usuarioAtualizado.email)
      this.validarEmail(usuario.email);

    usuarioAtualizado.atualizarDadosBase(usuario);

    return usuarioAtualizado.paraUsuario();
  }

  async carregarUsuario(id: string): Promise<Usuario> {
    const usuario = this.usuarios.get(id);
    if (usuario) {
      return usuario.paraUsuario();
    }
    return null;
  }

  private validarEmail(email: string) {
    this.usuarios.forEach((usuarioDB) => {
      if (usuarioDB.email === email) {
        throw new Error('Email já cadastrado no sistema');
      }
    });
  }
}
