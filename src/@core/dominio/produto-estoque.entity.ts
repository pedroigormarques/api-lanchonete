import { BadRequestException } from '../custom-exception/bad-request-exception.error';
import { possuiUmValorValidoParaOEnum } from '../helper/manipular-enum.function';
import { UNIDADES } from './enums/unidades.enum';

export interface DadosBaseProdutoEstoque {
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;
  idUsuario: string;
}

export class ProdutoEstoque {
  id?: string;
  idUsuario: string;
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;

  constructor();
  constructor(dadosProduto: DadosBaseProdutoEstoque);
  constructor(dadosProduto: ProdutoEstoque);
  constructor(dadosProduto?: DadosBaseProdutoEstoque | ProdutoEstoque) {
    if (typeof dadosProduto !== 'undefined') {
      ProdutoEstoque.DadosSaoValidosParaRegistroOuErro(dadosProduto);
      this.registrarDados(dadosProduto);
    }
  }

  atualizarDados(
    dadosProduto: Omit<Partial<DadosBaseProdutoEstoque>, 'idUsuario'>,
  ) {
    if (typeof dadosProduto.nomeProduto !== 'undefined')
      this.nomeProduto = dadosProduto.nomeProduto;
    if (typeof dadosProduto.descricao !== 'undefined')
      this.descricao = dadosProduto.descricao;
    if (typeof dadosProduto.unidade !== 'undefined')
      this.setUnidade(dadosProduto.unidade);
    if (typeof dadosProduto.quantidade !== 'undefined')
      this.setQuantidade(dadosProduto.quantidade);
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
      throw new BadRequestException(
        'Quantidade invalida para o produto estocado. Coloque um valor maior ou igual a zero.',
      );
    }
  }

  setUnidade(unidade: UNIDADES) {
    if (possuiUmValorValidoParaOEnum(unidade, UNIDADES)) this.unidade = unidade;
    else throw new BadRequestException('Unidade informada não registrada');
  }

  protected registrarDados(
    dadosProduto: { id?: string } & DadosBaseProdutoEstoque,
  ) {
    if (typeof dadosProduto.id !== 'undefined') this.id = dadosProduto.id;
    this.idUsuario = dadosProduto.idUsuario;
    this.descricao = dadosProduto.descricao;
    this.nomeProduto = dadosProduto.nomeProduto;
    this.setQuantidade(dadosProduto.quantidade);
    this.setUnidade(dadosProduto.unidade);
  }

  private static possuiTodosOsDadosValidos(
    dadosProduto: DadosBaseProdutoEstoque,
  ): boolean {
    if (
      typeof dadosProduto.idUsuario !== 'string' ||
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
      throw new BadRequestException(
        'Dados incorretos/insuficientes para o produto do estoque',
      );
  }
}
