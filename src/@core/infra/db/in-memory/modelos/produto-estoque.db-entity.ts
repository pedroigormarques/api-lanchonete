import { UNIDADES } from './../../../../dominio/enums/unidades.enum';
import { randomUUID } from 'crypto';

import { ProdutoEstoque } from './../../../../dominio/produto-estoque.entity';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';
import { possuiUmValorValidoParaOEnum } from './../../../../helper/manipular-enum.function';

export class ProdutoEstoqueDB extends ProdutoEstoque {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoEstoque) {
    super();
    this.validarDadosCriacao(produto);

    this.id = randomUUID();
    this.carregarDadosBase(produto);
  }

  private validarDadosCriacao(produto: ProdutoEstoque): void {
    if (
      typeof produto.descricao !== 'string' ||
      typeof produto.nomeProduto !== 'string' ||
      typeof produto.quantidade !== 'number' ||
      !possuiUmValorValidoParaOEnum(produto.unidade, UNIDADES)
    ) {
      throw new Error('Dados insuficientes/incorretos');
    }
  }

  carregarDadosBase(produto: ProdutoEstoque) {
    if (typeof produto.descricao === 'string')
      this.descricao = produto.descricao;

    if (typeof produto.nomeProduto === 'string')
      this.nomeProduto = produto.nomeProduto;

    if (typeof produto.quantidade === 'number') {
      this.atualizarQuantidade(produto.quantidade);
    }

    if (possuiUmValorValidoParaOEnum(produto.unidade, UNIDADES))
      if (this.usadoPor.size === 0) {
        this.unidade = produto.unidade;
      } else {
        throw new Error(
          'Produto sendo utilizado. Não é possível alterar a quantidade',
        );
      }
  }

  paraProdutoEstoque(): ProdutoEstoque {
    return criarObjetoComCopiaProfunda<ProdutoEstoqueDB, ProdutoEstoque>(
      this,
      ProdutoEstoque,
      ['usadoPor'],
    );
  }

  private atualizarQuantidade(qtd: number): void {
    if (qtd >= 0) {
      this.quantidade = qtd;
    } else {
      throw new Error('Quantidade invalida passado para o produto');
    }
  }
}
