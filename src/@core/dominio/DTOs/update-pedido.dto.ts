export class UpdatePedidoDto {
  mesa?: string;
  valorConta?: number;
  produtosVendidos?: Map<string, number>; //idProdutoCardapio, quantidade
}
