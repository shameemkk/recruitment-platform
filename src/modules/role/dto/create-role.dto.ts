import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, IsMongoId } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;
}
