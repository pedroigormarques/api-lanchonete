import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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

export class LoginUsuarioDto extends PickType(CreateUsuarioDto, [
  'email',
  'senha',
]) {}

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
