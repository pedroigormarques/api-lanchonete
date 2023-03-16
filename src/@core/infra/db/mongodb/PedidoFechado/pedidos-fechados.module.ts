import { PedidoFechadoSchema } from './pedidos-fechados.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PedidosFechadosRepository } from './pedidos-fechados.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PedidoFechado', schema: PedidoFechadoSchema },
    ]),
  ],
  providers: [
    {
      provide: 'IPedidosFechadosRepository',
      useClass: PedidosFechadosRepository,
    },
  ],
  exports: ['IPedidosFechadosRepository'],
})
export class PedidoFechadoMongoDBModule {}
