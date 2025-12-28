import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { Permission, PermissionSchema } from '../modules/permission/schemas/permission.schema';
import { Role, RoleSchema } from '../modules/role/schemas/role.schema';
import { User, UserSchema } from '../modules/user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
