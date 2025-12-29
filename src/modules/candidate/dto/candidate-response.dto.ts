import { Expose, Transform } from 'class-transformer';

export class CandidateResponseDto {
  @Expose({ name: '_id' })
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.jobVacancyId?.toString())
  jobVacancyId: string;

  @Expose()
  @Transform(({ obj }) => obj.data)
  data: Record<string, any>;

  @Expose()
  @Transform(({ obj }) => obj.createdBy?.toString())
  createdBy: string;

  @Expose()
  status: string;

  @Expose()
  notes: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
