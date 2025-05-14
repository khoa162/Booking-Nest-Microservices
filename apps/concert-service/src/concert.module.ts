import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConcertService } from './concert.service';
import { ConcertController } from './concert.controller';
import { GrpcConcertServer } from './grpc/grpc.concert.server';

import { Concert, ConcertSchema } from './schemas/concert.schema';
import { Seat, SeatSchema } from './schemas/seat.schema';
import { RedisModule } from './redis/redis.module';
import { SeatBookedConsumer } from './rabbitmq/seat-booked.consumer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Concert.name, schema: ConcertSchema },
      { name: Seat.name, schema: SeatSchema },
    ]),
    RedisModule
  ],
  // providers: [ConcertService, GrpcConcertServer, SeatBookedConsumer],
  providers: [ConcertService, SeatBookedConsumer],
  controllers: [ConcertController, GrpcConcertServer],
})
export class ConcertModule {}