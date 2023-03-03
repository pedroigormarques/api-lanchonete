import { Notificacao } from './notificacao.entity';

export class ListaEvento<T> {
  alteracoes: Notificacao<T>[];

  constructor(lista: Notificacao<T>[]) {
    this.alteracoes = lista;
  }
}
