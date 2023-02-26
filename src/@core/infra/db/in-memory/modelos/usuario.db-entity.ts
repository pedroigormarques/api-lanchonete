import { randomUUID } from 'crypto';

import { Usuario } from './../../../../dominio/usuario.entity';

export class UsuarioDB extends Usuario {
  constructor(usuario: Usuario) {
    super();
    usuario.verificarSeDadosSaoValidosOuErro();
    super.registrarDados({ id: randomUUID(), ...usuario });
  }

  atualizarDadosBase(usuario: Usuario): void {
    usuario.verificarSeDadosSaoValidosOuErro();
    super.registrarDados(usuario);
  }
}
