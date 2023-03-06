import { Module } from '@nestjs/common';

import { CardapioService } from './../@core/aplicacao/cardapio-service.use-case';
import { IProdutosCardapioRepository } from './../@core/infra/contratos/produtos-cardapio.repository.interface';
import { ProdutosCardapioRepository } from './../@core/infra/db/in-memory/repositorios/produtos-cardapio.repository';
import { CardapioController } from './../controllers/cardapio.controller';

@Module({
  controllers: [CardapioController],
  providers: [
    {
      provide: CardapioService,
      useFactory: (cardapioRepositorio: IProdutosCardapioRepository) =>
        CardapioService.create(cardapioRepositorio),
      inject: [ProdutosCardapioRepository],
    },
  ],
  exports: [CardapioService],
})
export class CardapioModule {}
