import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './schemas/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionModel.findOne({ key: createPermissionDto.key });
    if (existing) {
      throw new ConflictException(`Permission with key '${createPermissionDto.key}' already exists`);
    }
    return this.permissionModel.create(createPermissionDto);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionModel.find().exec();
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    if (updatePermissionDto.key) {
      const existing = await this.permissionModel.findOne({ 
        key: updatePermissionDto.key, 
        _id: { $ne: id } 
      });
      if (existing) {
        throw new ConflictException(`Permission with key '${updatePermissionDto.key}' already exists`);
      }
    }

    const permission = await this.permissionModel
      .findByIdAndUpdate(id, updatePermissionDto, { new: true })
      .exec();
    
    if (!permission) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }
    return permission;
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }
  }
}
