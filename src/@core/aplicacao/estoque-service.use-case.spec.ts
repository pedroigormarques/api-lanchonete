import { DadosBaseProdutoEstoque } from './../dominio/produto-estoque.entity';
import { ProdutoEstoque } from '../dominio/produto-estoque.entity';
import { GeradorDeObjetos } from './../../test/gerador-objetos.faker';
import { IProdutosEstoqueRepository } from '../infra/contratos/produtos-estoque.repository.interface';
import { Test } from '@nestjs/testing';
import { ProdutosEstoqueRepository } from './../infra/db/in-memory/repositorios/produtos-estoque.repository';
import { EstoqueService } from './estoque-service.use-case';

describe('Estoque Service', () => {
  let estoqueService: EstoqueService;
  let estoqueRepositorio: ProdutosEstoqueRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: EstoqueService,
          useFactory: async (estoqueRepositorio: IProdutosEstoqueRepository) =>
            await EstoqueService.create(estoqueRepositorio),
          inject: [ProdutosEstoqueRepository],
        },
        {
          provide: ProdutosEstoqueRepository,
          useClass: ProdutosEstoqueRepository,
        },
      ],
    }).compile();

    estoqueRepositorio = moduleRef.get<ProdutosEstoqueRepository>(
      ProdutosEstoqueRepository,
    );
    estoqueService = moduleRef.get<EstoqueService>(EstoqueService);
  });

  it('Instanciado', () => {
    expect(estoqueRepositorio).toBeDefined();
    expect(estoqueService).toBeDefined();
  });

  describe('Cadastrar Produto Estoque', () => {
    it('Retorno de produto registrado ao passar dados corretos', async () => {
      const produtoResposta = GeradorDeObjetos.criarProdutoEstoque(true);

      jest
        .spyOn(estoqueRepositorio, 'cadastrarProduto')
        .mockResolvedValue(produtoResposta);

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      const dadosCriacao = {} as DadosBaseProdutoEstoque;
      dadosCriacao.descricao = produtoResposta.descricao;
      dadosCriacao.nomeProduto = produtoResposta.nomeProduto;
      dadosCriacao.quantidade = produtoResposta.quantidade;
      dadosCriacao.unidade = produtoResposta.unidade;

      const resposta = await estoqueService.cadastrarProdutoEstoque(
        dadosCriacao,
      );

      expect(resposta).toBeInstanceOf(ProdutoEstoque);
      expect(resposta.id).toBeDefined();
      expect(resposta.descricao).toEqual(dadosCriacao.descricao);
      expect(resposta.nomeProduto).toEqual(dadosCriacao.nomeProduto);
      expect(resposta.quantidade).toEqual(dadosCriacao.quantidade);
      expect(resposta.unidade).toEqual(dadosCriacao.unidade);

      expect(estoqueService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro ao passar dados insuficientes ou dados incorretos', async () => {
      jest
        .spyOn(estoqueRepositorio, 'cadastrarProduto')
        .mockResolvedValue(null);
      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        estoqueService.cadastrarProdutoEstoque({} as DadosBaseProdutoEstoque),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.cadastrarProduto).toBeCalledTimes(0);
      expect(estoqueService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Atualizar Produto Estoque', () => {
    it('Retorno de produto atualizado ao passar alguns dados corretos', async () => {
      const produtoBanco = GeradorDeObjetos.criarProdutoEstoque(true);

      jest
        .spyOn(estoqueRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      jest
        .spyOn(estoqueRepositorio, 'atualizarProduto')
        .mockImplementation(async (id, produto) => new ProdutoEstoque(produto));

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      const dadosAtualizacao = {
        quantidade: 25,
        nomeProduto: 'teste',
      } as Partial<DadosBaseProdutoEstoque>;

      const resposta = await estoqueService.atualizarProdutoEstoque(
        produtoBanco.id,
        dadosAtualizacao,
      );

      expect(resposta).toBeInstanceOf(ProdutoEstoque);
      expect(resposta.id).toEqual(produtoBanco.id);
      expect(resposta.descricao).toEqual(produtoBanco.descricao);
      expect(resposta.unidade).toEqual(produtoBanco.unidade);
      expect(resposta.quantidade).toEqual(dadosAtualizacao.quantidade);
      expect(resposta.nomeProduto).toEqual(dadosAtualizacao.nomeProduto);

      expect(estoqueService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro ao tentar atualizar id não existente', async () => {
      jest
        .spyOn(estoqueRepositorio, 'carregarProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest
        .spyOn(estoqueRepositorio, 'atualizarProduto')
        .mockResolvedValue(null);

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        estoqueService.atualizarProdutoEstoque(
          'a',
          {} as DadosBaseProdutoEstoque,
        ),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(estoqueRepositorio.atualizarProduto).toBeCalledTimes(0);
      expect(estoqueService.emitirAlteracao).toBeCalledTimes(0);
    });

    it('Erro no processo de atualização', async () => {
      const produtoAux = GeradorDeObjetos.criarProdutoEstoque(true);

      jest
        .spyOn(estoqueRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoAux);

      jest
        .spyOn(estoqueRepositorio, 'atualizarProduto')
        .mockRejectedValue(new Error('erro'));

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        estoqueService.atualizarProdutoEstoque(
          produtoAux.id,
          {} as DadosBaseProdutoEstoque,
        ),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.carregarProduto).toBeCalledTimes(1);
      expect(estoqueRepositorio.atualizarProduto).toBeCalledTimes(1);
      expect(estoqueService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Atualizar Produtos Estoque', () => {
    it('Retorno de produtos atualizados ao passar dados válidos', async () => {
      const listaProdutos = [
        GeradorDeObjetos.criarProdutoEstoque(true),
        GeradorDeObjetos.criarProdutoEstoque(true),
      ];

      jest
        .spyOn(estoqueRepositorio, 'atualizarProdutos')
        .mockImplementation(async (produtos) =>
          produtos.map((p) => new ProdutoEstoque(p)),
        );

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      const resposta = await estoqueService.atualizarProdutosEstoque(
        listaProdutos,
      );

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(listaProdutos[0]);
      expect(resposta).toContainEqual(listaProdutos[1]);

      expect(estoqueRepositorio.atualizarProdutos).toBeCalledTimes(1);
      expect(estoqueService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro no processo de atualização', async () => {
      jest
        .spyOn(estoqueRepositorio, 'atualizarProdutos')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      const listaProdutos = [
        GeradorDeObjetos.criarProdutoEstoque(true),
        GeradorDeObjetos.criarProdutoEstoque(true),
      ];

      await expect(
        estoqueService.atualizarProdutosEstoque(listaProdutos),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.atualizarProdutos).toBeCalledTimes(1);
      expect(estoqueService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Carregar Produto Estoque', () => {
    it('Retorno de produto ao inserir id válido', async () => {
      const produtoBanco = GeradorDeObjetos.criarProdutoEstoque(true);

      jest
        .spyOn(estoqueRepositorio, 'carregarProduto')
        .mockResolvedValue(produtoBanco);

      const resposta = await estoqueService.carregarProdutoEstoque(
        produtoBanco.id,
      );

      expect(resposta).toBeInstanceOf(ProdutoEstoque);
      expect(resposta).toEqual(produtoBanco);

      expect(estoqueRepositorio.carregarProduto).toBeCalledTimes(1);
    });

    it('Erro ao não encontrar produto com o id passado', async () => {
      jest
        .spyOn(estoqueRepositorio, 'carregarProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      await expect(
        estoqueService.carregarProdutoEstoque('a'),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.carregarProduto).toBeCalledTimes(1);
    });
  });

  describe('Carregar Produtos Estoques', () => {
    it('Retorno de produtos', async () => {
      const produtoBanco1 = GeradorDeObjetos.criarProdutoEstoque(true);
      const produtoBanco2 = GeradorDeObjetos.criarProdutoEstoque(true);

      jest
        .spyOn(estoqueRepositorio, 'carregarProdutos')
        .mockResolvedValue([produtoBanco1, produtoBanco2]);

      const resposta = await estoqueService.carregarProdutosEstoque();

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(2);
      expect(resposta).toContainEqual(produtoBanco1);
      expect(resposta).toContainEqual(produtoBanco2);

      expect(estoqueRepositorio.carregarProdutos).toBeCalledTimes(1);
    });

    it('Retorno de produtos ao inserir lista com ids válidos', async () => {
      const produtoBanco1 = GeradorDeObjetos.criarProdutoEstoque(true);
      const produtoBanco2 = GeradorDeObjetos.criarProdutoEstoque(true);

      jest
        .spyOn(estoqueRepositorio, 'carregarProdutos')
        .mockImplementation(async (idLista) => {
          return [produtoBanco1, produtoBanco2].filter((pe) =>
            idLista.includes(pe.id),
          );
        });

      const resposta = await estoqueService.carregarProdutosEstoque([
        produtoBanco2.id,
      ]);

      expect(resposta).toBeInstanceOf(Array<ProdutoEstoque>);
      expect(resposta.length).toEqual(1);
      expect(resposta).toContainEqual(produtoBanco2);

      expect(estoqueRepositorio.carregarProdutos).toBeCalledTimes(1);
    });

    it('Erro ao não encontrar produto com um dos ids passados', async () => {
      jest
        .spyOn(estoqueRepositorio, 'carregarProdutos')
        .mockRejectedValue(erroIdNaoEncontrado());

      await expect(
        estoqueService.carregarProdutosEstoque(['a']),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.carregarProdutos).toBeCalledTimes(1);
    });
  });

  describe('Remover Produto Estoque', () => {
    it('Remoção do produto ao inserir id válido', async () => {
      jest.spyOn(estoqueRepositorio, 'removerProduto').mockResolvedValue(null);

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      await estoqueService.removerProdutoEstoque('a');
      expect(estoqueRepositorio.removerProduto).toBeCalledTimes(1);
      expect(estoqueService.emitirAlteracao).toBeCalledTimes(1);
    });

    it('Erro no processo de remoção', async () => {
      jest
        .spyOn(estoqueRepositorio, 'removerProduto')
        .mockRejectedValue(erroIdNaoEncontrado());

      jest.spyOn(estoqueService, 'emitirAlteracao').mockReturnValue(null);

      await expect(
        estoqueService.removerProdutoEstoque('a'),
      ).rejects.toThrowError();

      expect(estoqueRepositorio.removerProduto).toBeCalledTimes(1);
      expect(estoqueService.emitirAlteracao).toBeCalledTimes(0);
    });
  });

  describe('Atualizar Produtos Com Gastos', () => {
    it('Atualização feita corretamente', async () => {
      const lista = [
        GeradorDeObjetos.criarProdutoEstoque(true),
        GeradorDeObjetos.criarProdutoEstoque(true),
      ];
      lista[0].quantidade = 100;
      lista[1].quantidade = 100;

      let produtosAtualizados: ProdutoEstoque[];

      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockResolvedValue(lista);

      jest
        .spyOn(estoqueService, 'atualizarProdutosEstoque')
        .mockImplementation(async (p) => {
          produtosAtualizados = p;
          return p;
        });

      const gasto = new Map<string, number>();
      gasto.set(lista[0].id, 5);
      gasto.set(lista[1].id, 45);

      await estoqueService.atualizarProdutosComGastos(gasto);

      expect(produtosAtualizados).toBeDefined();
      expect(produtosAtualizados[0].quantidade).toEqual(95);
      expect(produtosAtualizados[1].quantidade).toEqual(55);

      expect(estoqueService.carregarProdutosEstoque).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosEstoque).toBeCalledTimes(1);
    });

    it('Erro por algum produto ficar com quantidade negativa', async () => {
      const lista = [GeradorDeObjetos.criarProdutoEstoque(true)];
      lista[0].quantidade = 1;

      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockResolvedValue(lista);

      jest
        .spyOn(estoqueService, 'atualizarProdutosEstoque')
        .mockResolvedValue(null);

      const gasto = new Map<string, number>();
      gasto.set(lista[0].id, 5);

      await expect(
        estoqueService.atualizarProdutosComGastos(gasto),
      ).rejects.toThrowError();

      expect(estoqueService.carregarProdutosEstoque).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosEstoque).toBeCalledTimes(0);
    });

    it('Erro por não conseguir carregar os produtos', async () => {
      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockRejectedValue(new Error('erro'));

      jest
        .spyOn(estoqueService, 'atualizarProdutosEstoque')
        .mockResolvedValue(null);

      const gasto = new Map<string, number>();
      gasto.set('a', 5);

      await expect(
        estoqueService.atualizarProdutosComGastos(gasto),
      ).rejects.toThrowError();

      expect(estoqueService.carregarProdutosEstoque).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosEstoque).toBeCalledTimes(0);
    });

    it('Erro ao tentar atualizar o repositorio', async () => {
      const lista = [GeradorDeObjetos.criarProdutoEstoque(true)];
      lista[0].quantidade = 100;

      const gasto = new Map<string, number>();
      gasto.set(lista[0].id, 5);

      jest
        .spyOn(estoqueService, 'carregarProdutosEstoque')
        .mockResolvedValue(lista);

      jest
        .spyOn(estoqueService, 'atualizarProdutosEstoque')
        .mockRejectedValue(new Error('erro'));

      await expect(
        estoqueService.atualizarProdutosComGastos(gasto),
      ).rejects.toThrowError();

      expect(estoqueService.carregarProdutosEstoque).toBeCalledTimes(1);
      expect(estoqueService.atualizarProdutosEstoque).toBeCalledTimes(1);
    });
  });
});

function erroIdNaoEncontrado() {
  return new Error('Produto com o id passado não foi encontrado');
}
