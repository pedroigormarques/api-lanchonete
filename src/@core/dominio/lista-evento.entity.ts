import { DocChangeEvent } from './doc-change-event.entity';

export class ListaEvento<T> {
  alteracoes: DocChangeEvent<T>[];

  constructor(lista: DocChangeEvent<T>[]) {
    lista.forEach((evento) => {
      this.alteracoes.push(evento);
    });
  }
}
