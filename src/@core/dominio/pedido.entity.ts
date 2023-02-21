export class Pedido {
  id?: string;
  mesa: number;
  horaAbertura?: Date;
  valorConta?: number;
  produtosVendidos?: Map<string, number>; //idProdutoCardapio, quantidade
}
