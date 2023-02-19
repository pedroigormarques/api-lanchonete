import { ProdutoCardapio } from './produto-cardapio.entity';
export class Pedido {
  id: string;
  mesa: string;
  horaAbertura: string; //-----------------
  valorConta: number;
  produtosVendidos: Map<ProdutoCardapio, number>;
}
