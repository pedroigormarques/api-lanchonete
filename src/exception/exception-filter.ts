import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErroDetalhado } from './../@core/custom-exception/exception-detalhado.error';

@Catch(ErroDetalhado, HttpException)
export class ErroDetalhadoEHttpExceptionFilter implements ExceptionFilter {
  catch(exception: ErroDetalhado | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const path = ctx.getRequest<Request>().url;

    const jsonError =
      exception instanceof ErroDetalhado
        ? this.ErroDetalhadoParaJson(exception, path)
        : this.httpExceptionParaJson(exception, path);

    response.status(jsonError.statsCode).json(jsonError);
  }

  private ErroDetalhadoParaJson(erro: ErroDetalhado, path: string) {
    const status = erro.statusCode;
    const message = erro.message;

    const erroJson = {
      statsCode: status,
      timestamp: new Date().toISOString(),
      path: path,
      message: message,
    };

    if (typeof erro.erros !== 'undefined') {
      if (typeof erro.erros === 'string') erroJson['error'] = erro.erros;
      else erroJson['errors'] = erro.erros;
    }

    return erroJson;
  }

  private httpExceptionParaJson(erro: HttpException, path: string) {
    const status = erro.getStatus();
    const message = erro.message;

    const erroJson = {
      statsCode: status,
      timestamp: new Date().toISOString(),
      path: path,
      message: message,
    };

    if (erro instanceof BadRequestException) {
      const erros = erro.getResponse()['message'];
      erroJson['errors'] = erros;
    }

    return erroJson;
  }
}
