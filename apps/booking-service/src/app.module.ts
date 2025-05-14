import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from './booking.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { BookingController } from './booking.controller';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { ConcertClientModule } from './concert/concert.client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/booking-service/.env',
    }),
    AuthModule,
    BookingModule,
    DatabaseModule,
    RabbitMQModule,
    ConcertClientModule
  ],
  controllers: [BookingController],
})
export class AppModule {}