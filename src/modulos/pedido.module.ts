import { Module } from '@nestjs/common';

import { CardapioService } from './../@core/aplicacao/cardapio-service.use-case';
import { EstoqueService } from './../@core/aplicacao/estoque-service.use-case';
import { PedidosService } from './../@core/aplicacao/pedidos-service.use-case';
import { IPedidosFechadosRepository } from './../@core/infra/contratos/pedidos-fechados.repository.interface';
import { IPedidosRepository } from './../@core/infra/contratos/pedidos.repository.interface';
import { PedidosFechadosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos-fechados.repository';
import { PedidosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos.repository';
import { PedidoController } from './../controllers/pedido.controller';
import { CardapioModule } from './cardapio.module';
import { EstoqueModule } from './estoque.module';

@Module({
  imports: [EstoqueModule, CardapioModule],
  controllers: [PedidoController],
  providers: [
    {
      provide: PedidosService,
      useFactory: (
        pedidosRepositorio: IPedidosRepository,
        pedidosFechadosRepositorio: IPedidosFechadosRepository,
        cardapioService: CardapioService,
        estoqueService: EstoqueService,
      ) =>
        new PedidosService(
          pedidosRepositorio,
          pedidosFechadosRepositorio,
          cardapioService,
          estoqueService,
        ),
      inject: [
        PedidosRepository,
        PedidosFechadosRepository,
        CardapioService,
        EstoqueService,
      ],
    },
  ],
  exports: [PedidosService],
})
export class PedidoModule {}
