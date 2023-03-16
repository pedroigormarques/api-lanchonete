import { ErroDetalhado } from './exception-detalhado.error';

export class UnauthorizedException extends ErroDetalhado {
  constructor(erros?: string | string[]) {
    super('Unauthorized', 401, erros);
  }
}
