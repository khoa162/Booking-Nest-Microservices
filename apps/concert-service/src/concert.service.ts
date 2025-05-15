import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Concert, ConcertDocument } from './schemas/concert.schema';
import { Seat, SeatDocument } from './schemas/seat.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ConcertService {
  private readonly logger = new Logger(ConcertService.name);

  constructor(
    @InjectModel(Concert.name) private concertModel: Model<ConcertDocument>,
    @InjectModel(Seat.name) private seatModel: Model<SeatDocument>,
  ) {}

  async getConcertById(concertId: string) {
    try {
      const concert = await this.concertModel.findById(concertId);

      if (!concert) {
        throw new NotFoundException(`Concert with ID ${concertId} not found`);
      }

      return concert;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`[getConcertById]`, err.stack || err.message);
      throw err;
    }
  }

  async getSeatsByConcertAndType(concertId: string, seatTypeIds: string[]) {
     try {
        const concertObj = new Types.ObjectId(concertId);
        const typeObjs = seatTypeIds.map((id) => new Types.ObjectId(id));

        const seats = await this.seatModel.find({
          concert_id: concertObj,
          seat_type_id: { $in: typeObjs },
        });

        if (!seats.length) {
          throw new NotFoundException('No seats found for given concert and seat types');
        }

        return seats;
      } catch (error) {
        const err = error as Error;
        this.logger.error(`[getSeatsByConcertAndType]`, err.stack || err.message);
        throw err;
      }
  }
}