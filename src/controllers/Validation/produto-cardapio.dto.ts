import {
  IsNotEmpty,
  IsUUID,
  isUUID,
  IsString,
  IsEnum,
  IsPositive,
  isPositive,
  IsNumber,
  isNumber,
} from 'class-validator';
import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { CATEGORIAS } from '../../@core/dominio/enums/categorias.enum';
import { Transform } from 'class-transformer';
import { MapaPossuiDadosValidos } from './custom-validation/lista-entrada-valida.validation-decorator';

export class CreateProdutoCardapioDto {
  @ApiProperty({
    description: 'Id do usuário que está cadastrando o produto do cardápio',
    example: 'dd9671b9-1235-4921-9674-aea149e03fb5',
  })
  @IsUUID()
  idUsuario: string;

  @ApiProperty({
    description: 'Nome que será usado para o produto',
    example: 'Nome produto',
  })
  @IsString()
  @IsNotEmpty()
  nomeProduto: string;

  @ApiProperty({
    description: 'O tipo da categoria a qual o produto pertence',
    enum: CATEGORIAS,
    example: 'bebidas',
  })
  @IsEnum(CATEGORIAS)
  categoria: CATEGORIAS;

  @ApiProperty({
    description: 'Descrição que será usada para o produto',
    example: 'Produto feito de ...',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    description:
      'Preço de venda para o produto. Deve conter até duas casas decimais',
    example: 6.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  preco: number;

  // tranform ocorre antes das validações!!!
  // como não se sabe o tipo do dados, caso de erro de tipo, apenas retorna null
  // pela regra, o null é barrado na validação, emitindo assim o erro correto
  @ApiProperty({
    description:
      'Lista contendo listas compostas com um id de um produto do estoque seguido da quantidade usada. A quantidade deve ser um número inteiro maior que zero',
    type: () => '[[string, number]]',
    minItems: 1,
    example: [
      ['b2e37491-dab2-4a11-a0b8-736243e11188', 1],
      ['6030e71d-fb31-4263-bf6c-33cf89b3e4d6', 2],
    ],
  })
  @Transform(({ value }) => {
    try {
      return new Map<string, number>(value);
    } catch (_) {
      return null;
    }
  })
  @MapaPossuiDadosValidos(
    [isUUID],
    [(value) => isNumber(value, { maxDecimalPlaces: 0 }), isPositive],
  )
  composicao: Map<string, number>; //idProdutoEstoque, quantidade
}

export class UpdateProdutoCardapioDto extends PartialType(
  OmitType(CreateProdutoCardapioDto, ['idUsuario']),
) {}
