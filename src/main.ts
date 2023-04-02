import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('API - Lanchonete')
    .setDescription(
      'Esta API foi elaborada para estudo e treinamento. ' +
        'As funcionalidades disponibilizadas por ela buscam atender, principalmente, o controle do estoque de várias lanchonetes. ' +
        'Dessa forma, utilizando um sistema de autenticação, é possível interagir com as rotas do estoque, do cardápio e dos pedidos de cada uma das lanchonetes de modo individual e seguro.',
    )
    .setVersion('1.0')
    .addTag('Usuario')
    .addTag('Estoque')
    .addTag('Cardapio')
    .addTag('Pedidos')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
