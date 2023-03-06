import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { CardapioModule } from './modulos/cardapio.module';
import { EstoqueModule } from './modulos/estoque.module';
import { PedidoModule } from './modulos/pedido.module';
import { RepositorioInMemoryModule } from './modulos/repositorio-in-memory.module';
import { UsuarioModule } from './modulos/usuario.module';

@Module({
  imports: [
    AutenticacaoModule,
    UsuarioModule,
    EstoqueModule,
    CardapioModule,
    PedidoModule,
    RepositorioInMemoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
