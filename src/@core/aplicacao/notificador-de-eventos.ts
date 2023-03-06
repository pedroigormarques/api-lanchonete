import { ReplaySubject } from 'rxjs';

import { TipoManipulacaoDado } from '../dominio/enums/tipo-manipulacao-dado.enum';
import { Evento } from '../dominio/notificacao.entity';
import { Notificacao } from './../dominio/notificacao.entity';

type itemDoBancoDeDados = {
  id?: string;
};

export class NotificadorDeEventos<T extends itemDoBancoDeDados> {
  private eventsSubjects = new Map<string, ReplaySubject<Evento<T>>>();
  private funcaoColetaDadosIniciais: (idUsuario: string) => Promise<T[]>;

  async abrirConexao(idUsuario: string) {
    if (!this.eventsSubjects.has(idUsuario)) {
      this.eventsSubjects.set(idUsuario, new ReplaySubject<Evento<T>>());
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
    const evento = {
      type: tipo,
      data: [new Notificacao(tipo, id, dado)],
    };
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
      alteracoes.push(new Notificacao<T>(tipo, id, dados?.at(index)));
    });
    const evento = { type: tipo, data: alteracoes };
    this.emitirAlteracao(idUsuario, evento);
  }

  protected configurarFuncaoColetaDados(
    funcaoColeta: (idUsuario: string) => Promise<T[]>,
  ): void {
    this.funcaoColetaDadosIniciais = funcaoColeta;
  }

  private emitirAlteracao(idUsuario: string, evento: Evento<T>): void {
    if (this.eventsSubjects.has(idUsuario))
      this.eventsSubjects.get(idUsuario).next(evento);
  }

  private async carregarDadosIniciais(idUsuario: string) {
    if (typeof this.funcaoColetaDadosIniciais === 'undefined') {
      throw new Error(
        'O notificador não recebeu uma configuração correta para começar a ser utilizada',
      );
    }
    const dadosIniciais = await this.funcaoColetaDadosIniciais(idUsuario);
    if (dadosIniciais.length !== 0)
      //adiciona os dados na memória
      this.emitirAlteracaoConjuntoDeDados(
        idUsuario,
        TipoManipulacaoDado.Adicionado,
        dadosIniciais.map((dado) => dado.id),
        dadosIniciais,
      );
  }
}
