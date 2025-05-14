import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ConcertModule } from './concert.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/concert-service/.env',
    }),
    DatabaseModule,
    ConcertModule,
    AuthModule
  ],
})
export class AppModule {}