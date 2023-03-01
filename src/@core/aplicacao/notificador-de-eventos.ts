import { ReplaySubject } from 'rxjs';
import { DocChangeEvent } from '../dominio/doc-change-event.entity';
import { TipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { ListaEvento } from '../dominio/lista-evento.entity';

type itemDoBancoDeDados = {
  id?: string;
};

export class NotificadorDeEventos<T extends itemDoBancoDeDados> {
  private eventsSubject = new ReplaySubject<ListaEvento<T>>();

  abrirConexao() {
    return this.eventsSubject.asObservable();
  }

  emitirAlteracao(evento: ListaEvento<T>) {
    return this.eventsSubject.next(evento);
  }

  protected carregarDadosIniciais(dadosIniciais: T[]) {
    //adiciona os dados na memória
    const listaItens = new Array<DocChangeEvent<T>>();
    dadosIniciais.forEach((item) => {
      listaItens.push(
        new DocChangeEvent<T>(TipoManipulacaoDado.Adicionado, item.id, item),
      );
    });
    const evento = new ListaEvento<T>(listaItens);
    this.emitirAlteracao(evento);
  }
}
