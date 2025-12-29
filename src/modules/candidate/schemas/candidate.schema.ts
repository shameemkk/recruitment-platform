import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ type: Types.ObjectId, ref: 'JobVacancy', required: true })
  jobVacancyId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: 'pending', enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'] })
  status: string;

  @Prop()
  notes: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
