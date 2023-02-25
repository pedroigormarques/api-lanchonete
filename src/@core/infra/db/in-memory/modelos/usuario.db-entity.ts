import { randomUUID } from 'crypto';

import { Usuario } from './../../../../dominio/usuario.entity';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';

export class UsuarioDB extends Usuario {
  constructor(usuario: Usuario) {
    super();
    this.validarDadosCriacao(usuario);

    this.id = randomUUID();
    this.email = usuario.email;
    this.endereco = usuario.endereco;
    this.nomeLanchonete = usuario.nomeLanchonete;
    this.senha = usuario.senha;
  }

  private validarDadosCriacao(usuario: Usuario): void {
    if (
      !UsuarioDB.dadosGeraisValidos(usuario) ||
      typeof usuario.senha !== 'string'
    ) {
      throw new Error('Dados insuficientes/incorretos');
    }
  }

  static validarDadosAtualizacao(usuario: Usuario): void {
    if (
      (typeof usuario.senha !== 'string' &&
        typeof usuario.senha !== 'undefined') ||
      !UsuarioDB.dadosGeraisValidos(usuario)
    ) {
      throw new Error('Dados insuficientes/incorretos');
    }
  }

  private static dadosGeraisValidos(usuario: Usuario): boolean {
    return (
      typeof usuario.nomeLanchonete === 'string' &&
      typeof usuario.email === 'string' &&
      typeof usuario.endereco === 'string'
    );
  }

  atualizarDadosBase(usuario: Usuario): void {
    UsuarioDB.validarDadosAtualizacao(usuario);
    this.email = usuario.email;
    this.endereco = usuario.endereco;
    this.nomeLanchonete = usuario.nomeLanchonete;
    if (typeof usuario.senha === 'string') this.senha = usuario.senha;
  }

  paraUsuario(): Usuario {
    return criarObjetoComCopiaProfunda<UsuarioDB, Usuario>(this, Usuario, [
      'senha',
    ]);
  }
}
