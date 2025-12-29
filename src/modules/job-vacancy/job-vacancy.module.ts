import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobVacancyService } from './job-vacancy.service';
import { JobVacancyController } from './job-vacancy.controller';
import { JobVacancy, JobVacancySchema } from './schemas/job-vacancy.schema';
import { JobTemplate, JobTemplateSchema } from '../job-template/schemas/job-template.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { Permission, PermissionSchema } from '../permission/schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobVacancy.name, schema: JobVacancySchema },
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [JobVacancyController],
  providers: [JobVacancyService],
  exports: [JobVacancyService],
})
export class JobVacancyModule {}
