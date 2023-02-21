import { UNIDADES } from './enums/unidades.enum';

export class ProdutoEstoque {
  id?: string;
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADES;
}
