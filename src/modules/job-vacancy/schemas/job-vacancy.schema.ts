import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobVacancyDocument = JobVacancy & Document;

@Schema({ _id: false })
export class VacancyField {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true, enum: ['text', 'email', 'number', 'date', 'select', 'textarea'] })
  type: string;

  @Prop({ default: false })
  required: boolean;

  @Prop({ type: [String], default: [] })
  options?: string[];
}

export const VacancyFieldSchema = SchemaFactory.createForClass(VacancyField);

@Schema({ timestamps: true })
export class JobVacancy {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'JobTemplate', required: true })
  jobTemplateId: Types.ObjectId;

  @Prop({ type: [VacancyFieldSchema], default: [] })
  fields: VacancyField[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  assignedAgencies: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const JobVacancySchema = SchemaFactory.createForClass(JobVacancy);
