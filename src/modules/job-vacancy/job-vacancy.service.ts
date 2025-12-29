import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async findOne(id: string): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel.findById(id).exec();
    if (!vacancy) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
    return vacancy;
  }

  async update(id: string, updateJobVacancyDto: UpdateJobVacancyDto): Promise<JobVacancyDocument> {
    const vacancy = await this.jobVacancyModel
      .findByIdAndUpdate(id, updateJobVacancyDto, { new: true })
      .exec();
    if (!vacancy) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
    return vacancy;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.jobVacancyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Job vacancy with ID ${id} not found`);
    }
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
