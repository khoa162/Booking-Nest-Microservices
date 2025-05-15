import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUserId } from './auth/decorators/current-user-id.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async createBooking(@Body() dto: CreateBookingDto, @CurrentUserId() userId: string) {
    this.logger.log(`POST /bookings by user ${userId}`);
    try {
      return await this.bookingService.createBooking(dto, userId);
    } catch (error) {
      this.logger.error('[POST /bookings]', error);
      throw error;
    }
  }

  @Get()
  async getMyBookings(@CurrentUserId() userId: string) {
    this.logger.log(`GET /bookings by user ${userId}`);
    try {
      return await this.bookingService.getUserBookings(userId);
    } catch (err) {
      this.logger.error('[GET /bookings]', err);
      throw err;
      // throw new InternalServerErrorException('Failed to fetch bookings');
    }
  }

  @Get(':concertId/status')
  async checkBookingStatus(
    @Param('concertId') concertId: string,
    @CurrentUserId() userId: string,
  ) {
    this.logger.log(`GET /bookings/${concertId}/status by user ${userId}`);
    try {
      return await this.bookingService.hasUserBookedConcert(userId, concertId);
    } catch (err) {
      this.logger.error(`[GET /bookings/${concertId}/status]`, err);
      throw err;
      // throw new InternalServerErrorException('Failed to check booking status');
    }
  }

  @Delete(':bookingId')
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUserId() userId: string,
  ) {
    this.logger.log(`DELETE /bookings/${bookingId} by user ${userId}`);
    try {
      return await this.bookingService.cancelBooking(bookingId, userId);
    } catch (err) {
      this.logger.error(`[DELETE /bookings/${bookingId}]`, err);
      throw err;
      // throw new InternalServerErrorException('Failed to cancel booking');
    }
  }
}
