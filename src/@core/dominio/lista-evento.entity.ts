import { DocChangeEvent } from './doc-change-event.entity';

export class ListaEvento<T> {
  alteracoes: DocChangeEvent<T>[];

  constructor(lista: DocChangeEvent<T>[]) {
    this.alteracoes = lista;
  }
}
