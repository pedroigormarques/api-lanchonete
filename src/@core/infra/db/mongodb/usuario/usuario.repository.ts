import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';

import { NotFoundException } from './../../../../../@core/custom-exception/not-found-exception.error';
import { UnprocessableEntityException } from './../../../../custom-exception/unprocessable-entity-exception.error';
import { Usuario } from './../../../../dominio/usuario.entity';
import { IUsuarioRepository } from './../../../contratos/usuario.repository.interface';
import { UsuarioMongoDB } from './usuario.model';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(
    @InjectModel('Usuario')
    private readonly usuarioModel: Model<UsuarioMongoDB>,
  ) {}

  async validarUsuario(email: string, senha: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findOne({ email });

    if (usuario && usuario.senha === senha) {
      return this.gerarUsuario(usuario);
    }
    return null;
  }

  async registrarUsuario(usuario: Usuario): Promise<Usuario> {
    usuario.verificarSeDadosSaoValidosOuErro();
    const usuarioAux = new this.usuarioModel({
      ...usuario,
      _id: randomUUID(),
    });
    try {
      const usuarioRegistrado = await usuarioAux.save();
      return this.gerarUsuario(usuarioRegistrado);
    } catch (error) {
      if (error.code === 11000) {
        throw new UnprocessableEntityException(
          'Email já cadastrado no sistema',
        );
      }
      throw error;
    }
  }

  async atualizarUsuario(id: string, usuario: Usuario): Promise<Usuario> {
    let usuarioAtualizado = await this.usuarioModel.findById(id);

    if (!usuarioAtualizado) {
      throw new NotFoundException('Usuário não encontrado');
    }

    usuario.verificarSeDadosSaoValidosOuErro();

    usuarioAtualizado.email = usuario.email;
    usuarioAtualizado.senha = usuario.senha;
    usuarioAtualizado.endereco = usuario.endereco;
    usuarioAtualizado.nomeLanchonete = usuario.nomeLanchonete;

    try {
      usuarioAtualizado = await usuarioAtualizado.save();
      return this.gerarUsuario(usuarioAtualizado);
    } catch (error) {
      if (error.code === 11000) {
        throw new UnprocessableEntityException(
          'Email já cadastrado no sistema',
        );
      }
      throw error;
    }
  }

  async carregarUsuario(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.gerarUsuario(usuario);
  }

  private gerarUsuario(dados): Usuario {
    const usuario = new Usuario(dados);
    usuario.id = dados.id;
    return usuario;
  }
}
