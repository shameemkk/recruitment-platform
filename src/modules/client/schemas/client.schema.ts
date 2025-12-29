import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  company: string;

  @Prop()
  address: string;

  @Prop()
  notes: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  assignedEmployeeId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
