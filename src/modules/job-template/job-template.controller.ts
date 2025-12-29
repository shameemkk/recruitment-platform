import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { JobTemplateService } from './job-template.service';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { JobTemplateResponseDto } from './dto/job-template-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('job-templates')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class JobTemplateController {
  constructor(private readonly jobTemplateService: JobTemplateService) {}

  @Post()
  @Roles('ADMIN', 'EMPLOYEE')
  @Permissions('CREATE_JOB_TEMPLATE')
  async create(
    @Body() createJobTemplateDto: CreateJobTemplateDto,
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.create(createJobTemplateDto);
    return plainToInstance(JobTemplateResponseDto, template.toObject(), { excludeExtraneousValues: true });
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  @Permissions('READ_JOB_TEMPLATE')
  async findAll(): Promise<JobTemplateResponseDto[]> {
    const templates = await this.jobTemplateService.findAll();
    return plainToInstance(JobTemplateResponseDto, templates.map(t => t.toObject()), { excludeExtraneousValues: true });
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  @Permissions('READ_JOB_TEMPLATE')
  async findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.findOne(id);
    return plainToInstance(JobTemplateResponseDto, template.toObject(), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  @Permissions('UPDATE_JOB_TEMPLATE')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateJobTemplateDto: UpdateJobTemplateDto,
  ): Promise<JobTemplateResponseDto> {
    const template = await this.jobTemplateService.update(id, updateJobTemplateDto);
    return plainToInstance(JobTemplateResponseDto, template.toObject(), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @Permissions('DELETE_JOB_TEMPLATE')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.jobTemplateService.remove(id);
  }
}
