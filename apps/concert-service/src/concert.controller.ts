import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConcertService } from './concert.service';
import { GetConcertParamDto } from './dto/get-concert.dto';
import { GetSeatsQueryDto } from './dto/get-seats.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('concerts')
export class ConcertController {
  private readonly logger = new Logger(ConcertController.name);

  constructor(private readonly concertService: ConcertService) {}

  @Get(':id')
  async getConcert(@Param() params: GetConcertParamDto) {
    const concertId = params.id;
    this.logger.log(`GET /concerts/${concertId}`);

    try {
      const concert = await this.concertService.getConcertById(concertId);
      if (!concert) throw new NotFoundException('Concert not found');
      return concert;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`[GET /concerts/${concertId}]`, err.stack || err.message);
      throw new InternalServerErrorException('Failed to fetch concert');
    }
  }

  @Get(':id/seats')
  async getSeats(
    @Param() params: GetConcertParamDto,
    @Query() query: GetSeatsQueryDto,
  ) {
    const concertId = params.id;
    this.logger.log(`GET /concerts/${concertId}/seats`);

    try {
      const seats = await this.concertService.getSeatsByConcertAndType(
        concertId,
        query.seat_type_ids,
      );
      return seats;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`[GET /concerts/${concertId}/seats]`, err.stack || err.message);
      throw new InternalServerErrorException('Failed to fetch seats');
    }
  }
}