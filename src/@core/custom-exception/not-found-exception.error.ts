import { ErroDetalhado } from './exception-detalhado.error';

export class NotFoundException extends ErroDetalhado {
  constructor(erros?: string | string[]) {
    super('Not Found', 404, erros);
  }
}
