import { UNIDADES } from './../enums/unidades.enum';

export class CreateProdutoEstoqueDto {
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;
}
