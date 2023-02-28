import { TipoManipulacaoDado } from './enums/tipo-manipulacao-dado.enum';

export class DocChangeEvent<T> {
  constructor(
    public acao: TipoManipulacaoDado,
    public id?: string,
    public data?: T,
  ) {}
}
