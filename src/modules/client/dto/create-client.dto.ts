import { IsString, IsEmail, IsOptional, IsMongoId, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsMongoId()
  assignedEmployeeId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
