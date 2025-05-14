import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SeatDocument = HydratedDocument<Seat>;

@Schema({ timestamps: true })
export class Seat {
  @Prop({ type: Types.ObjectId, required: true })
  concert_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  seat_type_id: Types.ObjectId;

  @Prop({ required: true })
  seat_position: string;

  @Prop({ default: false })
  is_booked: boolean;
}

export const SeatSchema = SchemaFactory.createForClass(Seat);