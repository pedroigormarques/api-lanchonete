import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const message = exception.message;

    const jsonError = {
      statsCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    };

    if (exception instanceof BadRequestException) {
      const erros = exception.getResponse()['message'];
      jsonError['errors'] = erros;
    }

    response.status(status).json(jsonError);
  }
}
