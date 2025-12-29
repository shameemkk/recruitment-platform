import { IsString, IsOptional, IsMongoId, IsArray, IsBoolean } from 'class-validator';

export class CreateJobVacancyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  clientId: string;

  @IsMongoId()
  jobTemplateId: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedAgencies?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
