import { Test } from '@nestjs/testing';

import { PedidosFechadosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos-fechados.repository';
import { PedidosRepository } from './../@core/infra/db/in-memory/repositorios/pedidos.repository';
import { ProdutosCardapioRepository } from './../@core/infra/db/in-memory/repositorios/produtos-cardapio.repository';
import { ProdutosEstoqueRepository } from './../@core/infra/db/in-memory/repositorios/produtos-estoque.repository';
import { UsuarioRepository } from './../@core/infra/db/in-memory/repositorios/usuario.repository';
import { RepositorioInMemoryModule } from './repositorio-in-memory.module';

describe('Repositorio In Memory Module', () => {
  let usuarioRespository: UsuarioRepository;
  let produtosEstoqueRepository: ProdutosEstoqueRepository;
  let produtosCardapioRepository: ProdutosCardapioRepository;
  let pedidosRepository: PedidosRepository;
  let pedidosFechadosRepository: PedidosFechadosRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: UsuarioRepository, useClass: UsuarioRepository },
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
    }).compile();

    usuarioRespository = moduleRef.get<UsuarioRepository>(UsuarioRepository);
    produtosEstoqueRepository = moduleRef.get<ProdutosEstoqueRepository>(
      ProdutosEstoqueRepository,
    );
    produtosCardapioRepository = moduleRef.get<ProdutosCardapioRepository>(
      ProdutosCardapioRepository,
    );
    pedidosRepository = moduleRef.get<PedidosRepository>(PedidosRepository);
    pedidosFechadosRepository = moduleRef.get<PedidosFechadosRepository>(
      PedidosFechadosRepository,
    );
  });

  it('Usuario Repository Instanciado', async () => {
    expect(usuarioRespository).toBeDefined();
  });

  it('Produtos Estoque Repository Instanciado', async () => {
    expect(produtosEstoqueRepository).toBeDefined();
  });

  it('Produtos Cardapio Repository Instanciado', async () => {
    expect(produtosCardapioRepository).toBeDefined();
    expect((produtosCardapioRepository as any).estoqueRepository).toBeDefined();
  });

  it('Pedidos Repository Instanciado', async () => {
    expect(pedidosRepository).toBeDefined();
    expect((pedidosRepository as any).cardapioRepositorio).toBeDefined();
  });

  it('Pedidos Fechados Repository Instanciado', async () => {
    expect(pedidosFechadosRepository).toBeDefined();
  });

  it('Modulo instanciado', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RepositorioInMemoryModule],
    }).compile();

    expect(moduleRef).toBeDefined();
  });
});
