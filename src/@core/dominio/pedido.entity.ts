export class Pedido {
  id: string;
  mesa: string;
  horaAbertura: Date;
  valorConta: number;
  produtosVendidos: Map<string, number>; //idProdutoCardapio, quantidade
}
