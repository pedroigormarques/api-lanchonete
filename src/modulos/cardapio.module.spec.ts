import { Test } from '@nestjs/testing';

import { CardapioService } from './../@core/aplicacao/cardapio-service.use-case';
import { IProdutosCardapioRepository } from './../@core/infra/contratos/produtos-cardapio.repository.interface';
import { ProdutosCardapioRepository } from './../@core/infra/db/in-memory/repositorios/produtos-cardapio.repository';
import { CardapioController } from './../controllers/cardapio.controller';
import { CardapioModule } from './cardapio.module';
import { RepositorioInMemoryModule } from './repositorio-in-memory.module';

describe('Cardapio Module', () => {
  let cardapioService: CardapioService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RepositorioInMemoryModule],
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
    }).compile();

    cardapioService = moduleRef.get<CardapioService>(CardapioService);
  });

  it('Cardapio Service Instanciado', async () => {
    expect(cardapioService).toBeDefined();
  });

  it('Modulo instanciado', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CardapioModule, RepositorioInMemoryModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
