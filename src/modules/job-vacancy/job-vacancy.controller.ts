import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { JobVacancyService } from './job-vacancy.service';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';
import { JobVacancyResponseDto } from './dto/job-vacancy-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('job-vacancies')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class JobVacancyController {
  constructor(private readonly jobVacancyService: JobVacancyService) {}

  @Post()
  @Roles('EMPLOYEE')
  @Permissions('CREATE_JOB_VACANCY')
  async create(
    @Body() createJobVacancyDto: CreateJobVacancyDto,
    @CurrentUser() user: { userId: string },
  ): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacancyService.create(createJobVacancyDto, user.userId);
    return plainToInstance(JobVacancyResponseDto, vacancy.toObject(), { excludeExtraneousValues: true });
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE', 'AGENCY')
  @Permissions('READ_JOB_VACANCY')
  async findAll(
    @Query('clientId') clientId?: string,
    @CurrentUser() user?: { userId: string; role: string },
  ): Promise<JobVacancyResponseDto[]> {
    let vacancies;
    if (user?.role === 'AGENCY') {
      vacancies = await this.jobVacancyService.findByAgency(user.userId);
    } else if (clientId) {
      vacancies = await this.jobVacancyService.findByClient(clientId);
    } else {
      vacancies = await this.jobVacancyService.findAll();
    }
    return vacancies.map(v => plainToInstance(JobVacancyResponseDto, v.toObject(), { excludeExtraneousValues: true }));
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE', 'AGENCY')
  @Permissions('READ_JOB_VACANCY')
  async findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacancyService.findOne(id);
    return plainToInstance(JobVacancyResponseDto, vacancy.toObject(), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @Roles('EMPLOYEE')
  @Permissions('UPDATE_JOB_VACANCY')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateJobVacancyDto: UpdateJobVacancyDto,
  ): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacancyService.update(id, updateJobVacancyDto);
    return plainToInstance(JobVacancyResponseDto, vacancy.toObject(), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles('EMPLOYEE')
  @Permissions('DELETE_JOB_VACANCY')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.jobVacancyService.remove(id);
  }

  @Post(':id/agencies/:agencyId')
  @Roles('EMPLOYEE')
  @Permissions('UPDATE_JOB_VACANCY')
  async assignAgency(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('agencyId', ParseObjectIdPipe) agencyId: string,
  ): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacancyService.assignAgency(id, agencyId);
    return plainToInstance(JobVacancyResponseDto, vacancy.toObject(), { excludeExtraneousValues: true });
  }

  @Delete(':id/agencies/:agencyId')
  @Roles('EMPLOYEE')
  @Permissions('UPDATE_JOB_VACANCY')
  async removeAgency(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('agencyId', ParseObjectIdPipe) agencyId: string,
  ): Promise<JobVacancyResponseDto> {
    const vacancy = await this.jobVacancyService.removeAgency(id, agencyId);
    return plainToInstance(JobVacancyResponseDto, vacancy.toObject(), { excludeExtraneousValues: true });
  }
}
