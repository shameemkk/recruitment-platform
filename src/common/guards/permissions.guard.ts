import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { User } from '../../modules/user/schemas/user.schema';
import { Role } from '../../modules/role/schemas/role.schema';
import { Permission } from '../../modules/permission/schemas/permission.schema';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Access denied');
    }

    const dbUser = await this.userModel
      .findById(user.userId)
      .populate({ path: 'roleId', populate: { path: 'permissions' } })
      .lean()
      .exec();
    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    const role = dbUser.roleId as unknown as Role;
    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    // Super admin bypasses permission check
    if (role.isSuperAdmin) {
      return true;
    }

    const userPermissions = (role.permissions as unknown as Permission[]).map((p) => p.key);
    const hasPermission = requiredPermissions.every((p) => userPermissions.includes(p));

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
