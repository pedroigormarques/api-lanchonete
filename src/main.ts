import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ErroDetalhadoEHttpExceptionFilter } from './exception/exception-filter';
import { MapInterceptor } from './interceptor/map.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ErroDetalhadoEHttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new MapInterceptor());

  await app.listen(3000);
}
bootstrap();
