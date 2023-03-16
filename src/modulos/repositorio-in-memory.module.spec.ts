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
        { provide: 'IUsuarioRepository', useClass: UsuarioRepository },

        {
          provide: ProdutosEstoqueRepository,
          useClass: ProdutosEstoqueRepository,
        },
        {
          provide: 'IProdutosEstoqueRepository',
          useExisting: ProdutosEstoqueRepository,
        },
        {
          provide: ProdutosCardapioRepository,
          useFactory: (estoque: ProdutosEstoqueRepository) =>
            new ProdutosCardapioRepository(estoque),
          inject: [ProdutosEstoqueRepository],
        },
        {
          provide: 'IProdutosCardapioRepository',
          useExisting: ProdutosCardapioRepository,
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
    }).compile();

    usuarioRespository = moduleRef.get<UsuarioRepository>('IUsuarioRepository');
    produtosEstoqueRepository = moduleRef.get<ProdutosEstoqueRepository>(
      'IProdutosEstoqueRepository',
    );
    produtosCardapioRepository = moduleRef.get<ProdutosCardapioRepository>(
      'IProdutosCardapioRepository',
    );
    pedidosRepository = moduleRef.get<PedidosRepository>('IPedidosRepository');
    pedidosFechadosRepository = moduleRef.get<PedidosFechadosRepository>(
      'IPedidosFechadosRepository',
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
