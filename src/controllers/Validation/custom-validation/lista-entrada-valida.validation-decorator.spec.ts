import { isPositive, isUUID, isInt } from 'class-validator';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { GeradorDeObjetos } from '../../../test/gerador-objetos.faker';
import { CreateProdutoCardapioDto } from '../produto-cardapio.dto';
import { mapaPossuiDadosValidos } from './lista-entrada-valida.validation-decorator';

describe('Teste do validador de lista de entrada', () => {
  it('Teste válido para o decorator já em uso', async () => {
    const target = new ValidationPipe({
      whitelist: true,
      transform: true,
    });

    const objeto = GeradorDeObjetos.criarProdutoCardapio();

    const dados = {};
    dados['categoria'] = objeto.categoria;
    dados['descricao'] = objeto.descricao;
    dados['idUsuario'] = objeto.idUsuario;
    dados['nomeProduto'] = objeto.nomeProduto;
    dados['preco'] = objeto.preco;
    dados['composicao'] = [...objeto.composicao.entries()];

    const aux = JSON.parse(JSON.stringify(dados));

    const resposta = await target.transform(aux, {
      type: 'body',
      metatype: CreateProdutoCardapioDto,
    });

    expect(resposta).toBeInstanceOf(CreateProdutoCardapioDto);
    expect(resposta.composicao).toBeInstanceOf(Map);
  });

  it('Teste inválido para o decorator já em uso', async () => {
    const target = new ValidationPipe({
      whitelist: true,
      transform: true,
    });

    const objeto = GeradorDeObjetos.criarProdutoCardapio();

    const dados = {};
    dados['categoria'] = objeto.categoria;
    dados['descricao'] = objeto.descricao;
    dados['idUsuario'] = objeto.idUsuario;
    dados['nomeProduto'] = objeto.nomeProduto;
    dados['preco'] = objeto.preco;
    dados['composicao'] = [1, 2, 3, 4];

    const aux = JSON.parse(JSON.stringify(dados));

    await expect(
      target.transform(aux, {
        type: 'body',
        metatype: CreateProdutoCardapioDto,
      }),
    ).rejects.toThrowError(BadRequestException);
  });

  it('Verificar caso verdadeiro ao passar estrutura válida', () => {
    const composicaoValida = GeradorDeObjetos.criarProdutoCardapio().composicao;

    const resultado = mapaPossuiDadosValidos(
      composicaoValida,
      [isUUID],
      [isInt, isPositive],
    );

    expect(resultado).toBeTruthy();
  });

  it('Verificar caso falso ao passar estrutura invalida - outro tipo de objeto', () => {
    const composicaoInvalida = 'teste';

    const resultado = mapaPossuiDadosValidos(
      composicaoInvalida,
      [isUUID],
      [isInt, isPositive],
    );

    expect(resultado).toBeFalsy();
  });

  it('Verificar caso falso ao passar estrutura invalida - chaves de outro tipo', () => {
    const composicaoInvalida = new Map([
      [1, 2],
      [2, 3],
    ]);

    const resultado = mapaPossuiDadosValidos(
      composicaoInvalida,
      [isUUID],
      [isInt, isPositive],
    );

    expect(resultado).toBeFalsy();
  });

  it('Verificar caso falso ao passar estrutura invalida - valor não inteiro', () => {
    const composicaoInvalida = new Map([['1', 2.1]]);

    const resultado = mapaPossuiDadosValidos(
      composicaoInvalida,
      [isUUID],
      [isInt, isPositive],
    );

    expect(resultado).toBeFalsy();
  });

  it('Verificar caso falso ao passar estrutura invalida - valor negativo', () => {
    const composicaoInvalida = new Map([['1', -2]]);

    const resultado = mapaPossuiDadosValidos(
      composicaoInvalida,
      [isUUID],
      [isInt, isPositive],
    );

    expect(resultado).toBeFalsy();
  });
});
