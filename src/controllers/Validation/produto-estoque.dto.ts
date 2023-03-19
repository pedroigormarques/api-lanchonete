import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { UNIDADES } from '../../@core/dominio/enums/unidades.enum';

export class CreateProdutoEstoqueDto {
  @ApiProperty({
    description: 'Id do usuário que está cadastrando o produto do estoque',
    example: 'dd9671b9-1235-4921-9674-aea149e03fb5',
  })
  @IsUUID()
  idUsuario: string;

  @ApiProperty({
    description: 'Descrição que será usada para o produto',
    example: 'Produto possui ...',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description: 'Nome que será usado para o produto',
    example: 'Nome produto',
  })
  @IsString()
  @IsNotEmpty()
  nomeProduto: string;

  @ApiProperty({
    description:
      'Quantidade do produto presente no estoque. Deve ser um inteiro maior ou igual a zero',
    example: 50,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  quantidade: number;

  @ApiProperty({
    description: 'A unidade usada para contar a quantidade do produto',
    enum: UNIDADES,
    example: 'kg',
  })
  @IsEnum(UNIDADES)
  unidade: UNIDADES;
}

export class UpdateProdutoEstoqueDto extends PartialType(
  OmitType(CreateProdutoEstoqueDto, ['idUsuario']),
) {}
