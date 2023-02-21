export class UpdatePedidoDto {
  mesa?: number;
  valorConta?: number;
  produtosVendidos?: Map<string, number>; //idProdutoCardapio, quantidade
}
