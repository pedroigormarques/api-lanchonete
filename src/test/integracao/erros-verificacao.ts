export class ErrosVerificacao {
  static erroAutenticacao(rota: string) {
    return {
      statsCode: 401,
      path: rota,
      message: 'Unauthorized',
    };
  }

  static erroDadosInvalidos(rota: string) {
    return {
      statsCode: 400,
      path: rota,
      message: 'Bad Request Exception', //----------------------------------
    };
  }

  static erroProibido(rota: string) {
    return {
      statsCode: 403,
      path: rota,
      message: 'Forbidden',
    };
  }

  static erroLogico(rota: string) {
    return {
      statsCode: 422,
      path: rota,
      message: 'Unprocessable Entity',
    };
  }

  static erroNaoEncontrado(rota: string) {
    return {
      statsCode: 404,
      path: rota,
      message: 'Not Found',
    };
  }
}
