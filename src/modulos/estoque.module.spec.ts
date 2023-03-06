import { Test } from '@nestjs/testing';

import { EstoqueService } from './../@core/aplicacao/estoque-service.use-case';
import { IProdutosEstoqueRepository } from './../@core/infra/contratos/produtos-estoque.repository.interface';
import { ProdutosEstoqueRepository } from './../@core/infra/db/in-memory/repositorios/produtos-estoque.repository';
import { EstoqueController } from './../controllers/estoque.controller';
import { EstoqueModule } from './estoque.module';
import { RepositorioInMemoryModule } from './repositorio-in-memory.module';

describe('Estoque Module', () => {
  let estoqueService: EstoqueService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RepositorioInMemoryModule],
      controllers: [EstoqueController],
      providers: [
        {
          provide: EstoqueService,
          useFactory: (estoqueRepositorio: IProdutosEstoqueRepository) =>
            new EstoqueService(estoqueRepositorio),
          inject: [ProdutosEstoqueRepository],
        },
      ],
      exports: [EstoqueService],
    }).compile();

    estoqueService = moduleRef.get<EstoqueService>(EstoqueService);
  });

  it('Estoque Service Instanciado', async () => {
    expect(estoqueService).toBeDefined();
  });

  it('Modulo instanciado', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EstoqueModule, RepositorioInMemoryModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
