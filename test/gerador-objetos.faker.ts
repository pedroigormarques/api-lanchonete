import { faker } from '@faker-js/faker';

import { UNIDADES } from './../src/@core/dominio/enums/unidades.enum';
import { ProdutoEstoque } from './../src/@core/dominio/produto-estoque.entity';
import { Usuario } from './../src/@core/dominio/usuario.entity';

export class GeradorObjetos {
  static criarUsuario(comId = false): Usuario {
    const usuario = new Usuario();

    if (comId) usuario.id = faker.datatype.uuid();
    usuario.email = faker.internet.email();
    usuario.endereco = faker.address.streetAddress(true);
    usuario.nomeLanchonete = faker.company.name();
    usuario.senha = faker.internet.password();

    return usuario;
  }

  static criarProdutoEstoque(comId = false): ProdutoEstoque {
    const produtoEstoque = new ProdutoEstoque();

    if (comId) produtoEstoque.id = faker.datatype.uuid();
    produtoEstoque.descricao = faker.commerce.productDescription();
    produtoEstoque.nomeProduto = faker.commerce.productName();
    produtoEstoque.quantidade = faker.datatype.number();
    produtoEstoque.unidade = this.randomEnumValue(UNIDADES);

    return produtoEstoque;
  }

  private static randomEnumValue(enumeration) {
    const values = Object.keys(enumeration);
    const enumKey = values[Math.floor(Math.random() * values.length)];
    return enumeration[enumKey];
  }
}
