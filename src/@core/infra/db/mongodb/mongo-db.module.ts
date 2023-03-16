import { PedidoFechadoMongoDBModule } from './PedidoFechado/pedidos-fechados.module';
import { PedidoMongoDBModule } from './pedido/pedidos.module';
import { Global, Module, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProdutoCardapioMongoDBModule } from './cardapio/produtos-cardapio.module';
import { ProdutoEstoqueMongoDBModule } from './estoque/produtos-estoque.module';

import { UsuarioMongoDBModule } from './usuario/usuario.module';

@Global()
@Module({
  imports: [
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
export class MongoDbRepositoryModule {
  static forRoot(ambiente: string): DynamicModule {
    let nomeBanco: string;

    if (ambiente === 'e2e') nomeBanco = 'Testes-e2e';
    else if (ambiente === 'prod') nomeBanco = 'API-Lanchonete';
    else nomeBanco = 'Dev-Testes';

    return {
      module: MongoDbRepositoryModule,
      imports: [
        MongooseModule.forRoot(
          'mongodb://db_app:aqcn2Jy1ly3I50vd@ac-cyrvran-shard-00-00.mfhdivt.mongodb.net:27017,ac-cyrvran-shard-00-01.mfhdivt.mongodb.net:27017,ac-cyrvran-shard-00-02.mfhdivt.mongodb.net:27017/?ssl=true&replicaSet=atlas-18dwqt-shard-0&authSource=admin&retryWrites=true&w=majority',
          {
            dbName: nomeBanco,
          },
        ),
      ],
    };
  }
}
