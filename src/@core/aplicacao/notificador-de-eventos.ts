import { ReplaySubject } from 'rxjs';

import { TipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { ListaEvento } from '../dominio/lista-evento.entity';
import { Notificacao } from './../dominio/notificacao.entity';

type itemDoBancoDeDados = {
  id?: string;
};

export class NotificadorDeEventos<T extends itemDoBancoDeDados> {
  private eventsSubjects = new Map<string, ReplaySubject<ListaEvento<T>>>();
  private funcaoColetaDadosIniciais: (idUsuario: string) => Promise<T[]>;

  async abrirConexao(idUsuario: string) {
    if (!this.eventsSubjects.has(idUsuario)) {
      this.eventsSubjects.set(idUsuario, new ReplaySubject<ListaEvento<T>>());
      this.carregarDadosIniciais(idUsuario);
    }
    return this.eventsSubjects.get(idUsuario).asObservable();
  }

  emitirAlteracaoItem(
    idUsuario: string,
    tipo: TipoManipulacaoDado,
    id: string,
    dado?: T,
  ): void {
    const evento = new ListaEvento([new Notificacao(tipo, id, dado)]);
    this.emitirAlteracao(idUsuario, evento);
  }

  emitirAlteracaoConjuntoDeDados(
    idUsuario: string,
    tipo: TipoManipulacaoDado,
    listaIds: string[],
    dados?: T[],
  ) {
    if (dados && dados.length !== listaIds.length) {
      throw new Error('Conflito nos dados passados para gerar um evento');
    }
    const alteracoes = new Array<Notificacao<T>>();
    listaIds.forEach((id, index) => {
      alteracoes.push(new Notificacao<T>(tipo, id, dados[index]));
    });
    const evento = new ListaEvento(alteracoes);
    this.emitirAlteracao(idUsuario, evento);
  }

  protected configurarFuncaoColetaDados(
    funcaoColeta: (idUsuario: string) => Promise<T[]>,
  ): void {
    this.funcaoColetaDadosIniciais = funcaoColeta;
  }

  private emitirAlteracao(idUsuario: string, evento: ListaEvento<T>): void {
    this.eventsSubjects.get(idUsuario)?.next(evento);
  }

  private async carregarDadosIniciais(idUsuario: string) {
    const dadosIniciais = await this.funcaoColetaDadosIniciais(idUsuario);
    //adiciona os dados na memória
    this.emitirAlteracaoConjuntoDeDados(
      idUsuario,
      TipoManipulacaoDado.Adicionado,
      dadosIniciais.map((dado) => dado.id),
      dadosIniciais,
    );
  }
}
