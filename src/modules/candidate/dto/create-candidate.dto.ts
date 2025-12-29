import { IsString, IsOptional, IsMongoId, IsObject, IsIn, IsNotEmpty } from 'class-validator';

export class CreateCandidateDto {
  @IsNotEmpty()
  @IsMongoId()
  jobVacancyId: string;

  @IsNotEmpty()
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
