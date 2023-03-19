import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Email de acesso', example: 'teste@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha de acesso com no mínimo 8 caracteres',
    example: 'teste123',
  })
  @IsNotEmpty()
  @MinLength(8)
  senha: string;

  @ApiProperty({
    description: 'Endereço da rua do estabelecimento',
    example: 'endereco teste, nº 123',
  })
  @IsString()
  @IsNotEmpty()
  endereco: string;

  @ApiProperty({
    description: 'Nome do estabelecimento',
    example: 'nome lanchonete',
  })
  @IsString()
  @IsNotEmpty()
  nomeLanchonete: string;
}

export class LoginUsuarioDto extends PickType(CreateUsuarioDto, [
  'email',
  'senha',
] as const) {}

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
