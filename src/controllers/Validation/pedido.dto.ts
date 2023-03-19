import { IsNumber, IsUUID, Min, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePedidoDto {
  @ApiProperty({
    description:
      'Número da mesa que terá o pedido aberto. Deve ser maior que zero',
    example: 5,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  mesa: number;

  @ApiProperty({
    description: 'Id do usuário que está cadastrando o pedido',
    example: 'dd9671b9-1235-4921-9674-aea149e03fb5',
  })
  @IsUUID()
  idUsuario: string;
}

export class AtualizarItemPedidoDto {
  @ApiProperty({
    description:
      'Quantidade do produto a ser atualizado no pedido. Deve ser um inteiro maior ou igual a zero',
    example: 5,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  novaQtd: number;

  @ApiProperty({
    description: 'Id do produto do cardapio que será atualizado no pedido',
    example: 'a6c2edbf-6dd2-44ee-a8fe-e9ddcfc14f44',
  })
  @IsUUID()
  idProdutoCardapio: string;
}
