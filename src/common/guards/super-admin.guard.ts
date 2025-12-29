import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../modules/role/schemas/role.schema';
import { User } from '../../modules/user/schemas/user.schema';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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
    if (!role || !role.isSuperAdmin) {
      throw new ForbiddenException('Only super admin can access this resource');
    }

    return true;
  }
}
