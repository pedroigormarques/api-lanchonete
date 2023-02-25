import { faker } from '@faker-js/faker';

import { UNIDADES } from '../@core/dominio/enums/unidades.enum';
import { ProdutoEstoque } from '../@core/dominio/produto-estoque.entity';
import { Usuario } from '../@core/dominio/usuario.entity';
import { geraValorEnumAleatorio } from '../@core/helper/manipular-enum.function';
import { CATEGORIAS } from './../@core/dominio/enums/categorias.enum';
import { Pedido } from './../@core/dominio/pedido.entity';
import { ProdutoCardapio } from './../@core/dominio/produto-cardapio.entity';

export class GeradorDeObjetos {
  static criarUsuario(id: boolean | string = false): Usuario {
    const usuario = new Usuario();

    if (id) {
      if (typeof id === 'boolean') usuario.id = faker.datatype.uuid();
      else usuario.id = id;
    }
    usuario.email = faker.internet.email();
    usuario.endereco = faker.address.streetAddress(true);
    usuario.nomeLanchonete = faker.company.name();
    usuario.senha = faker.internet.password();

    return usuario;
  }

  static criarProdutoEstoque(id: boolean | string = false): ProdutoEstoque {
    const produtoEstoque = new ProdutoEstoque();

    if (id) {
      if (typeof id === 'boolean') produtoEstoque.id = faker.datatype.uuid();
      else produtoEstoque.id = id;
    }
    produtoEstoque.descricao = faker.commerce.productDescription();
    produtoEstoque.nomeProduto = faker.commerce.productName();
    produtoEstoque.quantidade = faker.datatype.number();
    produtoEstoque.unidade = geraValorEnumAleatorio(UNIDADES);

    return produtoEstoque;
  }

  static criarProdutoCardapio(id: boolean | string = false): ProdutoCardapio {
    const produtoCardapio = new ProdutoCardapio();

    if (id) {
      if (typeof id === 'boolean') produtoCardapio.id = faker.datatype.uuid();
      else produtoCardapio.id = id;
    }
    produtoCardapio.descricao = faker.commerce.productDescription();
    produtoCardapio.nomeProduto = faker.commerce.productName();
    produtoCardapio.categoria = geraValorEnumAleatorio(CATEGORIAS);
    produtoCardapio.preco = +faker.commerce.price();

    produtoCardapio.composicao = this.gerarMapStringNumberAleatorio();

    return produtoCardapio;
  }

  static criarPedido(id: boolean | string = false): Pedido {
    const pedido = new Pedido();

    if (id) {
      if (typeof id === 'boolean') pedido.id = faker.datatype.uuid();
      else pedido.id = id;
    }
    pedido;

    pedido.horaAbertura = new Date();
    pedido.mesa = faker.datatype.number({ min: 1, max: 10 });
    pedido.valorConta = +faker.commerce.price();
    pedido.produtosVendidos = this.gerarMapStringNumberAleatorio();

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
