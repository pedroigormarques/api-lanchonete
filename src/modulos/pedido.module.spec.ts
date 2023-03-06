import { Test } from '@nestjs/testing';

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
import { PedidoModule } from './pedido.module';
import { RepositorioInMemoryModule } from './repositorio-in-memory.module';

describe('Pedido Module', () => {
  let pedidoService: PedidosService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EstoqueModule, CardapioModule, RepositorioInMemoryModule],
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
    }).compile();

    pedidoService = moduleRef.get<PedidosService>(PedidosService);
  });

  it('Pedido Service Instanciado', async () => {
    expect(pedidoService).toBeDefined();
  });

  it('Modulo instanciado', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PedidoModule,
        CardapioModule,
        EstoqueModule,
        RepositorioInMemoryModule,
      ],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
