import { IsString, IsOptional, IsMongoId, IsObject, IsIn } from 'class-validator';

export class CreateCandidateDto {
  @IsMongoId()
  jobVacancyId: string;

  @IsObject()
  data: Record<string, any>;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
