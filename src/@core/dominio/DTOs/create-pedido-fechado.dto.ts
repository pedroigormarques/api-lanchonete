import { ProdutoEstoque } from 'src/@core/dominio/produto-estoque.entity';
import { ProdutoCardapio } from 'src/@core/dominio/produto-cardapio.entity';

export class CreatePedidoFechadoDto {
  mesa: string;
  horaAbertura: Date;
  valorConta: number;
  produtosVendidos: Map<ProdutoCardapio, number>;
  produtosUtilizados: Map<ProdutoEstoque, number>;
}
