import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobTemplate, JobTemplateDocument } from './schemas/job-template.schema';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';

@Injectable()
export class JobTemplateService {
  constructor(
    @InjectModel(JobTemplate.name) private jobTemplateModel: Model<JobTemplateDocument>,
  ) {}

  async create(createJobTemplateDto: CreateJobTemplateDto): Promise<JobTemplateDocument> {
    const template = new this.jobTemplateModel(createJobTemplateDto);
    return template.save();
  }

  async findAll(): Promise<JobTemplateDocument[]> {
    return this.jobTemplateModel.find().lean().exec();
  }

  async findOne(id: string): Promise<JobTemplateDocument> {
    const template = await this.jobTemplateModel.findById(id).lean().exec();
    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    return template as JobTemplateDocument;
  }

  async update(id: string, updateJobTemplateDto: UpdateJobTemplateDto): Promise<JobTemplateDocument> {
    const template = await this.jobTemplateModel
      .findByIdAndUpdate(id, updateJobTemplateDto, { new: true })
      .exec();
    if (!template) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    return template;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.jobTemplateModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Job template with ID ${id} not found`);
    }
    return { deleted: true };
  }
}
