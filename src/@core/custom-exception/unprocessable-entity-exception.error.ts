import { ErroDetalhado } from './exception-detalhado.error';

export class UnprocessableEntityException extends ErroDetalhado {
  constructor(erros?: string | string[]) {
    super('Unprocessable Entity', 422, erros);
  }
}
