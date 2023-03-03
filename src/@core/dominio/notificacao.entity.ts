import { TipoManipulacaoDado } from './enums/tipo-manipulacao-dado.enum';

export class Notificacao<T> {
  constructor(
    public acao: TipoManipulacaoDado,
    public id: string,
    public data?: T,
  ) {}
}
