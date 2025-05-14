import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Concert, ConcertSchema } from '../schemas/concert.schema';
import { Seat, SeatSchema } from '../schemas/seat.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URL');
        console.log('[🔥 Concert Mongo URI]', uri);

        return {
          uri,
          dbName: 'concert_db',
        };
      },
    }),
    MongooseModule.forFeature([
      { name: Concert.name, schema: ConcertSchema },
      { name: Seat.name, schema: SeatSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}