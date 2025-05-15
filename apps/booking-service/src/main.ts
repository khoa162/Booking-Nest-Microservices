import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const PORT = process.env.PORT || 3002;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              
      forbidNonWhitelisted: true,  
      transform: true,             
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Booking Service API')
    .setDescription('API for concert ticket booking')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document); 
  await app.listen(PORT);
  console.log(`[Booking-service] Listening on port ${PORT}`);
}
bootstrap();