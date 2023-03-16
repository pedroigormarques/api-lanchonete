import { TipoManipulacaoDado } from './enums/tipo-manipulacao-dado.enum';

export interface Evento<T> {
  type: string;
  data: Notificacao<T>[];
}

export function isEvento(value: any): value is Evento<any> {
  return (
    typeof value?.type === 'string' &&
    value?.data instanceof Array &&
    value?.data[0] instanceof Notificacao
  );
}

export class Notificacao<T> {
  constructor(
    public acao: TipoManipulacaoDado,
    public id: string,
    public data?: T,
  ) {}
}
