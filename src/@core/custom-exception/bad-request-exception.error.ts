import { ErroDetalhado } from './exception-detalhado.error';

export class BadRequestException extends ErroDetalhado {
  constructor(erros?: string | string[]) {
    super('Bad Request', 400, erros);
  }
}
