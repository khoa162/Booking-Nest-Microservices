import { Module } from '@nestjs/common';
import { Provider } from '@nestjs/common';
import * as amqp from 'amqplib';

const rabbitmqProvider: Provider = {
  provide: 'RABBITMQ_CHANNEL',
  useFactory: async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();

    await channel.assertExchange('booking.exchange', 'topic', { durable: true });

    return channel;
  },
};

@Module({
  providers: [rabbitmqProvider],
  exports: ['RABBITMQ_CHANNEL'],
})
export class RabbitMQModule {}