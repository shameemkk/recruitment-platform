import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    UserModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [MongooseModule, RoleService],
})
export class RoleModule {}
