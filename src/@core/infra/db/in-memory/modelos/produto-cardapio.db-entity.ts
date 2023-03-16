import { randomUUID } from 'crypto';

import { ProdutoCardapio } from './../../../../dominio/produto-cardapio.entity';

export class ProdutoCardapioDB extends ProdutoCardapio {
  usadoPor = new Set<string>();

  constructor(produto: ProdutoCardapio) {
    super();
    produto.verificarSeDadosSaoValidosOuErro();
    super.registrarDados({ id: randomUUID(), ...produto });
  }

  atualizarDados(produto: ProdutoCardapio) {
    produto.verificarSeDadosSaoValidosOuErro();
    super.atualizarDados(produto);
  }
}
