import { tipoManipulacaoDado } from './enums/tipo-manipulacao-dado.enum';

export class DocChangeEvent<T> {
  constructor(
    public acao: tipoManipulacaoDado,
    public id?: string,
    public data?: T,
  ) {}
}
