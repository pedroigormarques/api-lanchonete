import { ErroDetalhado } from './exception-detalhado.error';

export class ForbiddenException extends ErroDetalhado {
  constructor(erros?: string | string[]) {
    super('Forbidden', 403, erros);
  }
}
