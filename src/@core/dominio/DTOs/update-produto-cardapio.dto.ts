import { CATEGORIAS } from '../enums/categorias.enum';

export class UpdateProdutoCardapioDto {
  nomeProduto?: string;
  categoria?: CATEGORIAS;
  descricao?: string;
  preco?: number;
  composicao?: Map<string, number>; //idProdutoEstoque, quantidade
}
