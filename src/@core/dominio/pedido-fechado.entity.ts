import { ProdutoEstoque } from './produto-estoque.entity';
import { ProdutoCardapio } from './produto-cardapio.entity';
export class PedidoFechado {
  id: string;
  mesa: string;
  horaAbertura: Date;
  horaFechamento: Date;
  valorConta: number;
  produtosVendidos: Map<ProdutoCardapio, number>;
  produtosUtilizados: Map<ProdutoEstoque, number>;
}
