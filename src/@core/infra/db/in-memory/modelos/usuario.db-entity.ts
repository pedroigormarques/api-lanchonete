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
      typeof usuario.nomeLanchonete !== 'string' ||
      typeof usuario.email !== 'string' ||
      typeof usuario.senha !== 'string' ||
      typeof usuario.endereco !== 'string'
    ) {
      throw new Error('Dados insuficientes');
    }
  }

  atualizarDadosBase(usuario: Usuario): void {
    if (typeof usuario.email === 'string') this.email = usuario.email;
    if (typeof usuario.senha === 'string') this.senha = usuario.senha;
    if (typeof usuario.endereco === 'string') this.endereco = usuario.endereco;
    if (typeof usuario.nomeLanchonete === 'string')
      this.nomeLanchonete = usuario.nomeLanchonete;
  }

  paraUsuario(): Usuario {
    return criarObjetoComCopiaProfunda<UsuarioDB, Usuario>(this, Usuario, [
      'senha',
    ]);
  }
}
