import { CATEGORIAS } from '../enums/categorias.enum';

export class CreateProdutoCardapioDto {
  idUsuario: string;
  nomeProduto: string;
  categoria: CATEGORIAS;
  descricao: string;
  preco: number;
  composicao: Map<string, number>; //idProdutoEstoque, quantidade
}
