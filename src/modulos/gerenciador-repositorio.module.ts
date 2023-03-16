import { DynamicModule, Module } from '@nestjs/common';

import { MongoDbRepositoryModule } from './../@core/infra/db/mongodb/mongo-db.module';
import { RepositorioInMemoryModule } from './repositorio-in-memory.module';

@Module({})
export class GerenciadorRepositoriosModule {
  static forRoot(): DynamicModule {
    const retorno = { module: GerenciadorRepositoriosModule } as DynamicModule;

    if (process.env.NODE_ENV === 'test') {
      {
        retorno.imports = [RepositorioInMemoryModule];
        retorno.exports = [RepositorioInMemoryModule];
      }
    } else {
      retorno.imports = [MongoDbRepositoryModule.forRoot(process.env.NODE_ENV)];
      retorno.exports = [MongoDbRepositoryModule];
    }

    return retorno;
  }
}
