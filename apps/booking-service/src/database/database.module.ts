import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Booking, BookingSchema } from '../schemas/booking.schema';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: 'apps/booking-service/.env',
    // }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URL');
        console.log('[🔥 Booking Mongo URI]', uri);

        return {
          uri,
          dbName: 'booking_db',
        };
      },
    }),
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}