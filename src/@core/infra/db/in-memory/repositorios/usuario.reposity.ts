/* eslint-disable @typescript-eslint/no-unused-vars */
import { GetUsuarioDto } from 'src/@core/dominio/DTOs/get-usuario.dto';
import { Usuario } from 'src/@core/dominio/usuario.entity';
import { IUsuarioRepository } from 'src/@core/infra/contratos/usuario.repository.interface';

import { randomUUID } from 'crypto';
import { CreateUsuarioDto } from 'src/@core/dominio/DTOs/create-usuario.dto';
import { UpdateUsuarioDto } from 'src/@core/dominio/DTOs/update-usuario.dto';

export class UsuarioRepositorio implements IUsuarioRepository {
  private usuarios = new Map<string, Usuario>();

  async validarUsuario(email: string, senha: string): Promise<GetUsuarioDto> {
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

  async registrarUsuario(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<GetUsuarioDto> {
    const usuario = new Usuario();

    const id = randomUUID();

    usuario.id = id;
    usuario.email = createUsuarioDto.email;
    usuario.endereco = createUsuarioDto.endereco;
    usuario.nomeLanchonete = createUsuarioDto.nomeLanchonete;
    usuario.senha = createUsuarioDto.senha;

    this.usuarios.set(id, usuario);
    const { senha, ...result } = usuario;
    return result;
  }

  async atualizarUsuario(
    id: string,
    usuarioAtualizado: UpdateUsuarioDto,
  ): Promise<GetUsuarioDto> {
    const usuario = this.usuarios.get(id);

    if (!usuario) {
      throw new Error('usuário não encontrado');
    }

    if (usuarioAtualizado.email) usuario.email = usuarioAtualizado.email;
    if (usuarioAtualizado.senha) usuario.senha = usuarioAtualizado.senha;
    if (usuarioAtualizado.endereco)
      usuario.endereco = usuarioAtualizado.endereco;
    if (usuarioAtualizado.nomeLanchonete)
      usuario.nomeLanchonete = usuarioAtualizado.nomeLanchonete;

    const { senha, ...result } = usuario;
    return result;
  }
}
