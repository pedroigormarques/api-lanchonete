import { BadRequestException } from './../custom-exception/bad-request-exception.error';
import { possuiUmValorValidoParaOEnum } from '../helper/manipular-enum.function';
import { CATEGORIAS } from './enums/categorias.enum';

export interface DadosBaseProdutoCardapio {
  idUsuario: string;
  nomeProduto: string;
  categoria: CATEGORIAS;
  descricao: string;
  preco: number;
  composicao: Map<string, number>; //idProdutoEstoque, quantidade
}

export class ProdutoCardapio {
  id?: string;
  idUsuario: string;
  nomeProduto: string;
  categoria: CATEGORIAS;
  descricao: string;
  preco: number;
  composicao: Map<string, number>; //idProdutoEstoque, quantidade

  constructor();
  constructor(dadosProduto: DadosBaseProdutoCardapio);
  constructor(dadosProduto: ProdutoCardapio);
  constructor(dadosProduto?: DadosBaseProdutoCardapio | ProdutoCardapio) {
    if (dadosProduto) {
      ProdutoCardapio.DadosSaoValidosParaRegistroOuErro(dadosProduto);
      this.registrarDados(dadosProduto);
    }
  }

  possuiTodosOsDadosValidos(): boolean {
    return ProdutoCardapio.possuiTodosOsDadosValidos(this);
  }

  verificarSeDadosSaoValidosOuErro() {
    ProdutoCardapio.DadosSaoValidosParaRegistroOuErro(this);
  }

  atualizarDados(
    dadosProduto: Omit<Partial<DadosBaseProdutoCardapio>, 'idUsuario'>,
  ) {
    if (dadosProduto.descricao) this.descricao = dadosProduto.descricao;
    if (dadosProduto.nomeProduto) this.nomeProduto = dadosProduto.nomeProduto;

    if (dadosProduto.composicao) this.setComposicao(dadosProduto.composicao);
    if (dadosProduto.preco) this.setPreco(dadosProduto.preco);
    if (dadosProduto.categoria) this.setCategoria(dadosProduto.categoria);
  }

  setPreco(preco: number) {
    if (preco > 0) this.preco = preco;
    else {
      throw new BadRequestException(
        'Preco invalido. Coloque um valor maior que zero',
      );
    }
  }

  setCategoria(categoria: CATEGORIAS) {
    if (possuiUmValorValidoParaOEnum(categoria, CATEGORIAS))
      this.categoria = categoria;
    else throw new BadRequestException('Categoria informada não registrada');
  }

  setComposicao(composicao: Map<string, number>) {
    if (composicao.size > 0) this.composicao = new Map(composicao.entries());
    else {
      throw new BadRequestException(
        'Composicao invalida. Coloque ao menos um produto do estoque',
      );
    }
  }

  protected registrarDados(
    dadosProduto: { id?: string } & DadosBaseProdutoCardapio,
  ) {
    if (dadosProduto.id) this.id = dadosProduto.id;

    this.idUsuario = dadosProduto.idUsuario;
    this.descricao = dadosProduto.descricao;
    this.nomeProduto = dadosProduto.nomeProduto;

    this.setComposicao(dadosProduto.composicao);
    this.setPreco(dadosProduto.preco);
    this.setCategoria(dadosProduto.categoria);
  }

  private static possuiTodosOsDadosValidos(
    dadosProduto: DadosBaseProdutoCardapio,
  ): boolean {
    if (
      typeof dadosProduto.idUsuario !== 'string' ||
      typeof dadosProduto.descricao !== 'string' ||
      typeof dadosProduto.nomeProduto !== 'string' ||
      typeof dadosProduto.preco !== 'number' ||
      dadosProduto.preco <= 0 ||
      !possuiUmValorValidoParaOEnum(dadosProduto.categoria, CATEGORIAS) ||
      !(dadosProduto.composicao instanceof Map) ||
      dadosProduto.composicao.size === 0
    ) {
      return false;
    }
    return true;
  }

  private static DadosSaoValidosParaRegistroOuErro(
    dadosProduto: DadosBaseProdutoCardapio,
  ) {
    if (!ProdutoCardapio.possuiTodosOsDadosValidos(dadosProduto))
      throw new BadRequestException(
        'Dados incorretos/insuficientes para o produto do cardapio',
      );
  }
}
