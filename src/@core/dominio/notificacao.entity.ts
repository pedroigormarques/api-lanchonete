import { TipoManipulacaoDado } from './enums/tipo-manipulacao-dado.enum';

export interface Evento<T> {
  type: string;
  data: Notificacao<T>[];
}

export class Notificacao<T> {
  constructor(
    public acao: TipoManipulacaoDado,
    public id: string,
    public data?: T,
  ) {}
}
