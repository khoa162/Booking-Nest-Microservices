import { Injectable, Logger } from '@nestjs/common';
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
      return await this.concertModel.findById(concertId);
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

      return await this.seatModel.find({
        concert_id: concertObj,
        seat_type_id: { $in: typeObjs },
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`[getSeatsByConcertAndType]`, err.stack || err.message);
      throw err;
    }
  }
}