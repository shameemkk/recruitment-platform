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

    const dbUser = await this.userModel.findById(user.userId).populate('roleId').lean().exec();
    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    const role = dbUser.roleId as unknown as Role;
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
