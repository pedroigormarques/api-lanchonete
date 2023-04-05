export class ErroDetalhado extends Error {
  statusCode: number;
  erros?: string | string[];

  constructor(tipoErro: string, statusCode: number, erros?: string | string[]) {
    super(tipoErro);
    this.statusCode = statusCode;
    if (typeof erros !== 'undefined') this.erros = erros;
  }
}
