import { IsOptional, IsString, IsEmail, IsBoolean, IsMongoId, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsMongoId()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
