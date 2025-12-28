import { IsNotEmpty, IsString, IsEmail, IsOptional, IsBoolean, IsMongoId, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsMongoId()
  roleId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
