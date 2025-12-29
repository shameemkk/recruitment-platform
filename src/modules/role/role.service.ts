import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from './schemas/role.schema';
import { Permission } from '../permission/schemas/permission.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleModel.findOne({ name: createRoleDto.name });
    if (existing) {
      throw new ConflictException(`Role with name '${createRoleDto.name}' already exists`);
    }
    const roleData = {
      ...createRoleDto,
      permissions: createRoleDto.permissions?.map(id => new Types.ObjectId(id)),
    };
    return this.roleModel.create(roleData);
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).populate('permissions').exec();
    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    if (updateRoleDto.name) {
      const existing = await this.roleModel.findOne({ 
        name: updateRoleDto.name, 
        _id: { $ne: id } 
      });
      if (existing) {
        throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`);
      }
    }

    const updateData = {
      ...updateRoleDto,
      ...(updateRoleDto.permissions && {
        permissions: updateRoleDto.permissions.map(id => new Types.ObjectId(id)),
      }),
    };

    const role = await this.roleModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('permissions')
      .exec();
    
    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }
    return role;
  }

  async remove(id: string): Promise<void> {
    const result = await this.roleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }
  }

  async addPermissionByKey(roleId: string, permissionKey: string): Promise<Role> {
    const permission = await this.permissionModel.findOne({ key: permissionKey }).exec();
    if (!permission) {
      throw new NotFoundException(`Permission with key '${permissionKey}' not found`);
    }

    const role = await this.roleModel
      .findByIdAndUpdate(
        roleId,
        { $addToSet: { permissions: permission._id } },
        { new: true },
      )
      .populate('permissions')
      .exec();

    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }
    return role;
  }

  async removePermissionByKey(roleId: string, permissionKey: string): Promise<Role> {
    const permission = await this.permissionModel.findOne({ key: permissionKey }).exec();
    if (!permission) {
      throw new NotFoundException(`Permission with key '${permissionKey}' not found`);
    }

    const role = await this.roleModel
      .findByIdAndUpdate(
        roleId,
        { $pull: { permissions: permission._id } },
        { new: true },
      )
      .populate('permissions')
      .exec();

    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }
    return role;
  }

  async addMultiplePermissionsByKey(roleId: string, permissionKeys: string[]): Promise<Role> {
    const permissions = await this.permissionModel.find({ key: { $in: permissionKeys } }).exec();
    if (permissions.length !== permissionKeys.length) {
      const foundKeys = permissions.map(p => p.key);
      const notFound = permissionKeys.filter(k => !foundKeys.includes(k));
      throw new NotFoundException(`Permissions not found: ${notFound.join(', ')}`);
    }

    const role = await this.roleModel
      .findByIdAndUpdate(
        roleId,
        { $addToSet: { permissions: { $each: permissions.map(p => p._id) } } },
        { new: true },
      )
      .populate('permissions')
      .exec();

    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }
    return role;
  }
}
