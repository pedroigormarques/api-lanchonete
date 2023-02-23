import { randomUUID } from 'crypto';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';
import { Usuario } from './../../../../dominio/usuario.entity';

export class UsuarioDB extends Usuario {
  constructor(usuario: Usuario) {
    super();
    this.validarDadosCriacao(usuario);

    this.id = randomUUID();
    this.atualizarDadosBase(usuario);
  }

  private validarDadosCriacao(usuario: Usuario): void {
    if (
      !usuario.nomeLanchonete ||
      !usuario.email ||
      !usuario.senha ||
      !usuario.endereco
    ) {
      throw new Error('Dados insuficientes');
    }
  }

  atualizarDadosBase(usuario: Usuario): void {
    if (usuario.email) this.email = usuario.email;
    if (usuario.senha) this.senha = usuario.senha;
    if (usuario.endereco) this.endereco = usuario.endereco;
    if (usuario.nomeLanchonete) this.nomeLanchonete = usuario.nomeLanchonete;
  }

  paraUsuario(): Usuario {
    return criarObjetoComCopiaProfunda<UsuarioDB, Usuario>(this, Usuario, [
      'senha',
    ]);
  }
}
