import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';

export class CreateUsuarioDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  senha: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsString()
  @IsNotEmpty()
  nomeLanchonete: string;
}

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
