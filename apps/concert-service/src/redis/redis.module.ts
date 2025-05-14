import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisService } from './redis.service';
import { RedisSyncService } from './redis.sync.service';
import { Concert, ConcertSchema } from '../schemas/concert.schema';
import { Seat, SeatSchema } from '../schemas/seat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Concert.name, schema: ConcertSchema },
      { name: Seat.name, schema: SeatSchema },
    ]),
  ],
  providers: [RedisService, RedisSyncService],
  exports: [RedisService, RedisSyncService],
})
export class RedisModule {}