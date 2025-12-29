import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobVacancy, JobVacancyDocument } from './schemas/job-vacancy.schema';
import { JobTemplate, JobTemplateDocument } from '../job-template/schemas/job-template.schema';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';

@Injectable()
export class JobVacancyService {
  constructor(
    @InjectModel(JobVacancy.name) private jobVacancyModel: Model<JobVacancyDocument>,
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
  ) {}

  async create(createJobVacancyDto: CreateJobVacancyDto, userId: string): Promise<JobVacancyDocument> {
    const template = await this.jobTemplateModel.findById(createJobVacancyDto.jobTemplateId).exec();
    if (!template) {
      throw new BadRequestException('Job template not found');
    }

    const vacancy = new this.jobVacancyModel({
      ...createJobVacancyDto,
      fields: template.fields, // Always snapshot from template
      createdBy: userId,
    });
    return vacancy.save();
  }

  async findAll(): Promise<JobVacancyDocument[]> {
    return this.jobVacancyModel.find().exec();
  }

  async findByClient(clientId: string): Promise<JobVacancyDocument[]> {
    return this.jobVacancyModel.find({ clientId }).exec();
  }

  async findByAgency(agencyId: string): Promise<JobVacancyDocument[]> {
    return this.jobVacancyModel.find({ assignedAgencies: agencyId }).exec();
  }

  async findOne(id: string, userId?: string, role?: string): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel.findById(id).exec();
    if (!vacancy) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
    // AGENCY can only view vacancies they're assigned to
    if (role === 'AGENCY' && !vacancy.assignedAgencies.some(a => a.toString() === userId)) {
      throw new ForbiddenException('You are not assigned to this job vacancy');
    }
    return vacancy;
  }

  async update(id: string, updateJobVacancyDto: UpdateJobVacancyDto, userId: string): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel.findById(id).exec();
    if (!vacancy) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
    // Only the creator can update
    if (vacancy.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update job vacancies you created');
    }
    const updated = await this.jobVacancyModel
      .findByIdAndUpdate(id, updateJobVacancyDto, { new: true })
      .exec();
    return updated!;
  }

  async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
    const vacancy = await this.jobVacancyModel.findById(id).exec();
    if (!vacancy) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
    // Only the creator can delete
    if (vacancy.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete job vacancies you created');
    }
    await this.jobVacancyModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }

  async assignAgency(id: string, agencyId: string): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel
      .findByIdAndUpdate(id, { $addToSet: { assignedAgencies: agencyId } }, { new: true })
      .exec();
    if (!vacancy) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
    return vacancy;
  }

  async removeAgency(id: string, agencyId: string): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel
      .findByIdAndUpdate(id, { $pull: { assignedAgencies: agencyId } }, { new: true })
      .exec();
    if (!vacancy) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
    return vacancy;
  }
}
