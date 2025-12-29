import { Expose, Transform } from 'class-transformer';

class RoleNestedDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  isSuperAdmin: boolean;

  @Expose()
  permissions: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class UserResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  isActive: boolean;

  @Expose()
  @Transform(({ obj }) => {
    const role = obj.roleId;
    if (!role || typeof role === 'string') return role;
    return {
      id: role._id?.toString(),
      name: role.name,
      isSuperAdmin: role.isSuperAdmin,
      permissions: role.permissions?.map((p: any) => p._id?.toString() || p.toString()) || [],
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  })
  role: RoleNestedDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
