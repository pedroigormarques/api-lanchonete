import { randomUUID } from 'crypto';

import { CATEGORIAS } from './../../../../dominio/enums/categorias.enum';
import { ProdutoCardapio } from './../../../../dominio/produto-cardapio.entity';
import { criarObjetoComCopiaProfunda } from './../../../../helper/criador-copia-profunda.function';
import { possuiUmValorValidoParaOEnum } from './../../../../helper/manipular-enum.function';

export class ProdutoCardapioDB extends ProdutoCardapio {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoCardapio) {
    super();
    this.validarDadosCriacao(produto);
    this.id = randomUUID();
    this.carregarDadosBase(produto);
  }

  private validarDadosCriacao(produto: ProdutoCardapio): void {
    if (
      typeof produto.descricao !== 'string' ||
      typeof produto.nomeProduto !== 'string' ||
      typeof produto.preco !== 'number' ||
      !possuiUmValorValidoParaOEnum(produto.categoria, CATEGORIAS) ||
      !(produto.composicao instanceof Map)
    ) {
      throw new Error('Dados insuficientes/incorretos');
    }
  }

  carregarDadosBase(produto: ProdutoCardapio) {
    if (typeof produto.descricao === 'string')
      this.descricao = produto.descricao;

    if (typeof produto.nomeProduto === 'string')
      this.nomeProduto = produto.nomeProduto;

    if (produto.composicao instanceof Map)
      if (produto.composicao.size > 0)
        this.composicao = new Map(produto.composicao.entries());
      else throw new Error('Composição não inserida');

    if (typeof produto.preco === 'number') this.preco = produto.preco;

    if (possuiUmValorValidoParaOEnum(produto.categoria, CATEGORIAS))
      this.categoria = produto.categoria;
  }

  paraProdutoCardapio(): ProdutoCardapio {
    return criarObjetoComCopiaProfunda<ProdutoCardapioDB, ProdutoCardapio>(
      this,
      ProdutoCardapio,
      ['usadoPor'],
    );
  }
}
