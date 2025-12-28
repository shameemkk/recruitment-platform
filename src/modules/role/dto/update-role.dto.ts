import { IsOptional, IsString, IsBoolean, IsArray, IsMongoId } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;
}
