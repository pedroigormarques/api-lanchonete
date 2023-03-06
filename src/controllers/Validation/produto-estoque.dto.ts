import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';
import { UNIDADES } from '../../@core/dominio/enums/unidades.enum';

export class CreateProdutoEstoqueDto {
  @IsUUID()
  idUsuario: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  nomeProduto: string;

  @IsNumber()
  @Min(0)
  quantidade: number;

  @IsEnum(UNIDADES)
  unidade: UNIDADES;
}

export class UpdateProdutoEstoqueDto extends PartialType(
  OmitType(CreateProdutoEstoqueDto, ['idUsuario']),
) {}
