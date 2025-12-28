import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsOptional()
  @IsString()
  description?: string;
}
