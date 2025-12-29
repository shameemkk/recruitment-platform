import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { JobVacancy, JobVacancyDocument } from '../job-vacancy/schemas/job-vacancy.schema';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@Injectable()
export class CandidateService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(JobVacancy.name) private jobVacancyModel: Model<JobVacancyDocument>,
  ) {}

  async create(createCandidateDto: CreateCandidateDto, userId: string): Promise<CandidateDocument> {
    const vacancy = await this.jobVacancyModel.findById(createCandidateDto.jobVacancyId).exec();
    if (!vacancy) {
      throw new BadRequestException('Job vacancy not found');
    }

    const isAssigned = vacancy.assignedAgencies.some(a => a.toString() === userId);
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this job vacancy');
    }

    this.validateCandidateData(createCandidateDto.data, vacancy.fields);

    const candidate = new this.candidateModel({
      ...createCandidateDto,
      createdBy: userId,
    });
    return candidate.save();
  }

  private validateCandidateData(data: Record<string, any>, fields: any[]): void {
    for (const field of fields) {
      if (field.required && !data[field.key]) {
        throw new BadRequestException(`Field "${field.key}" is required`);
      }
      if (data[field.key]) {
        if (field.type === 'email' && !this.isValidEmail(data[field.key])) {
          throw new BadRequestException(`Field "${field.key}" must be a valid email`);
        }
        if (field.type === 'number' && isNaN(Number(data[field.key]))) {
          throw new BadRequestException(`Field "${field.key}" must be a number`);
        }
      }
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async findAll(): Promise<CandidateDocument[]> {
    return this.candidateModel.find().lean().exec();
  }

  async findByJobVacancy(jobVacancyId: string): Promise<CandidateDocument[]> {
    return this.candidateModel.find({ jobVacancyId }).lean().exec();
  }

  async findByAgency(agencyId: string): Promise<CandidateDocument[]> {
    return this.candidateModel.find({ createdBy: agencyId }).lean().exec();
  }

  async findOne(id: string, userId?: string, role?: string): Promise<CandidateDocument> {
    const candidate = await this.candidateModel.findById(id).lean().exec();
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }
    // AGENCY can only view candidates they created
    if (role === 'AGENCY' && candidate.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only view candidates you created');
    }

    return candidate as CandidateDocument;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto, userId: string): Promise<CandidateDocument> {
    const candidate = await this.candidateModel.findById(id).exec();
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    if (candidate.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update candidates you created');
    }

    if (updateCandidateDto.data) {
      const vacancy = await this.jobVacancyModel.findById(candidate.jobVacancyId).exec();
      if (vacancy) {
        this.validateCandidateData(updateCandidateDto.data, vacancy.fields);
      }
    }

    const updated = await this.candidateModel
      .findByIdAndUpdate(id, updateCandidateDto, { new: true })
      .exec();
    return updated!;
  }

  async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
    const candidate = await this.candidateModel.findById(id).exec();
    if (!candidate) {
      throw new NotFoundException(`Candidate with ID ${id} not found`);
    }

    if (candidate.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete candidates you created');
    }

    await this.candidateModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
