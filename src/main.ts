import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones para mejor manejo de errores
  app.useGlobalFilters(new HttpExceptionFilter());

  // Habilitar CORS
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('API SIGA')
    .setDescription('Documentación de la API SIGA')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log('🚀 API SIGA corriendo en http://localhost:3000');
  console.log('📄 Documentación Swagger en http://localhost:3000/api/docs');
}
bootstrap();