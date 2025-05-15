import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  OnModuleDestroy,
  Logger,
  Inject,
  OnModuleInit,
  ConflictException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { isValidObjectId, Model, Types } from 'mongoose';
import { createClient, RedisClientType } from 'redis';
import * as fs from 'fs';
import * as path from 'path';
import { ClientGrpc } from '@nestjs/microservices';
import { Channel } from 'amqplib';
import { firstValueFrom } from 'rxjs';
import chalk from 'chalk';

interface ConcertServiceClient {
  GetConcert(data: { concertId: string }): any;
}

@Injectable()
export class BookingService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType;
  private luaScript: string;
  private concertService: ConcertServiceClient;
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @Inject('CONCERT_PACKAGE') private readonly grpcClient: ClientGrpc,
    @Inject('RABBITMQ_CHANNEL') private readonly rabbitmqChannel: Channel,
  ) {
    this.redisClient = createClient({ url: process.env.REDIS_URL });
    this.redisClient.connect();

    // const scriptPath = path.join(__dirname, 'redis/lua/book_ticket.lua');
    const scriptPath = path.join(process.cwd(), 'apps/booking-service/src/redis/lua/book_ticket.lua');
    this.luaScript = fs.readFileSync(scriptPath, 'utf-8');
  }

  onModuleInit() {
    this.concertService = this.grpcClient.getService<ConcertServiceClient>('ConcertService');
    this.initRabbitConsumer();
  }

  async createBooking(dto: CreateBookingDto, userId: string) {
    const concertId = dto.concert_id;
    const seatTypeId = dto.seat_type_id;

    // Step 1: Verify concert exists via gRPC
    try {
      const concert = await firstValueFrom(
        this.concertService.GetConcert({ concertId }),
      );

      if (!concert) {
        throw new NotFoundException('Concert not found');
      }
    } catch (error) {
        const err = error as Error;
        this.logger.error('[GRPC ERROR]', err.stack || err.message);
        throw new InternalServerErrorException('Failed to fetch concert info');
    }

    // Step 2: Lua Redis concurrency check
    const seatKey = `concert:${concertId}:seat_type:${seatTypeId}:seat:${dto.seat_id}:stock`;
    const userKey = `concert:${concertId}:seat:${dto.seat_id}:user:${userId}`;
    let result: number;

    try {
      const rawResult = await this.redisClient.eval(this.luaScript, {
        keys: [seatKey, userKey],
      });

      result = Number(rawResult);
    } catch (error) {
       const err = error as Error;
       this.logger.error('[REDIS EVAL ERROR]', err.stack || err.message);
       throw new InternalServerErrorException('Redis eval failed');
    }

    if (result !== 1) {
      const errors: Record<number, string> = {
        [-1]: 'You already booked this concert.',
        [-2]: 'Tickets sold out for this seat type.',
      };
      throw new ConflictException(errors[result] || `Unknown Redis error: ${result}`);
    }

    // Step 3: Save to MongoDB
    let booking;
    try {
      booking = new this.bookingModel({
        concert_id: new Types.ObjectId(concertId),
        seat_type_id: new Types.ObjectId(seatTypeId),
        seat_id: new Types.ObjectId(dto.seat_id),
        user_id: new Types.ObjectId(userId),
      });
      await booking.save();

      await this.redisClient.set(seatKey, 0);
      this.logger.log(`[REDIS] Seat ${seatKey} marked as booked (stock = 0)`);
    } catch (error) {
        const err = error as Error;
        this.logger.error('[MONGO SAVE ERROR]', err.stack || err.message);
        throw new InternalServerErrorException('Failed to save booking');
    }

    // Step 4: Publish to RabbitMQ (simulated email confirm)
    try {
      const bookingPayload = {
        booking_id: booking._id.toString(),
        user_id: userId,
        concert_id: concertId,
      };

      const seatBookedPayload = {
        seat_id: dto.seat_id,
        concert_id: concertId,
      };

      this.rabbitmqChannel.publish(
        'booking.exchange',
        'booking.confirmed',
        Buffer.from(JSON.stringify(bookingPayload)),
      );
      this.logger.log(`[RABBITMQ] Published booking.confirmed for ${booking._id}`);

      this.rabbitmqChannel.publish(
        'seat.exchange',
        'seat.booked',
        Buffer.from(JSON.stringify(seatBookedPayload)),
      );
      this.logger.log(`[RABBITMQ] Published seat.booked for seat ${dto.seat_id}`);
    } catch (error) {
        const err = error as Error;
        this.logger.error('[RABBITMQ ERROR]', err.stack || err.message);
        throw new InternalServerErrorException('Error RabbitMQ publising');
    }

    return booking;
  }

  async getUserBookings(userId: string) {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      return await this.bookingModel
        .find({ user_id: new Types.ObjectId(userId), status: 'active' })
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
        const err = error as Error;
        this.logger.error('[REDIS ROLLBACK ERROR]', err.stack || err.message);
        throw new InternalServerErrorException('Error fetching bookings');
    }
  }

  async hasUserBookedConcert(userId: string, concertId: string) {
    const logger = new Logger('BookingService');

    if (!isValidObjectId(userId) || !isValidObjectId(concertId)) {
      throw new BadRequestException('Invalid userId or concertId');
    }

    try {
      const bookings = await this.bookingModel.find({
        user_id: new Types.ObjectId(userId),
        concert_id: new Types.ObjectId(concertId),
        status: 'active',
      }).lean() as (Booking & { _id: any })[];

      if (!bookings?.length) {
        return { hasBooked: false };
      }

      const bookingDetails = bookings.map((booking) => ({
        booking_id: booking._id.toString(),
        seat_id: booking.seat_id?.toString() || null,
        seat_type_id: booking.seat_type_id?.toString() || null,
        status: booking.status,
      }));

      return {
        hasBooked: true,
        bookingDetails
      };
    } catch (error) {
      const err = error as Error;
      logger.error('[hasUserBookedConcert]', err.stack || err.message);
      throw new InternalServerErrorException('Failed to check booking status');
    }
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.bookingModel.findOne({
      _id: new Types.ObjectId(bookingId),
      user_id: new Types.ObjectId(userId),
      status: 'active',
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or already cancelled');
    }

    booking.status = 'cancelled';
    await booking.save();

    try {
      const seatKey = `concert:${booking.concert_id}:seat_type:${booking.seat_type_id}:seat:${booking.seat_id}:stock`;
      const userKey = `concert:${booking.concert_id}:seat:${booking.seat_id}:user:${userId}`;

      // await this.redisClient.incr(seatKey);
      await this.redisClient.set(seatKey, 1);
      await this.redisClient.del(userKey);
    } catch (error) {
        const err = error as Error;
        this.logger.error('[REDIS ROLLBACK ERROR]', err.stack || err.message);
        throw new InternalServerErrorException('Failed to cancel booking');
    }

    return { message: 'Booking cancelled successfully' };
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  async initRabbitConsumer() {
    await this.rabbitmqChannel.assertQueue('booking.email.queue');
    await this.rabbitmqChannel.bindQueue(
      'booking.email.queue',
      'booking.exchange',
      'booking.confirmed'
    );

    this.rabbitmqChannel.consume('booking.email.queue', (msg) => {
      if (!msg) return;
      
      const payload = JSON.parse(msg.content.toString());

      console.log(
        chalk.greenBright(`[EMAIL SIMULATED] Booking ID: ${payload.booking_id}, User: ${payload.user_id}, Concert: ${payload.concert_id}`)
      );

      this.rabbitmqChannel.ack(msg);
    });
  }
}