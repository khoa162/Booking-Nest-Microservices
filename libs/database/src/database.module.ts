import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mongoose, { Connection } from 'mongoose';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: 'MONGO_CONNECTION',
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<Connection> => {
        const uri = config.get<string>('MONGO_URL');
        if (!uri) throw new Error('MONGO_URL not set');

        try {
          const conn = await mongoose.connect(uri);
          console.log('[MongoDB] Connected to:', conn.connection.name);
          return conn.connection;
        } catch (err) {
          console.error('[MongoDB] Connection error:', err);
          throw err;
        }
      },
    },

    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST') || 'localhost';
        const port = parseInt(config.get<string>('REDIS_PORT') || '6379', 10);

        const redis = new Redis({ host, port });

        redis.on('connect', () => console.log('[Redis] Connected'));
        redis.on('error', (err) => console.error('[Redis] Error:', err));

        return redis;
      },
    },
  ],
  exports: ['MONGO_CONNECTION', 'REDIS_CLIENT'],
})
export class DatabaseModule {}