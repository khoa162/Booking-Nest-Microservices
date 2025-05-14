export interface SeatType {
  id: string;
  name: string;
  price: number;
}

export interface Concert {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
  seat_types: SeatType[];
}

export interface ConcertGrpcService {
  GetConcert(data: { concertId: string }): Promise<Concert>;
}