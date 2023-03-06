import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { HttpCode, UseFilters, UseGuards } from '@nestjs/common/decorators';

import { UsuarioService } from './../@core/aplicacao/usuario-service.use-case';
import { JwtAuthGuard } from './../autenticacao/jwt.guard';
import { HttpExceptionFilter } from './../exception/exception-filter';
import { CreateUsuarioDto, UpdateUsuarioDto } from './Validation/usuario.dto';

@Controller()
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('/registrar')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async registrarUsuario(@Body() dadosUsuario: CreateUsuarioDto) {
    return await this.usuarioService.registrarUsuario(dadosUsuario);
  }

  @Post('login')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(HttpStatus.OK)
  async logar(@Body() credenciais: { email: string; senha: string }) {
    const dadosUsuario = await this.usuarioService.logar(
      credenciais.email,
      credenciais.senha,
    );

    return dadosUsuario;
  }

  @Put('atualizar')
  @UseFilters(HttpExceptionFilter)
  @UseGuards(JwtAuthGuard)
  async atualizarUsuario(
    @Request() req,
    @Body() dadosUsuario: UpdateUsuarioDto,
  ) {
    return await this.usuarioService.atualizarUsuario(
      req.user.idUsuarioLogado,
      dadosUsuario,
    );
  }
}
