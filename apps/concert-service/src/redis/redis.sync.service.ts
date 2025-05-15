import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Concert, ConcertDocument } from '../schemas/concert.schema';
import { Seat, SeatDocument } from '../schemas/seat.schema';
import { RedisService } from './redis.service';

@Injectable()
export class RedisSyncService {
  private readonly logger = new Logger(RedisSyncService.name);

  constructor(
    @InjectModel(Concert.name) private readonly concertModel: Model<ConcertDocument>,
    @InjectModel(Seat.name) private readonly seatModel: Model<SeatDocument>,
    private readonly redisService: RedisService,
  ) {}

  async syncSeatStockToRedis(): Promise<void> {
    const client = this.redisService.getClient();
    const concerts = await this.concertModel.find();

    for (const concert of concerts) {
      const seats = await this.seatModel.find({ concert_id: concert._id });

      for (const seat of seats) {
        const key = `concert:${seat.concert_id}:seat_type:${seat.seat_type_id}:seat:${seat._id}:stock`;
        const value = seat.is_booked ? 0 : 1;

        await client.set(key, value);
        this.logger.log(`Synced Redis key ${key} = ${value}`);
      }
    }

    this.logger.log('Finished syncing seat stock to Redis');
  }
}