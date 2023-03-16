import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { ErroDetalhadoEHttpExceptionFilter } from './exception/exception-filter';
import { MapInterceptor } from './interceptor/map.interceptor';
import { CardapioModule } from './modulos/cardapio.module';
import { EstoqueModule } from './modulos/estoque.module';
import { GerenciadorRepositoriosModule } from './modulos/gerenciador-repositorio.module';
import { PedidoModule } from './modulos/pedido.module';
import { UsuarioModule } from './modulos/usuario.module';

@Module({
  imports: [
    AutenticacaoModule,
    UsuarioModule,
    EstoqueModule,
    CardapioModule,
    PedidoModule,
    GerenciadorRepositoriosModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MapInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ErroDetalhadoEHttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
  ],
})
export class AppModule {}
