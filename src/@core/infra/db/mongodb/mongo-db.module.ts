import { PedidoFechadoMongoDBModule } from './PedidoFechado/pedidos-fechados.module';
import { PedidoMongoDBModule } from './pedido/pedidos.module';
import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProdutoCardapioMongoDBModule } from './cardapio/produtos-cardapio.module';
import { ProdutoEstoqueMongoDBModule } from './estoque/produtos-estoque.module';

import { UsuarioMongoDBModule } from './usuario/usuario.module';
import { ConfigService } from '@nestjs/config/dist';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.getOrThrow('URL_BANCO'),
        dbName: config.getOrThrow('NOME_DATABASE'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
    UsuarioMongoDBModule,
    ProdutoEstoqueMongoDBModule,
    ProdutoCardapioMongoDBModule,
    PedidoMongoDBModule,
    PedidoFechadoMongoDBModule,
  ],
  exports: [
    UsuarioMongoDBModule,
    ProdutoEstoqueMongoDBModule,
    ProdutoCardapioMongoDBModule,
    PedidoMongoDBModule,
    PedidoFechadoMongoDBModule,
  ],
})
export class MongoDbRepositoryModule {}
