import { UNIDADES } from './../enums/unidades.enum';

export class CreateProdutoEstoqueDto {
  idUsuario: string;
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;
}
