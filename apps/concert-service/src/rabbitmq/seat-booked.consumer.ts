import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Seat, SeatDocument } from '../schemas/seat.schema';
import { Model } from 'mongoose';
import { Channel } from 'amqplib';

@Injectable()
export class SeatBookedConsumer implements OnModuleInit {
  private readonly logger = new Logger(SeatBookedConsumer.name);

  constructor(
    @InjectModel(Seat.name)
    private readonly seatModel: Model<SeatDocument>,
  ) {}

  private channel: Channel;

  public setChannel(channel: Channel) {
    this.channel = channel;
  }

  async onModuleInit() {
    if (!this.channel) {
      this.logger.error('RabbitMQ channel not set for SeatBookedConsumer');
      return;
    }

    await this.channel.assertExchange('seat.exchange', 'direct', { durable: true });
    await this.channel.assertQueue('seat.booked.queue', { durable: true });
    await this.channel.bindQueue('seat.booked.queue', 'seat.exchange', 'seat.booked');

    this.channel.consume('seat.booked.queue', async (msg) => {
        if (!msg) {
            this.logger.warn('Received null message');
            return;
        }

        try {
            const payload = JSON.parse(msg.content.toString());
            const { seat_id } = payload;

            await this.seatModel.updateOne(
                { _id: seat_id },
                { $set: { is_booked: true } }
            );

            this.logger.log(`Seat ${seat_id} marked as booked`);
            this.channel.ack(msg);
        } catch (err) {
            const error = err as Error;
            this.logger.error(`[ERROR] Failed to process seat.booked: ${error.message}`);
            this.channel.nack(msg, false, false);
        }
    });

    this.logger.log('SeatBookedConsumer initialized and listening...');
  }
}