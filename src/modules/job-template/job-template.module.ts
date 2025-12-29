import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobTemplateService } from './job-template.service';
import { JobTemplateController } from './job-template.controller';
import { JobTemplate, JobTemplateSchema } from './schemas/job-template.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { Permission, PermissionSchema } from '../permission/schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [JobTemplateController],
  providers: [JobTemplateService],
  exports: [JobTemplateService],
})
export class JobTemplateModule {}
