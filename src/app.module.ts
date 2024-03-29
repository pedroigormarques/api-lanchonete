import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';

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
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'prod'
          ? '.env'
          : `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    AutenticacaoModule,
    UsuarioModule,
    EstoqueModule,
    CardapioModule,
    PedidoModule,
    GerenciadorRepositoriosModule.forRoot(),
  ],
  providers: [
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
