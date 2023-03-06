import { IsNumber, IsUUID, Min, IsPositive } from 'class-validator';

export class CreatePedidoDto {
  @IsNumber()
  @IsPositive()
  mesa: number;

  @IsUUID()
  idUsuario: string;
}

export class AtualizarItemPedidoDto {
  @IsNumber()
  @Min(0)
  novaQtd: number;

  @IsUUID()
  idProdutoCardapio: string;
}
