import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, required: true })
  concert_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  seat_type_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  seat_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  user_id: Types.ObjectId;

  @Prop({ enum: ['active', 'cancelled', 'completed'], default: 'active' })
  status: 'active' | 'cancelled' | 'completed';
}

export const BookingSchema = SchemaFactory.createForClass(Booking);