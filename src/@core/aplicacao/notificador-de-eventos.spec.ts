import { Evento } from './../dominio/notificacao.entity';
import { Test } from '@nestjs/testing';
import { Observable, ReplaySubject } from 'rxjs';

import { TipoManipulacaoDado } from './../dominio/enums/tipo-manipulacao-dado.enum';
import { NotificadorDeEventos } from './notificador-de-eventos';

type tipoTeste = { id?: string; valor: number };

describe('Notificador de Eventos', () => {
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

  describe('Configurar Funcao de Coleta Dados', () => {
    it('Gravando corretamente a função', async () => {
      const dadosTeste: Array<tipoTeste> = [
        { id: 'a', valor: 1 },
        { id: 'b', valor: 2 },
        { id: 'c', valor: 3 },
      ];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async function funcaoTeste(idTeste: string): Promise<Array<tipoTeste>> {
        return dadosTeste;
      }

      expect(
        (notificadorDeEventos as any).funcaoColetaDadosIniciais,
      ).toBeUndefined();

      (notificadorDeEventos as any).configurarFuncaoColetaDados(funcaoTeste);

      expect(
        (notificadorDeEventos as any).funcaoColetaDadosIniciais,
      ).toBeDefined();
      expect((notificadorDeEventos as any).funcaoColetaDadosIniciais).toEqual(
        funcaoTeste,
      );

      const resultadoFuncao = await (
        notificadorDeEventos as any
      ).funcaoColetaDadosIniciais();
      expect(resultadoFuncao).toEqual(dadosTeste);
    });
  });

  describe('carregarDadosIniciais', () => {
    const idUsuario = 'teste';
    let subject: ReplaySubject<Evento<tipoTeste>>;
    beforeEach(() => {
      subject = new ReplaySubject<Evento<tipoTeste>>();
      (notificadorDeEventos as any).eventsSubjects.set(idUsuario, subject);
    });

    it('Carregar dados para ser obtidos assim que abrirem uma conexão', async () => {
      const dadosTeste: Array<tipoTeste> = [
        { id: 'a', valor: 1 },
        { id: 'b', valor: 2 },
        { id: 'c', valor: 3 },
      ];

      async function funcaoTeste(idTeste: string): Promise<Array<tipoTeste>> {
        if (idTeste === idUsuario) return dadosTeste;
        else return [];
      }
      (notificadorDeEventos as any).funcaoColetaDadosIniciais = funcaoTeste;

      await (notificadorDeEventos as any).carregarDadosIniciais(idUsuario);

      const conexao = subject.asObservable();
      let enviosFeito = 0;
      conexao
        .subscribe({
          next(value) {
            const dadosRecebidos = value.data.map((n) => n.data);
            expect(dadosRecebidos).toEqual(dadosTeste);
            enviosFeito++;
          },
        })
        .unsubscribe();

      expect(enviosFeito).toEqual(1);
    });

    it('Erro caso não tenha sido configurado o notificador após a construção', async () => {
      await expect(
        (notificadorDeEventos as any).carregarDadosIniciais(idUsuario),
      ).rejects.toThrowError();
    });
  });

  describe('Abrir Conexao', () => {
    const idUsuario = 'teste';
    const dadosTeste: Array<tipoTeste> = [
      { id: 'a', valor: 1 },
      { id: 'b', valor: 2 },
      { id: 'c', valor: 3 },
    ];

    beforeEach(() => {
      async function funcaoTeste(idTeste: string): Promise<Array<tipoTeste>> {
        if (idTeste === idUsuario) return dadosTeste;
        else return [];
      }
      (notificadorDeEventos as any).funcaoColetaDadosIniciais = funcaoTeste;
    });

    it('Abrir uma nova conexão para um usuário ainda não utilizado', async () => {
      expect(
        (notificadorDeEventos as any).eventsSubjects.has(idUsuario),
      ).toBeFalsy();

      const observable = await notificadorDeEventos.abrirConexao(idUsuario);

      expect(
        (notificadorDeEventos as any).eventsSubjects.has(idUsuario),
      ).toBeTruthy();

      expect(observable).toBeInstanceOf(Observable);
      observable.subscribe({
        next(value) {
          const dadosRecebidos = value.data.map((n) => n.data);
          expect(dadosRecebidos).toEqual(dadosTeste);
        },
      });
    });

    it('Abrir uma nova conexão para um usuário sendo utilizado', async () => {
      (notificadorDeEventos as any).eventsSubjects.set(
        idUsuario,
        new ReplaySubject<Evento<tipoTeste>>(),
      );

      const observable = await notificadorDeEventos.abrirConexao(idUsuario);

      expect(observable).toBeInstanceOf(Observable);
      observable.subscribe({
        next(value) {
          const dadosRecebidos = value.data.map((n) => n.data);
          expect(dadosRecebidos).toEqual(dadosTeste);
        },
      });
    });
  });

  describe('emitirAlteracaoItem', () => {
    const idTeste = 'teste';
    let subject: ReplaySubject<Evento<tipoTeste>>;
    beforeEach(() => {
      subject = new ReplaySubject<Evento<tipoTeste>>();
      (notificadorDeEventos as any).eventsSubjects.set(idTeste, subject);
    });

    it('Emitir notificação de adição', async () => {
      const dados = { id: 'a', valor: 1 };

      const conexao: Observable<Evento<tipoTeste>> = subject.asObservable();

      const eventosRecebidos = [] as Evento<tipoTeste>[];
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

      notificadorDeEventos.emitirAlteracaoItem(
        idTeste,
        TipoManipulacaoDado.Adicionado,
        dados.id,
        dados,
      );

      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos[0].data[0].id).toEqual(dados.id);
      expect(eventosRecebidos[0].data[0].data).toEqual(dados);
      expect(eventosRecebidos[0].data[0].acao).toEqual('Adicionado');

      inscricao.unsubscribe();
    });

    it('Emitir notificação de atualização', async () => {
      const dados = { id: 'b', valor: 2 };

      const conexao: Observable<Evento<tipoTeste>> = subject.asObservable();

      const eventosRecebidos = [] as Evento<tipoTeste>[];
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

      notificadorDeEventos.emitirAlteracaoItem(
        idTeste,
        TipoManipulacaoDado.Alterado,
        dados.id,
        dados,
      );
      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos[0].data[0].id).toEqual(dados.id);
      expect(eventosRecebidos[0].data[0].data).toEqual(dados);
      expect(eventosRecebidos[0].data[0].acao).toEqual('Alterado');

      inscricao.unsubscribe();
    });

    it('Emitir notificação de remoção', async () => {
      const conexao: Observable<Evento<tipoTeste>> = subject.asObservable();

      const eventosRecebidos = [] as Evento<tipoTeste>[];
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

      notificadorDeEventos.emitirAlteracaoItem(
        idTeste,
        TipoManipulacaoDado.Removido,
        'c',
      );

      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos[0].data[0].id).toEqual('c');
      expect(eventosRecebidos[0].data[0].acao).toEqual('Removido');

      inscricao.unsubscribe();
    });
  });

  describe('emitirAlteracaoConjuntoDeDados', () => {
    it('Emitir vários dados de alteração/adição em uma notificação', async () => {
      const idTeste = 'teste';
      const dados: Array<tipoTeste> = [
        { id: 'a', valor: 1 },
        { id: 'b', valor: 2 },
        { id: 'c', valor: 3 },
      ];

      const subject = new ReplaySubject<Evento<tipoTeste>>();
      (notificadorDeEventos as any).eventsSubjects.set(idTeste, subject);

      const conexao: Observable<Evento<tipoTeste>> = subject.asObservable();

      const eventosRecebidos: Evento<tipoTeste>[] = [];
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

      notificadorDeEventos.emitirAlteracaoConjuntoDeDados(
        idTeste,
        TipoManipulacaoDado.Alterado,
        dados.map((dado) => dado.id),
        dados,
      );

      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos[0].data.length).toEqual(3);

      eventosRecebidos[0].data.forEach((notificacao, index) => {
        expect(notificacao.acao).toEqual(TipoManipulacaoDado.Alterado);
        expect(notificacao.id).toEqual(dados[index].id);
        expect(notificacao.data).toEqual(dados[index]);
      });

      inscricao.unsubscribe();
    });

    it('Emitir vários dados de remoção em uma notificação', async () => {
      const idTeste = 'teste';
      const listaIds = ['a', 'b', 'c'];

      const subject = new ReplaySubject<Evento<tipoTeste>>();
      (notificadorDeEventos as any).eventsSubjects.set(idTeste, subject);

      const conexao: Observable<Evento<tipoTeste>> = subject.asObservable();

      const eventosRecebidos: Evento<tipoTeste>[] = [];
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

      notificadorDeEventos.emitirAlteracaoConjuntoDeDados(
        idTeste,
        TipoManipulacaoDado.Removido,
        listaIds,
      );

      expect(enviosFeito).toEqual(1);
      expect(eventosRecebidos.length).toEqual(1);
      expect(eventosRecebidos[0].data.length).toEqual(3);

      eventosRecebidos[0].data.forEach((notificacao, index) => {
        expect(notificacao.acao).toEqual(TipoManipulacaoDado.Removido);
        expect(notificacao.id).toEqual(listaIds[index]);
        expect(notificacao.data).toBeUndefined();
      });

      inscricao.unsubscribe();
    });

    it('Erro ao passar dados inconsistentes', async () => {
      const idTeste = 'teste';

      const subject = new ReplaySubject<Evento<tipoTeste>>();
      (notificadorDeEventos as any).eventsSubjects.set(idTeste, subject);

      expect(() =>
        notificadorDeEventos.emitirAlteracaoConjuntoDeDados(
          idTeste,
          TipoManipulacaoDado.Alterado,
          ['id1', 'id2'],
          [{ id: 'id1', valor: 1 } as tipoTeste],
        ),
      ).toThrowError();
    });
  });
});
