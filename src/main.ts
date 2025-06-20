import { NestFactory } from '@nestjs/core';
import { AppModule } from './infra/nestjs/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configuração global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Alterado para false para evitar problemas com propriedades extras
    }),
  );

  // Configuração de CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Agendamento')
    .setDescription('API para sistema de agendamento de serviços')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Configuração do Scalar API Reference
  app.use(
    '/api/reference',
    apiReference({
      content: document,
      theme: 'solarized', // ou 'purple', 'dark', etc.
      layout: 'modern',
      // Outras opções podem ser configuradas conforme necessário
    }),
  );

  // Iniciar a aplicação na porta definida
  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
