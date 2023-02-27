import { randomUUID } from 'crypto';

import { ProdutoEstoque } from './../../../../dominio/produto-estoque.entity';

export class ProdutoEstoqueDB extends ProdutoEstoque {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoEstoque) {
    super();
    produto.verificarSeDadosSaoValidosOuErro();
    super.registrarDados({ id: randomUUID(), ...produto });
  }

  atualizarDados(produto: ProdutoEstoque) {
    produto.verificarSeDadosSaoValidosOuErro();

    if (this.unidade === produto.unidade || this.usadoPor.size === 0) {
      super.registrarDados(produto);
    } else {
      throw new Error(
        `Produto de id ${this.id} está sendo utilizado por algum produto do cardápio. Atualização cancelada`,
      );
    }
  }
}
