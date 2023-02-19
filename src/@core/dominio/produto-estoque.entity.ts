export class ProdutoEstoque {
  id: string;
  descricao: string;
  nomeProduto: string;
  quantidade: number;
  unidade: UNIDADE;
}

enum UNIDADE {
  'kg',
  'g',
  'L',
  'ml',
  'un',
  'pc',
  'lt',
}
