import { ProdutoCardapio } from 'src/@core/dominio/produto-cardapio.entity';
import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';

export class CreatePedidoFechadoDto {
  mesa: number;
  horaAbertura: Date;
  valorConta: number;
  produtosVendidos: Map<ProdutoCardapio, number>;
  produtosUtilizados: Map<ProdutoEstoque, number>;
}
