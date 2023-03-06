import { Global, Module } from '@nestjs/common';

import { PedidosFechadosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos-fechados.repository';
import { PedidosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos.repository';
import { ProdutosCardapioRepository } from './../@core/infra/db/in-memory/repositorios/produtos-cardapio.repository';
import { ProdutosEstoqueRepository } from './../@core/infra/db/in-memory/repositorios/produtos-estoque.repository';
import { UsuarioRepository } from './../@core/infra/db/in-memory/repositorios/usuario.repository';

@Global()
@Module({
  providers: [
    { provide: UsuarioRepository, useClass: UsuarioRepository },
    { provide: ProdutosEstoqueRepository, useClass: ProdutosEstoqueRepository },
    {
      provide: ProdutosCardapioRepository,
      useFactory: (estoque: ProdutosEstoqueRepository) =>
        new ProdutosCardapioRepository(estoque),
      inject: [ProdutosEstoqueRepository],
    },
    {
      provide: PedidosRepository,
      useFactory: (cardapio: ProdutosCardapioRepository) =>
        new PedidosRepository(cardapio),
      inject: [ProdutosCardapioRepository],
    },
    {
      provide: PedidosFechadosRepository,
      useClass: PedidosFechadosRepository,
    },
  ],
  exports: [
    UsuarioRepository,
    ProdutosEstoqueRepository,
    ProdutosCardapioRepository,
    PedidosRepository,
    PedidosFechadosRepository,
  ],
})
export class RepositorioInMemoryModule {}
