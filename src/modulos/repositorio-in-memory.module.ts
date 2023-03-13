import { Global, Module } from '@nestjs/common';

import { PedidosFechadosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos-fechados.repository';
import { PedidosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos.repository';
import { ProdutosCardapioRepository } from './../@core/infra/db/in-memory/repositorios/produtos-cardapio.repository';
import { ProdutosEstoqueRepository } from './../@core/infra/db/in-memory/repositorios/produtos-estoque.repository';
import { UsuarioRepository } from './../@core/infra/db/in-memory/repositorios/usuario.repository';

@Global()
@Module({
  providers: [
    { provide: 'IUsuarioRepository', useClass: UsuarioRepository },
    {
      provide: 'IProdutosEstoqueRepository',
      useClass: ProdutosEstoqueRepository,
    },
    {
      provide: ProdutosEstoqueRepository,
      useClass: ProdutosEstoqueRepository,
    },
    {
      provide: ProdutosCardapioRepository,
      useFactory: (estoque: ProdutosEstoqueRepository) =>
        new ProdutosCardapioRepository(estoque),
      inject: [ProdutosEstoqueRepository],
    },
    {
      provide: 'IProdutosCardapioRepository',
      useFactory: (estoque: ProdutosEstoqueRepository) =>
        new ProdutosCardapioRepository(estoque),
      inject: [ProdutosEstoqueRepository],
    },
    {
      provide: 'IPedidosRepository',
      useFactory: (cardapio: ProdutosCardapioRepository) =>
        new PedidosRepository(cardapio),
      inject: [ProdutosCardapioRepository],
    },
    {
      provide: 'IPedidosFechadosRepository',
      useClass: PedidosFechadosRepository,
    },
  ],
  exports: [
    'IUsuarioRepository',
    'IProdutosEstoqueRepository',
    'IProdutosCardapioRepository',
    'IPedidosRepository',
    'IPedidosFechadosRepository',
  ],
})
export class RepositorioInMemoryModule {}
