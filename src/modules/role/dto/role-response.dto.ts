import { Expose, Transform, Type } from 'class-transformer';

export class PermissionResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  key: string;

  @Expose()
  description: string;
}

export class RoleResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  isSuperAdmin: boolean;

  @Expose()
  @Type(() => PermissionResponseDto)
  permissions: PermissionResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
