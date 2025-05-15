import { IsMongoId, IsDefined, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetConcertParamDto {
  @IsNotEmpty()
  @IsDefined()
  @ApiProperty()
  @IsMongoId()
  id: string;
}