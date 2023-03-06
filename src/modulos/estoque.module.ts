import { Module } from '@nestjs/common';

import { EstoqueService } from './../@core/aplicacao/estoque-service.use-case';
import { IProdutosEstoqueRepository } from './../@core/infra/contratos/produtos-estoque.repository.interface';
import { ProdutosEstoqueRepository } from './../@core/infra/db/in-memory/repositorios/produtos-estoque.repository';
import { EstoqueController } from './../controllers/estoque.controller';

@Module({
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
})
export class EstoqueModule {}
