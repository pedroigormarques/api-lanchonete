import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProdutoEstoqueSchema } from './produtos-estoque.model';
import { ProdutoEstoqueRepository } from './produtos-estoque.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProdutoEstoque', schema: ProdutoEstoqueSchema },
    ]),
  ],
  providers: [
    {
      provide: 'IProdutosEstoqueRepository',
      useClass: ProdutoEstoqueRepository,
    },
  ],
  exports: ['IProdutosEstoqueRepository'],
})
export class ProdutoEstoqueMongoDBModule {}
