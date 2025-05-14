import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty()
  @IsMongoId()
  concert_id: string;

  @ApiProperty()
  @IsMongoId()
  seat_type_id: string;

  @ApiProperty()
  @IsMongoId()
  seat_id: string;
}