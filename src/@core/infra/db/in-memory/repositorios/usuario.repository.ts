import { Usuario } from '../../../../dominio/usuario.entity';
import { IUsuarioRepository } from '../../../contratos/usuario.repository.interface';
import { NotFoundException } from './../../../../custom-exception/not-found-exception.error';
import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';
import { UsuarioDB } from './../modelos/usuario.db-entity';

export class UsuarioRepository implements IUsuarioRepository {
  private usuarios = new Map<string, UsuarioDB>();

  async validarUsuario(email: string, senha: string): Promise<Usuario> {
    let usuario: UsuarioDB;
    this.usuarios.forEach((u) => {
      if (u.email === email) usuario = u;
    });

    if (usuario && usuario.senha === senha) {
      return new Usuario(usuario);
    }
    return null;
  }

  async registrarUsuario(usuario: Usuario): Promise<Usuario> {
    this.validarEmail(usuario.email);

    const usuarioRegistrado = new UsuarioDB(usuario);
    const id = usuarioRegistrado.id;

    this.usuarios.set(id, usuarioRegistrado);
    return new Usuario(usuarioRegistrado);
  }

  async atualizarUsuario(id: string, usuario: Usuario): Promise<Usuario> {
    const usuarioAtualizado = this.usuarios.get(id);

    if (!usuarioAtualizado) {
      throw new NotFoundException('Usuário não encontrado');
    }

    usuario.verificarSeDadosSaoValidosOuErro();

    if (usuario.email !== usuarioAtualizado.email)
      this.validarEmail(usuario.email);

    usuarioAtualizado.atualizarDadosBase(usuario);

    return new Usuario(usuarioAtualizado);
  }

  async carregarUsuario(id: string): Promise<Usuario> {
    const usuario = this.usuarios.get(id);
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return new Usuario(usuario);
  }

  private validarEmail(email: string) {
    this.usuarios.forEach((usuarioDB) => {
      if (usuarioDB.email === email) {
        throw new UnprocessableEntityException(
          'Email já cadastrado no sistema',
        );
      }
    });
  }
}
