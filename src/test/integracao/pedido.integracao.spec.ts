import { randomUUID } from 'crypto';
import * as request from 'supertest';

import { Pedido } from './../../@core/dominio/pedido.entity';
import { ProdutoCardapio } from './../../@core/dominio/produto-cardapio.entity';
import { AuxiliadorTesteIntegracao } from './auxiliador-teste-integracao';
import { ErrosVerificacao } from './erros-verificacao';

describe('Pedido', () => {
  const auxiliar = new AuxiliadorTesteIntegracao();
  let usuarioTeste: {
    token: string;
    idUsuario: string;
  };
  let tokenUsuario2: string;

  const pedidosCadastrados = []; //para teste do GetPedidos
  const pedidosFechadosCadastrados = []; //para teste do GetPedidosFechados

  beforeAll(async () => {
    await auxiliar.beforeAll();
    usuarioTeste = await auxiliar.gerarUsuarioParaTeste();
    const aux = await auxiliar.gerarUsuarioParaTeste();
    tokenUsuario2 = aux.token;
  });

  describe('POST abrir pedido', () => {
    const rota = '/pedidos';

    it('Cadastro válido', async () => {
      const dados = {
        idUsuario: usuarioTeste.idUsuario,
        mesa: 1,
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(201);

      expect(body.id).toBeDefined();
      expect(body.horaAbertura).toBeDefined();
      expect(body.idUsuario).toEqual(dados.idUsuario);
      expect(body.mesa).toEqual(dados.mesa);
      expect(body.valorConta).toEqual(0);
      expect(body.produtosVendidos).toEqual([]);

      //para teste do GetPedidos
      pedidosCadastrados.push(body);
    });

    it('Erro ao não estar logado - 401', async () => {
      const dados = {
        idUsuario: usuarioTeste.idUsuario,
        mesa: 2,
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(dados)
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de dados inválidos (filtro) - 400', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send({})
        .expect(400);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroDadosInvalidos(rota)),
      );
      expect(body.errors).toBeDefined();
    });

    it('Erro ao cadastrar para outro usuário - 403', async () => {
      const dados = {
        idUsuario: usuarioTeste.idUsuario,
        mesa: 2,
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send(dados)
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });
  });

  describe('POST atualizar item', () => {
    let produtoCardapioRegistrado: ProdutoCardapio;
    let pedidoRegistrado: Pedido;
    let rota: string;

    beforeAll(async () => {
      produtoCardapioRegistrado = await auxiliar.gerarProdutoCardapioParaTeste(
        usuarioTeste.idUsuario,
        1,
      );
      const aux = await auxiliar.gerarPedidoParaTeste(
        usuarioTeste.idUsuario,
        3,
      );
      pedidoRegistrado = aux.pedido;
      rota = `/pedidos/${pedidoRegistrado.id}`;
    });

    it('Dados válidos', async () => {
      const dados = {
        idProdutoCardapio: produtoCardapioRegistrado.id,
        novaQtd: 2,
      };

      const [IdProdEstoque, qtdProdEstoque] = [
        ...produtoCardapioRegistrado.composicao.entries(),
      ][0];

      const { body: itemEstoqueAnterior } = await request(auxiliar.httpServer)
        .get(`/estoque/${IdProdEstoque}`)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(200);

      expect(body.id).toEqual(pedidoRegistrado.id);
      expect(body.horaAbertura).toEqual(
        pedidoRegistrado.horaAbertura.toISOString(),
      );
      expect(body.idUsuario).toEqual(pedidoRegistrado.idUsuario);
      expect(body.mesa).toEqual(pedidoRegistrado.mesa);
      expect(body.valorConta).toEqual(
        dados.novaQtd * produtoCardapioRegistrado.preco,
      );
      expect(body.produtosVendidos).toEqual([
        [produtoCardapioRegistrado.id, dados.novaQtd],
      ]);

      const { body: itemEstoquePosterior } = await request(auxiliar.httpServer)
        .get(`/estoque/${IdProdEstoque}`)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(itemEstoquePosterior.quantidade).toEqual(
        itemEstoqueAnterior.quantidade - dados.novaQtd * qtdProdEstoque,
      );

      //para teste do GetPedidos
      pedidosCadastrados.push(body);
    });

    it('Erro ao não estar logado - 401', async () => {
      const dados = {
        idProdutoCardapio: produtoCardapioRegistrado.id,
        novaQtd: 5,
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send(dados)
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de dados inválidos (filtro) - 400', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send({})
        .expect(400);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroDadosInvalidos(rota)),
      );
      expect(body.errors).toBeDefined();
    });

    it('Erro de não localizar - 404', async () => {
      const dados = {
        idProdutoCardapio: produtoCardapioRegistrado.id,
        novaQtd: 5,
      };

      const rotaTeste = `/pedidos/a`;
      const { body } = await request(auxiliar.httpServer)
        .post(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao passar produto do cardapio inválido - 403', async () => {
      const dados = {
        idProdutoCardapio: randomUUID(),
        novaQtd: 5,
      };

      const rotaTeste = `/pedidos/a`;
      const { body } = await request(auxiliar.httpServer)
        .post(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send(dados)
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao atualizar para outro usuário - 403', async () => {
      const dados = {
        idProdutoCardapio: produtoCardapioRegistrado.id,
        novaQtd: 5,
      };

      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send(dados)
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });
  });

  describe('GET carregar pedido', () => {
    let pedidoRegistrado: Pedido;
    let rota: string;

    beforeAll(async () => {
      const aux = await auxiliar.gerarPedidoParaTeste(
        usuarioTeste.idUsuario,
        4,
      );
      pedidoRegistrado = aux.pedido;
      rota = `/pedidos/${pedidoRegistrado.id}`;
    });

    it('Carregamento válido', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(body.id).toEqual(pedidoRegistrado.id);
      expect(body.horaAbertura).toEqual(
        pedidoRegistrado.horaAbertura.toISOString(),
      );
      expect(body.idUsuario).toEqual(pedidoRegistrado.idUsuario);
      expect(body.mesa).toEqual(pedidoRegistrado.mesa);
      expect(body.valorConta).toEqual(pedidoRegistrado.valorConta);
      expect(body.produtosVendidos).toEqual([
        ...pedidoRegistrado.produtosVendidos.entries(),
      ]);

      //para teste do GetProdutos
      pedidosCadastrados.push(body);
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de não localizar - 404', async () => {
      const rotaTeste = `/pedidos/a`;
      const { body } = await request(auxiliar.httpServer)
        .get(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao carregar de outro usuário - 403', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send()
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });
  });

  describe('GET carregar pedidos', () => {
    const rota = '/pedidos';

    it('Carregamento válido', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(body.length).toEqual(3);
      expect(body).toEqual(pedidosCadastrados);
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });
  });

  describe('POST deletar', () => {
    let pedidoRegistrado: Pedido;
    let rota: string;

    beforeAll(async () => {
      const aux = await auxiliar.gerarPedidoParaTeste(
        usuarioTeste.idUsuario,
        5,
      );
      pedidoRegistrado = aux.pedido;
      rota = `/pedidos/${pedidoRegistrado.id}/deletar`;
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de não localizar - 404', async () => {
      const rotaTeste = '/pedidos/a/deletar';
      const { body } = await request(auxiliar.httpServer)
        .post(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao cancelar de outro usuário - 403', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send()
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });

    it('Remoção válida', async () => {
      await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);
    });
  });

  describe('GET emissor de eventos', () => {
    it.todo('Retorno válido');
    it.todo('Erro ao não estar logado - 401');
  });

  describe('POST fechar', () => {
    let pedidoRegistrado: Pedido;
    let produtoCardapio: ProdutoCardapio;
    const qtdProdCardConsumida = 2;
    let rota: string;

    beforeAll(async () => {
      const aux = await auxiliar.gerarPedidoParaTeste(
        usuarioTeste.idUsuario,
        6,
        qtdProdCardConsumida,
      );
      pedidoRegistrado = aux.pedido;
      produtoCardapio = aux.produtoCardapio;

      rota = `/pedidos/${pedidoRegistrado.id}/fechar`;
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });

    it('Erro de não localizar - 404', async () => {
      const rotaTeste = '/pedidos/a/fechar';
      const { body } = await request(auxiliar.httpServer)
        .post(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(404);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroNaoEncontrado(rotaTeste)),
      );
    });

    it('Erro ao tentar fechar pedido sem itens - 422', async () => {
      const { pedido } = await auxiliar.gerarPedidoParaTeste(
        usuarioTeste.idUsuario,
        6,
      );
      const rotaTeste = `/pedidos/${pedido.id}/fechar`;
      const { body } = await request(auxiliar.httpServer)
        .post(rotaTeste)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(422);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroLogico(rotaTeste)),
      );
      expect(body.error).toEqual(
        'O pedido nao possui itens. Para removê-lo, use a opção de deletar',
      );
    });

    it('Erro ao cancelar de outro usuário - 403', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(tokenUsuario2, { type: 'bearer' })
        .send()
        .expect(403);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroProibido(rota)),
      );
    });

    it('Fechamento válida', async () => {
      const { body } = await request(auxiliar.httpServer)
        .post(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(body.id).toBeDefined();
      expect(body.horaFechamento).toBeDefined();
      expect(body.idUsuario).toEqual(pedidoRegistrado.idUsuario);
      expect(body.mesa).toEqual(pedidoRegistrado.mesa);
      expect(body.valorConta).toEqual(pedidoRegistrado.valorConta);
      expect(body.horaAbertura).toEqual(
        pedidoRegistrado.horaAbertura.toISOString(),
      );

      expect(body.produtosVendidos.map((i) => i[0].id)).toEqual([
        ...pedidoRegistrado.produtosVendidos.keys(),
      ]);
      expect(body.produtosVendidos.map((i) => i[1])).toEqual([
        ...pedidoRegistrado.produtosVendidos.values(),
      ]);

      expect(body.produtosUtilizados.map((i) => i[0].id)).toEqual([
        ...produtoCardapio.composicao.keys(),
      ]);
      expect(body.produtosUtilizados.map((i) => i[1])).toEqual(
        [...produtoCardapio.composicao.values()].map(
          (necessario) => necessario * qtdProdCardConsumida,
        ),
      );

      //para teste do GetPedidosFechados
      pedidosFechadosCadastrados.push(body);
    });
  });

  describe('GET carregar pedidos fechados', () => {
    const rota = '/pedidosFechados';

    it('Carregamento válido', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .auth(usuarioTeste.token, { type: 'bearer' })
        .send()
        .expect(200);

      expect(body.length).toEqual(1);
      expect(body).toEqual(pedidosFechadosCadastrados);
    });

    it('Erro ao não estar logado - 401', async () => {
      const { body } = await request(auxiliar.httpServer)
        .get(rota)
        .send()
        .expect(401);

      expect(body).toEqual(
        expect.objectContaining(ErrosVerificacao.erroAutenticacao(rota)),
      );
    });
  });

  afterAll(async () => {
    await auxiliar.afterAll();
  });
});
