import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobTemplateDocument = JobTemplate & Document;

@Schema({ _id: false })
export class TemplateField {
  @Prop({ required: true })
  key: string;

  @Prop({ required: true, enum: ['text', 'email', 'number', 'date', 'select', 'textarea'] })
  type: string;

  @Prop({ default: false })
  required: boolean;

}

export const TemplateFieldSchema = SchemaFactory.createForClass(TemplateField);

@Schema({ timestamps: true })
export class JobTemplate {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [TemplateFieldSchema], default: [] })
  fields: TemplateField[];

  @Prop({ default: true })
  isActive: boolean;
}

export const JobTemplateSchema = SchemaFactory.createForClass(JobTemplate);
