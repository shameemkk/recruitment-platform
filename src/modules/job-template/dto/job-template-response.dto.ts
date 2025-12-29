import { Expose, Transform, Type } from 'class-transformer';

export class TemplateFieldResponseDto {
  @Expose()
  key: string;

  @Expose()
  type: string;

  @Expose()
  required: boolean;
}

export class JobTemplateResponseDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => TemplateFieldResponseDto)
  fields: TemplateFieldResponseDto[];

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
