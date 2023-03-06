import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { HttpExceptionFilter } from './exception-filter';

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
  let httpExceptionFilter: HttpExceptionFilter;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: HttpExceptionFilter, useClass: HttpExceptionFilter },
      ],
    }).compile();

    httpExceptionFilter =
      moduleRef.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('Instanciado', () => {
    expect(httpExceptionFilter).toBeDefined();
  });

  it('Cria um erro corretamente para tipos Http gerais ', () => {
    const erro = new ForbiddenException('teste');

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

  it('Cria um erro corretamente para tipos Http gerais ', () => {
    const erro = new BadRequestException('teste');

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
});
