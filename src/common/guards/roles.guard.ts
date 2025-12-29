import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { User } from '../../modules/user/schemas/user.schema';
import { Role } from '../../modules/role/schemas/role.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Access denied');
    }

    const dbUser = await this.userModel.findById(user.userId).exec();
    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    const role = await this.roleModel.findById(dbUser.roleId).exec();
    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    // Super admin bypasses role check
    if (role.isSuperAdmin) {
      return true;
    }

    const hasRole = requiredRoles.some((r) => role.name === r);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role permissions');
    }

    return true;
  }
}
