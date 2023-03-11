import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Request,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { UsuarioService } from './../@core/aplicacao/usuario-service.use-case';
import { JwtAuthGuard } from './../autenticacao/jwt.guard';
import { ErroDetalhadoEHttpExceptionFilter } from './../exception/exception-filter';
import {
  CreateUsuarioDto,
  LoginUsuarioDto,
  UpdateUsuarioDto,
} from './Validation/usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('registrar')
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  @HttpCode(HttpStatus.CREATED)
  async registrarUsuario(@Body() dadosUsuario: CreateUsuarioDto) {
    return await this.usuarioService.registrarUsuario(dadosUsuario);
  }

  @Post('entrar')
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
  @HttpCode(HttpStatus.OK)
  async logar(@Body() credenciais: LoginUsuarioDto) {
    const dadosUsuario = await this.usuarioService.logar(
      credenciais.email,
      credenciais.senha,
    );

    return dadosUsuario;
  }

  @Put('atualizar')
  @UseFilters(ErroDetalhadoEHttpExceptionFilter)
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
