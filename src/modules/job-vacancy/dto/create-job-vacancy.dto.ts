import { IsString, IsOptional, IsMongoId, IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateJobVacancyDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsMongoId()
  clientId: string;

  @IsNotEmpty()
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
