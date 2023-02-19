import { ProdutoEstoque } from './produto-estoque.entity';
export class ProdutoCardapio {
  id: string;
  nomeProduto: string;
  categoria: categorias;
  descricao: string;
  preco: number;
  composicao: Map<ProdutoEstoque, number>;
}

enum categorias {
  'bebidas',
  'lanches',
  'sobremesas',
}
