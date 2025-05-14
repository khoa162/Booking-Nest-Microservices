import { Injectable, Controller } from '@nestjs/common';
import { ConcertService } from '../concert.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class GrpcConcertServer {
  constructor(private readonly concertService: ConcertService) {}

  @GrpcMethod('ConcertService', 'GetConcert')
  async GetConcert(data: { concertId: string }) {
    const concert = await this.concertService.getConcertById(data.concertId);
    if (!concert) return null;

    return {
      id: concert._id.toString(),
      name: concert.name,
      description: concert.description || '',
      start_time: concert.start_time || '',
      end_time: concert.end_time || '',
      seat_types: concert.seat_types.map((type) => ({
        id: type._id.toString(),
        name: type.name,
        price: type.price,
      })),
    };
  }
}