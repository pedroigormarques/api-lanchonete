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
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CATEGORIAS } from '../../@core/dominio/enums/categorias.enum';
import { Transform } from 'class-transformer';
import { MapaPossuiDadosValidos } from './custom-validation/lista-entrada-valida.validation-decorator';

export class CreateProdutoCardapioDto {
  @IsUUID()
  idUsuario: string;

  @IsString()
  @IsNotEmpty()
  nomeProduto: string;

  @IsEnum(CATEGORIAS)
  categoria: CATEGORIAS;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  preco: number;

  // tranform ocorre antes das validações!!!
  // como não se sabe o tipo do dados, caso de erro de tipo, apenas retorna null
  // pela regra, o null é barrado na validação, emitindo assim o erro correto
  @Transform(({ value }) => {
    try {
      return new Map<string, number>(value);
    } catch (_) {
      return null;
    }
  })
  @MapaPossuiDadosValidos([isUUID], [isNumber, isPositive])
  composicao: Map<string, number>; //idProdutoEstoque, quantidade
}

export class UpdateProdutoCardapioDto extends PartialType(
  OmitType(CreateProdutoCardapioDto, ['idUsuario']),
) {}
