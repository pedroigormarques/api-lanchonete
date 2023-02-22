/* eslint-disable @typescript-eslint/no-unused-vars */
import { Usuario } from './../../../../dominio/usuario.entity';
import { IUsuarioRepository } from './../../../contratos/usuario.repository.interface';

import { randomUUID } from 'crypto';

export class UsuarioRepositorio implements IUsuarioRepository {
  private usuarios = new Map<string, Usuario>();

  async validarUsuario(email: string, senha: string): Promise<Usuario> {
    let usuario: Usuario;
    this.usuarios.forEach((u) => {
      if (u.email === email) usuario = u;
    });

    if (usuario && usuario.senha === senha) {
      const { senha, ...result } = usuario;
      return result;
    }
    return null;
  }

  async registrarUsuario(usuario: Usuario): Promise<Usuario> {
    const usuarioRegistrado = new Usuario();

    const id = randomUUID();

    usuarioRegistrado.id = id;
    usuarioRegistrado.email = usuario.email;
    usuarioRegistrado.endereco = usuario.endereco;
    usuarioRegistrado.nomeLanchonete = usuario.nomeLanchonete;
    usuarioRegistrado.senha = usuario.senha;

    this.usuarios.set(id, usuarioRegistrado);
    const { senha, ...result } = usuarioRegistrado;
    return result;
  }

  async atualizarUsuario(id: string, usuario: Usuario): Promise<Usuario> {
    const usuarioAtualizado = this.usuarios.get(id);

    if (!usuarioAtualizado) {
      throw new Error('usuário não encontrado');
    }

    if (usuario.email) usuarioAtualizado.email = usuario.email;
    if (usuario.senha) usuarioAtualizado.senha = usuario.senha;
    if (usuario.endereco) usuarioAtualizado.endereco = usuario.endereco;
    if (usuario.nomeLanchonete)
      usuarioAtualizado.nomeLanchonete = usuario.nomeLanchonete;

    const { senha, ...result } = usuarioAtualizado;
    return result;
  }

  async carregarUsuario(id: string): Promise<Usuario> {
    const usuario = this.usuarios.get(id);
    if (usuario) {
      const { senha, ...result } = this.usuarios.get(id);
      return result;
    }
    return null;
  }
}
