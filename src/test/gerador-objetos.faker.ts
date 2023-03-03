import { faker } from '@faker-js/faker';

import { UNIDADES } from '../@core/dominio/enums/unidades.enum';
import { ProdutoEstoque } from '../@core/dominio/produto-estoque.entity';
import { Usuario } from '../@core/dominio/usuario.entity';
import { geraValorEnumAleatorio } from '../@core/helper/manipular-enum.function';
import { CATEGORIAS } from './../@core/dominio/enums/categorias.enum';
import { PedidoFechado } from './../@core/dominio/pedido-fechado.entity';
import { Pedido } from './../@core/dominio/pedido.entity';
import { ProdutoCardapio } from './../@core/dominio/produto-cardapio.entity';

export class GeradorDeObjetos {
  static criarUsuario(comId = false): Usuario {
    const usuario = new Usuario();

    if (comId) usuario.id = faker.datatype.uuid();

    usuario.email = faker.internet.email();
    usuario.endereco = faker.address.streetAddress(true);
    usuario.nomeLanchonete = faker.company.name();
    usuario.senha = faker.internet.password();

    return usuario;
  }

  static criarProdutoEstoque(
    comId = false,
    idUsuario?: string,
  ): ProdutoEstoque {
    const produtoEstoque = new ProdutoEstoque();

    if (comId) produtoEstoque.id = faker.datatype.uuid();

    idUsuario
      ? (produtoEstoque.idUsuario = idUsuario)
      : (produtoEstoque.idUsuario = faker.datatype.uuid());

    produtoEstoque.descricao = faker.commerce.productDescription();
    produtoEstoque.nomeProduto = faker.commerce.productName();
    produtoEstoque.quantidade = faker.datatype.number();
    produtoEstoque.unidade = geraValorEnumAleatorio(UNIDADES);

    return produtoEstoque;
  }

  static criarProdutoCardapio(
    comId = false,
    idUsuario?: string,
  ): ProdutoCardapio {
    const produtoCardapio = new ProdutoCardapio();

    if (comId) produtoCardapio.id = faker.datatype.uuid();

    idUsuario
      ? (produtoCardapio.idUsuario = idUsuario)
      : (produtoCardapio.idUsuario = faker.datatype.uuid());

    produtoCardapio.descricao = faker.commerce.productDescription();
    produtoCardapio.nomeProduto = faker.commerce.productName();
    produtoCardapio.categoria = geraValorEnumAleatorio(CATEGORIAS);
    produtoCardapio.preco = +faker.commerce.price();

    produtoCardapio.composicao = this.gerarMapStringNumberAleatorio();

    return produtoCardapio;
  }

  static criarPedido(comId = false): Pedido {
    const pedido = new Pedido();

    if (comId) pedido.id = faker.datatype.uuid();

    pedido.mesa = faker.datatype.number({ min: 1, max: 10 });
    pedido.valorConta = +faker.commerce.price();
    pedido.produtosVendidos = this.gerarMapStringNumberAleatorio();

    return pedido;
  }

  static criarPedidoFechado(comId = false): PedidoFechado {
    const pedido = new PedidoFechado();

    if (comId) pedido.id = faker.datatype.uuid();

    pedido.horaAbertura = faker.date.recent();
    pedido.mesa = faker.datatype.number({ min: 1, max: 10 });

    pedido.produtosUtilizados = new Map<ProdutoEstoque, number>();
    pedido.produtosVendidos = new Map<ProdutoCardapio, number>();
    pedido.valorConta = 0;

    const produtosEstoque = [] as ProdutoEstoque[];

    const qtdProdutosEstoque = faker.datatype.number({ min: 2, max: 6 });
    for (let i = 0; i < qtdProdutosEstoque; i++) {
      produtosEstoque.push(GeradorDeObjetos.criarProdutoEstoque(true));
    }

    const qtdProdutosCardapio = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < qtdProdutosCardapio; j++) {
      const produtoCardapio = GeradorDeObjetos.criarProdutoCardapio(true);
      const qtdProdCard = Math.floor(Math.random() * 3) + 1;

      pedido.produtosVendidos.set(produtoCardapio, qtdProdCard);
      pedido.valorConta += produtoCardapio.preco * qtdProdCard;

      produtoCardapio.composicao.clear();
      const qtdcomposto = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < qtdcomposto; i++) {
        const idxProdEstoque = Math.floor(
          Math.random() * (produtosEstoque.length - 1),
        );

        const idProdEstoque = produtosEstoque[idxProdEstoque].id;
        const qtdProdEstoque = Math.floor(Math.random() * 4) + 1;

        if (!produtoCardapio.composicao.has(idProdEstoque)) {
          produtoCardapio.composicao.set(idProdEstoque, qtdProdEstoque);

          if (pedido.produtosUtilizados.has(produtosEstoque[idxProdEstoque])) {
            const aux = pedido.produtosUtilizados.get(
              produtosEstoque[idxProdEstoque],
            );
            pedido.produtosUtilizados.set(
              produtosEstoque[idxProdEstoque],
              aux + qtdProdEstoque * qtdProdCard,
            );
          } else {
            pedido.produtosUtilizados.set(
              produtosEstoque[idxProdEstoque],
              qtdProdEstoque * qtdProdCard,
            );
          }
        }
      }
    }

    return pedido;
  }

  private static gerarMapStringNumberAleatorio() {
    const map = new Map<string, number>();
    const qtdProdutos = faker.datatype.number({ min: 1, max: 5 });

    for (let i = 0; i < qtdProdutos; i++) {
      map.set(faker.datatype.uuid(), faker.datatype.number({ min: 1, max: 5 }));
    }
    return map;
  }
}
