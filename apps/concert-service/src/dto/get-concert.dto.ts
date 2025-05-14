import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetConcertParamDto {
  @ApiProperty()
  @IsMongoId()
  id: string;
}