import { IsString, IsOptional, IsObject, IsIn } from 'class-validator';

export class UpdateCandidateDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
