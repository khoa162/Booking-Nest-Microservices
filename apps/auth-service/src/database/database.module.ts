import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ 
        isGlobal: true,
        envFilePath: 'apps/auth-service/.env' 
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
            const uri = config.get<string>('MONGO_URL');
            console.log('[🔥Auth Mongo URI]', uri);

            return {
                uri,
                dbName: 'auth_db',
            };
        },
    }),
  ],
})
export class DatabaseModule {}