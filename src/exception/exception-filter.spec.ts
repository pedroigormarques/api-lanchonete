import { BadRequestException as BadRequestCustom } from './../@core/custom-exception/bad-request-exception.error';
import {
  BadRequestException as BadRequestHttp,
  ForbiddenException as ForbiddenHttp,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ErroDetalhadoEHttpExceptionFilter } from './exception-filter';

const mockJson = jest.fn();

const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));

const mockGetResponse = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));

const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: jest.fn().mockImplementation(() => ({
    url: 'mock-url',
  })),
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

describe('Http Exception Filter', () => {
  let httpExceptionFilter: ErroDetalhadoEHttpExceptionFilter;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ErroDetalhadoEHttpExceptionFilter,
          useClass: ErroDetalhadoEHttpExceptionFilter,
        },
      ],
    }).compile();

    httpExceptionFilter = moduleRef.get<ErroDetalhadoEHttpExceptionFilter>(
      ErroDetalhadoEHttpExceptionFilter,
    );
  });

  it('Instanciado', () => {
    expect(httpExceptionFilter).toBeDefined();
  });

  it('Cria um erro corretamente para tipos Http gerais', () => {
    const erro = new ForbiddenHttp('teste');

    httpExceptionFilter.catch(erro, mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(erro.getStatus());
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statsCode: erro.getStatus(),
        path: 'mock-url',
        message: erro.message,
      }),
    );
  });

  it('Cria um erro corretamente para tipo Http com descrição dos erros', () => {
    const erro = new BadRequestHttp('teste');

    jest.clearAllMocks();
    httpExceptionFilter.catch(erro, mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(erro.getStatus());
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statsCode: erro.getStatus(),
        path: 'mock-url',
        message: erro.message,
        errors: erro.getResponse()['message'],
      }),
    );
  });

  it('Cria um erro corretamente para tipo ErroDetalhado sem descrição', () => {
    const erro = new BadRequestCustom();

    jest.clearAllMocks();
    httpExceptionFilter.catch(erro, mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(erro.statusCode);
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statsCode: erro.statusCode,
        path: 'mock-url',
        message: erro.message,
      }),
    );
    expect(mockJson).toHaveBeenCalledWith(
      expect.not.objectContaining({
        error: undefined,
      }),
    );
  });

  it('Cria um erro corretamente para tipo ErroDetalhado com descrição do erro', () => {
    const erro = new BadRequestCustom('teste');

    jest.clearAllMocks();
    httpExceptionFilter.catch(erro, mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(erro.statusCode);
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statsCode: erro.statusCode,
        path: 'mock-url',
        message: erro.message,
        error: erro.erros,
      }),
    );
  });

  it('Cria um erro corretamente para tipo ErroDetalhado com descrição dos erros', () => {
    const erro = new BadRequestCustom(['teste', 'teste2']);

    jest.clearAllMocks();
    httpExceptionFilter.catch(erro, mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();
    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(erro.statusCode);
    expect(mockJson).toBeCalledTimes(1);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statsCode: erro.statusCode,
        path: 'mock-url',
        message: erro.message,
        errors: erro.erros,
      }),
    );
  });
});
