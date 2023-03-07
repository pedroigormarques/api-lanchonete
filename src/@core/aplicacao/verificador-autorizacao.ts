import { ForbiddenException } from './../custom-exception/forbidden-exception.error';

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
