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
import { CandidateService } from './candidate.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { CandidateResponseDto } from './dto/candidate-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('candidates')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Post()
  @Roles('ADMIN','AGENCY')
  @Permissions('CREATE_CANDIDATE')
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @CurrentUser() user: { userId: string },
  ): Promise<CandidateResponseDto> {
    const candidate = await this.candidateService.create(createCandidateDto, user.userId);
    return plainToInstance(CandidateResponseDto, candidate.toObject(), { excludeExtraneousValues: true });
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE', 'AGENCY')
  @Permissions('READ_CANDIDATE')
  async findAll(
    @Query('jobVacancyId') jobVacancyId?: string,
    @CurrentUser() user?: { userId: string; role: string },
  ): Promise<CandidateResponseDto[]> {
    let candidates;
    if (user?.role === 'AGENCY') {
      candidates = await this.candidateService.findByAgency(user.userId);
    } else if (jobVacancyId) {
      candidates = await this.candidateService.findByJobVacancy(jobVacancyId);
    } else {
      candidates = await this.candidateService.findAll();
    }
    return candidates.map(c => plainToInstance(CandidateResponseDto, c, { excludeExtraneousValues: true }));
  }

  @Get(':id')
  @Roles('ADMIN', 'AGENCY')
  @Permissions('READ_CANDIDATE')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: { userId: string; role: string },
  ): Promise<CandidateResponseDto> {
    const candidate = await this.candidateService.findOne(id, user.userId, user.role);
    return plainToInstance(CandidateResponseDto, candidate, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @Roles('AGENCY')
  @Permissions('UPDATE_CANDIDATE')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
    @CurrentUser() user: { userId: string },
  ): Promise<CandidateResponseDto> {
    const candidate = await this.candidateService.update(id, updateCandidateDto, user.userId);
    return plainToInstance(CandidateResponseDto, candidate.toObject(), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles('AGENCY')
  @Permissions('DELETE_CANDIDATE')
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.candidateService.remove(id, user.userId);
  }
}
