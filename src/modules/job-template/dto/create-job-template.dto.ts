import { IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateFieldDto {
  @IsString()
  key: string;

  @IsString()
  @IsIn(['text', 'email', 'number', 'date', 'select', 'textarea'])
  type: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

}

export class CreateJobTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateFieldDto)
  fields: TemplateFieldDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
