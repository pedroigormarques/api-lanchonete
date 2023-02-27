import { possuiUmValorValidoParaOEnum } from '../helper/manipular-enum.function';
import { UNIDADES } from './enums/unidades.enum';

export interface DadosBaseProdutoEstoque {
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;
}

export class ProdutoEstoque {
  id?: string;
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;

  constructor();
  constructor(dadosProduto: DadosBaseProdutoEstoque);
  constructor(dadosProduto: ProdutoEstoque);
  constructor(dadosProduto?: DadosBaseProdutoEstoque | ProdutoEstoque) {
    if (dadosProduto) {
      ProdutoEstoque.DadosSaoValidosParaRegistroOuErro(dadosProduto);
      this.registrarDados(dadosProduto);
    }
  }

  atualizarDados(dadosProduto: Partial<DadosBaseProdutoEstoque>) {
    if (dadosProduto.nomeProduto) this.nomeProduto = dadosProduto.nomeProduto;
    if (dadosProduto.descricao) this.descricao = dadosProduto.descricao;
    if (dadosProduto.unidade) this.setUnidade(dadosProduto.unidade);
    if (dadosProduto.quantidade) this.setQuantidade(dadosProduto.quantidade);
  }

  possuiTodosOsDadosValidos(): boolean {
    return ProdutoEstoque.possuiTodosOsDadosValidos(this);
  }

  verificarSeDadosSaoValidosOuErro() {
    ProdutoEstoque.DadosSaoValidosParaRegistroOuErro(this);
  }

  setQuantidade(qtd: number) {
    if (qtd >= 0) this.quantidade = qtd;
    else {
      throw new Error(
        'Quantidade invalida. Coloque um valor maior ou igual a zero',
      );
    }
  }

  setUnidade(unidade: UNIDADES) {
    if (possuiUmValorValidoParaOEnum(unidade, UNIDADES)) this.unidade = unidade;
    else throw new Error('Unidade informada não registrada');
  }

  protected registrarDados(
    dadosProduto: { id?: string } & DadosBaseProdutoEstoque,
  ) {
    if (dadosProduto.id) this.id = dadosProduto.id;
    this.descricao = dadosProduto.descricao;
    this.nomeProduto = dadosProduto.nomeProduto;
    this.setQuantidade(dadosProduto.quantidade);
    this.setUnidade(dadosProduto.unidade);
  }

  private static possuiTodosOsDadosValidos(
    dadosProduto: DadosBaseProdutoEstoque,
  ): boolean {
    if (
      typeof dadosProduto.descricao !== 'string' ||
      typeof dadosProduto.nomeProduto !== 'string' ||
      typeof dadosProduto.quantidade !== 'number' ||
      dadosProduto.quantidade < 0 ||
      !possuiUmValorValidoParaOEnum(dadosProduto.unidade, UNIDADES)
    ) {
      return false;
    }
    return true;
  }

  private static DadosSaoValidosParaRegistroOuErro(
    dadosProduto: DadosBaseProdutoEstoque,
  ) {
    if (!ProdutoEstoque.possuiTodosOsDadosValidos(dadosProduto))
      throw new Error('Dados incorretos/insuficientes');
  }
}
