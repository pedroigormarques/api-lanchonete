import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PedidoSchema } from './pedidos.model';
import { PedidosRepository } from './pedidos.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Pedido', schema: PedidoSchema }]),
  ],
  providers: [
    {
      provide: 'IPedidosRepository',
      useClass: PedidosRepository,
    },
  ],
  exports: ['IPedidosRepository'],
})
export class PedidoMongoDBModule {}
