import { Expose, Transform, Type } from 'class-transformer';

export class VacancyFieldResponseDto {
  @Expose()
  key: string;

  @Expose()
  type: string;

  @Expose()
  required: boolean;

  @Expose()
  options?: string[];
}

export class JobVacancyResponseDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  clientId: string;

  @Expose()
  jobTemplateId: string;

  @Expose()
  @Type(() => VacancyFieldResponseDto)
  fields: VacancyFieldResponseDto[];

  @Expose()
  assignedAgencies: string[];

  @Expose()
  createdBy: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
