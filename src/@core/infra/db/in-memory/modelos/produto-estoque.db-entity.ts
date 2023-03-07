import { randomUUID } from 'crypto';

import { ProdutoEstoque } from './../../../../dominio/produto-estoque.entity';
import { UnprocessableEntityException } from '../../../../custom-exception/unprocessable-entity-exception.error';

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
      super.atualizarDados(produto);
    } else {
      throw new UnprocessableEntityException(
        `Produto do estoque de id ${this.id} está sendo utilizado por algum produto do cardápio. Atualização cancelada`,
      );
    }
  }
}
