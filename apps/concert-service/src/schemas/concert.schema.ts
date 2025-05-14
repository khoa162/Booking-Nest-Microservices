import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConcertDocument = HydratedDocument<Concert>;

@Schema({ _id: false })
export class SeatType {
  @Prop({ type: Types.ObjectId, required: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;
}

const SeatTypeSchema = SchemaFactory.createForClass(SeatType);

@Schema({ timestamps: true })
export class Concert {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: String, match: /^\d{2}:\d{2}$/ })
  start_time?: string;

  @Prop({ type: String, match: /^\d{2}:\d{2}$/ })
  end_time?: string;

  @Prop({ type: [SeatTypeSchema], required: true })
  seat_types: SeatType[];
}

export const ConcertSchema = SchemaFactory.createForClass(Concert);