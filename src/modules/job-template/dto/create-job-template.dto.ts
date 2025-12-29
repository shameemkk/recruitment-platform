import { IsString, IsOptional, IsArray, ValidateNested, IsBoolean, IsIn, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class TemplateFieldDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['text', 'email', 'number', 'date', 'select', 'textarea'])
  type: string;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

}

export class CreateJobTemplateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateFieldDto)
  fields: TemplateFieldDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
