import { IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsMongoId, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class VacancyFieldDto {
  @IsString()
  key: string;

  @IsString()
  @IsIn(['text', 'email', 'number', 'date', 'select', 'textarea'])
  type: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

export class UpdateJobVacancyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VacancyFieldDto)
  fields?: VacancyFieldDto[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedAgencies?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
