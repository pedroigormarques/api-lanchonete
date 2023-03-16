import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProdutoCardapioSchema } from './produtos-cardapio.model';
import { ProdutosCardapioRepository } from './produtos-cardapio.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'ProdutoCardapio', schema: ProdutoCardapioSchema },
    ]),
  ],
  providers: [
    {
      provide: 'IProdutosCardapioRepository',
      useClass: ProdutosCardapioRepository,
    },
  ],
  exports: ['IProdutosCardapioRepository'],
})
export class ProdutoCardapioMongoDBModule {}
