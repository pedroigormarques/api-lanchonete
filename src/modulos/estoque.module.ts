import { Module } from '@nestjs/common';

import { EstoqueService } from './../@core/aplicacao/estoque-service.use-case';
import { IProdutosEstoqueRepository } from './../@core/infra/contratos/produtos-estoque.repository.interface';
import { EstoqueController } from './../controllers/estoque.controller';

@Module({
  controllers: [EstoqueController],
  providers: [
    {
      provide: EstoqueService,
      useFactory: (estoqueRepositorio: IProdutosEstoqueRepository) =>
        EstoqueService.create(estoqueRepositorio),
      inject: ['IProdutosEstoqueRepository'],
    },
  ],
  exports: [EstoqueService],
})
export class EstoqueModule {}
