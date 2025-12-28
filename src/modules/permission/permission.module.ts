import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [MongooseModule, PermissionService],
})
export class PermissionModule {}
