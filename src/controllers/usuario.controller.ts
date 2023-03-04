import { HttpExceptionFilter } from './../exception/exception-filter';
import { UsuarioService } from './../@core/aplicacao/usuario-service.use-case';
import { Body, Controller, Post, Put, HttpStatus } from '@nestjs/common';

import { CreateUsuarioDto } from '../@core/dominio/DTOs/create-usuario.dto';
import { HttpCode, UseFilters } from '@nestjs/common/decorators';
import { UpdateUsuarioDto } from 'src/@core/dominio/DTOs/update-usuario.dto';

@Controller()
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/registrar')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async registrarUsuario(@Body() dadosUsuario: CreateUsuarioDto) {
    return await this.usuarioService.registrarUsuario(dadosUsuario);
  }

  @Post('/login')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(HttpStatus.OK)
  async logar(@Body() credenciais: { email: string; senha: string }) {
    const dadosUsuario = await this.usuarioService.logar(
      credenciais.email,
      credenciais.senha,
    );

    return dadosUsuario;
  }

  @Put('/atualizar')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  async atualizarUsuario(@Body() dadosUsuario: UpdateUsuarioDto) {
    //fazer sistema de autenticação
    return await this.usuarioService.atualizarUsuario('idLogado', dadosUsuario);
  }
}
