import { Test } from '@nestjs/testing';
import { Observable, Subscription } from 'rxjs';

import { ListaEvento } from '../dominio/lista-evento.entity';
import { DocChangeEvent } from './../dominio/doc-change-event.entity';
import { TipoManipulacaoDado } from './../dominio/enums/tipo-manipulacao-dado.enum';
import { NotificadorDeEventos } from './notificador-de-eventos';

type tipoTeste = { id?: string; valor: number };

describe('Usuario Service', () => {
  let notificadorDeEventos: NotificadorDeEventos<tipoTeste>;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: NotificadorDeEventos<tipoTeste>,
          useClass: NotificadorDeEventos<tipoTeste>,
        },
      ],
    }).compile();

    notificadorDeEventos = moduleRef.get<NotificadorDeEventos<tipoTeste>>(
      NotificadorDeEventos<tipoTeste>,
    );
  });

  it('instanciado', () => {
    expect(notificadorDeEventos).toBeDefined();
  });

  describe('abrirConexao', () => {
    it('Retorna um observable válido para se inscrever', () => {
      const observable = notificadorDeEventos.abrirConexao();

      expect(observable).toBeInstanceOf(Observable);
      const subscription = observable.subscribe();

      expect(subscription).toBeInstanceOf(Subscription);
    });
  });

  describe('emitirAlteracao', () => {
    it('Emitir notificações de adição', async () => {
      const dados1 = { id: 'a', valor: 1 };

      const conexao: Observable<ListaEvento<tipoTeste>> = (
        notificadorDeEventos as any
      ).eventsSubject.asObservable();

      const eventosRecebidos = [] as ListaEvento<tipoTeste>[];
      let enviosFeito = 0;

      const inscricao = conexao.subscribe({
        next(value) {
          eventosRecebidos.push(value);
          enviosFeito++;
        },
        error(error) {
          throw error;
        },
      });

      expect(enviosFeito).toEqual(0);
      expect(eventosRecebidos.length).toEqual(0);

      const evento1 = new ListaEvento<tipoTeste>([
        new DocChangeEvent(TipoManipulacaoDado.Adicionado, dados1.id, dados1),
      ]);
      notificadorDeEventos.emitirAlteracao(evento1);
      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos).toContainEqual(evento1);
      expect(eventosRecebidos[0].alteracoes[0].id).toEqual(dados1.id);
      expect(eventosRecebidos[0].alteracoes[0].data).toEqual(dados1);
      expect(eventosRecebidos[0].alteracoes[0].acao).toEqual('Adicionado');

      inscricao.unsubscribe();
    });

    it('Emitir notificações de atualização', async () => {
      const dados = { id: 'b', valor: 2 };

      const conexao: Observable<ListaEvento<tipoTeste>> = (
        notificadorDeEventos as any
      ).eventsSubject.asObservable();

      const eventosRecebidos = [] as ListaEvento<tipoTeste>[];
      let enviosFeito = 0;

      const inscricao = conexao.subscribe({
        next(value) {
          eventosRecebidos.push(value);
          enviosFeito++;
        },
        error(error) {
          throw error;
        },
      });

      expect(enviosFeito).toEqual(0);
      expect(eventosRecebidos.length).toEqual(0);

      const evento1 = new ListaEvento<tipoTeste>([
        new DocChangeEvent(TipoManipulacaoDado.Alterado, dados.id, dados),
      ]);
      notificadorDeEventos.emitirAlteracao(evento1);
      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos).toContainEqual(evento1);
      expect(eventosRecebidos[0].alteracoes[0].id).toEqual(dados.id);
      expect(eventosRecebidos[0].alteracoes[0].data).toEqual(dados);
      expect(eventosRecebidos[0].alteracoes[0].acao).toEqual('Alterado');

      inscricao.unsubscribe();
    });

    it('Emitir notificações de remoção', async () => {
      const conexao: Observable<ListaEvento<tipoTeste>> = (
        notificadorDeEventos as any
      ).eventsSubject.asObservable();

      const eventosRecebidos = [] as ListaEvento<tipoTeste>[];
      let enviosFeito = 0;

      const inscricao = conexao.subscribe({
        next(value) {
          eventosRecebidos.push(value);
          enviosFeito++;
        },
        error(error) {
          throw error;
        },
      });

      expect(enviosFeito).toEqual(0);
      expect(eventosRecebidos.length).toEqual(0);

      const evento = new ListaEvento<tipoTeste>([
        new DocChangeEvent(TipoManipulacaoDado.Removido, 'c'),
      ]);
      notificadorDeEventos.emitirAlteracao(evento);

      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos).toContainEqual(evento);
      expect(eventosRecebidos[0].alteracoes[0].id).toEqual('c');
      expect(eventosRecebidos[0].alteracoes[0].acao).toEqual('Removido');

      inscricao.unsubscribe();
    });
  });

  describe('carregarDadosIniciais', () => {
    it('Dados carregados com sucesso', async () => {
      const listaDadosIniciais = [] as tipoTeste[];

      listaDadosIniciais.push({ id: 'a', valor: 1 });
      listaDadosIniciais.push({ id: 'b', valor: 2 });
      (notificadorDeEventos as any).carregarDadosIniciais(listaDadosIniciais);

      const conexao: Observable<ListaEvento<tipoTeste>> = (
        notificadorDeEventos as any
      ).eventsSubject.asObservable();

      const dadosIniciaisRecebidos = [] as tipoTeste[];

      let enviosFeito = 0;

      conexao
        .subscribe({
          next(value) {
            value.alteracoes.forEach((a) =>
              dadosIniciaisRecebidos.push(a.data),
            );
            enviosFeito++;
          },
          error(error) {
            throw error;
          },
        })
        .unsubscribe();

      expect(enviosFeito).toEqual(1);
      expect(dadosIniciaisRecebidos).toEqual(listaDadosIniciais);
    });
  });
});
