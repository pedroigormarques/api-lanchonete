import { ForbiddenException } from '@nestjs/common';

export class VerificadorDeAutorizacao {
  static verificarAutorização(
    idUsuario: string,
    dadoAutorizado: { idUsuario: string },
  ) {
    if (dadoAutorizado.idUsuario !== idUsuario) {
      throw this.erroAutorizacao();
    }
  }

  static erroAutorizacao() {
    return new ForbiddenException();
  }
}
