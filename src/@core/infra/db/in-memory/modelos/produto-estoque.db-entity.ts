import { randomUUID } from 'crypto';

import { UNIDADES } from './../../../../dominio/enums/unidades.enum';
import { ProdutoEstoque } from './../../../../dominio/produto-estoque.entity';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';
import { possuiUmValorValidoParaOEnum } from './../../../../helper/manipular-enum.function';

export class ProdutoEstoqueDB extends ProdutoEstoque {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoEstoque) {
    super();
    this.validarDados(produto);

    this.id = randomUUID();
    this.unidade = produto.unidade;
    this.quantidade = produto.quantidade;
    this.descricao = produto.descricao;
    this.nomeProduto = produto.nomeProduto;
  }

  private validarDados(produto: ProdutoEstoque): void {
    if (
      typeof produto.descricao !== 'string' ||
      typeof produto.nomeProduto !== 'string' ||
      typeof produto.quantidade !== 'number' ||
      produto.quantidade < 0 ||
      !possuiUmValorValidoParaOEnum(produto.unidade, UNIDADES)
    ) {
      throw new Error('Dados insuficientes/incorretos');
    }
  }

  carregarDadosBase(produto: ProdutoEstoque) {
    this.validarDados(produto);

    if (this.usadoPor.size === 0) {
      this.unidade = produto.unidade;
    } else {
      throw new Error(
        'Produto sendo utilizado. Não é possível alterar a unidade',
      );
    }
    this.quantidade = produto.quantidade;
    this.descricao = produto.descricao;
    this.nomeProduto = produto.nomeProduto;
  }

  paraProdutoEstoque(): ProdutoEstoque {
    return criarObjetoComCopiaProfunda<ProdutoEstoqueDB, ProdutoEstoque>(
      this,
      ProdutoEstoque,
      ['usadoPor'],
    );
  }
}
