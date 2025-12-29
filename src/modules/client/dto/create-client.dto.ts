import { IsString, IsEmail, IsOptional, IsMongoId, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

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

  @IsMongoId()
  assignedEmployeeId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
