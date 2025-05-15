import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RedisSyncService } from './redis/redis.sync.service';
import { SeatBookedConsumer } from './rabbitmq/seat-booked.consumer';
import * as amqp from 'amqplib';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50051',
      package: 'concert',
      protoPath: join(process.cwd(), 'protos/concert.proto'),
    },
  });

  await app.startAllMicroservices();

  const redisSync = app.get(RedisSyncService);
  await redisSync.syncSeatStockToRedis();

  const rmqConn = await amqp.connect('amqp://localhost');
  const channel = await rmqConn.createChannel();

  const seatBookedConsumer = app.get(SeatBookedConsumer);
  seatBookedConsumer.setChannel(channel);

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

  await app.listen(3004);
  console.log('Concert Service is running on http://localhost:3004');
}
bootstrap();