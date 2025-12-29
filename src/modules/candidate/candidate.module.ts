import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { JobVacancy, JobVacancySchema } from '../job-vacancy/schemas/job-vacancy.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { Permission, PermissionSchema } from '../permission/schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: JobVacancy.name, schema: JobVacancySchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
