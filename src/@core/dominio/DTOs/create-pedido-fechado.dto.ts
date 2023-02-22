import { ProdutoCardapio } from './../produto-cardapio.entity';
import { ProdutoEstoque } from './../produto-estoque.entity';

export class CreatePedidoFechadoDto {
  mesa: number;
  horaAbertura: Date;
  valorConta: number;
  produtosVendidos: Map<ProdutoCardapio, number>;
  produtosUtilizados: Map<ProdutoEstoque, number>;
}
