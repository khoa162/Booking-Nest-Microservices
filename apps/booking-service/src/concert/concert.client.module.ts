import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CONCERT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'concert',
          protoPath: join(process.cwd(), 'protos/concert.proto'),
          url: process.env.CONCERT_GRPC_URL || 'localhost:50051',
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class ConcertClientModule {}