import { UNIDADES } from './../enums/unidades.enum';

export class UpdateProdutoEstoqueDto {
  descricao?: string;
  nomeProduto?: string;
  quantidade?: number;
  unidade?: UNIDADES;
}
