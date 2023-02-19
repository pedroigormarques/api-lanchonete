import { UNIDADES } from 'src/@core/dominio/enums/unidades.enum';

export class CreateProdutoEstoqueDto {
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;
}
