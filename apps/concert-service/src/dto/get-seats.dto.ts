import { IsMongoId, IsArray, ArrayNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetSeatsQueryDto {
  @ApiProperty()
  @Transform(({ value }) => value.split(','))
  @IsMongoId({ each: true })
  @IsArray()
  @ArrayNotEmpty()
  seat_type_ids: string[];
}
