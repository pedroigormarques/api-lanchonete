import { Module } from '@nestjs/common';

import { UsuarioService } from './../@core/aplicacao/usuario-service.use-case';
import { IUsuarioRepository } from './../@core/infra/contratos/usuario.repository.interface';
import { AutenticacaoModule } from './../autenticacao/autenticacao.module';
import { AutenticacaoService } from './../autenticacao/autenticacao.service';
import { UsuarioController } from './../controllers/usuario.controller';

@Module({
  imports: [AutenticacaoModule],
  controllers: [UsuarioController],
  providers: [
    {
      provide: UsuarioService,
      useFactory: (
        usuarioRepositorio: IUsuarioRepository,
        autenticacaoService: AutenticacaoService,
      ) => new UsuarioService(usuarioRepositorio, autenticacaoService),
      inject: ['IUsuarioRepository', AutenticacaoService],
    },
  ],
  exports: [UsuarioService],
})
export class UsuarioModule {}
