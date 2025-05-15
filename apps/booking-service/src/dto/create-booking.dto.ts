import { IsMongoId, IsDefined, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  @IsMongoId()
  concert_id: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  @IsMongoId()
  seat_type_id: string;

  @IsDefined()
  @IsNotEmpty()
  @ApiProperty()
  @IsMongoId()
  seat_id: string;
}