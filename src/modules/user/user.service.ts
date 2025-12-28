import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({ email: createUserDto.email });
    if (existing) {
      throw new ConflictException(`User with email '${createUserDto.email}' already exists`);
    }
    const userData = {
      ...createUserDto,
      roleId: new Types.ObjectId(createUserDto.roleId),
    };
    const created = await this.userModel.create(userData);
    return this.userModel.findById(created._id).populate('roleId').exec() as Promise<User>;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().populate('roleId').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).populate('roleId').exec();
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email) {
      const existing = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(`User with email '${updateUserDto.email}' already exists`);
      }
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    // Update fields manually to trigger pre-save hook for password hashing
    if (updateUserDto.fullName) user.fullName = updateUserDto.fullName;
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.password) user.password = updateUserDto.password;
    if (updateUserDto.roleId) user.roleId = new Types.ObjectId(updateUserDto.roleId);
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;

    await user.save();
    const updatedUser = await this.userModel.findById(id).populate('roleId').exec();
    return updatedUser!;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
  }
}