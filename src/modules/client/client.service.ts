import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client } from './schemas/client.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { User } from '../user/schemas/user.schema';
import { Role } from '../role/schemas/role.schema';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existing = await this.clientModel.findOne({ email: createClientDto.email });
    if (existing) {
      throw new ConflictException(`Client with email '${createClientDto.email}' already exists`);
    }

    // Validate assigned employee exists and has EMPLOYEE role
    await this.validateEmployee(createClientDto.assignedEmployeeId);

    const clientData = {
      ...createClientDto,
      assignedEmployeeId: new Types.ObjectId(createClientDto.assignedEmployeeId),
    };

    const created = await this.clientModel.create(clientData);
    return this.clientModel.findById(created._id).populate('assignedEmployeeId', 'fullName email').exec() as Promise<Client>;
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().populate('assignedEmployeeId', 'fullName email').lean().exec();
  }

  async findAllForEmployee(employeeId: string): Promise<Client[]> {
    return this.clientModel
      .find({ assignedEmployeeId: new Types.ObjectId(employeeId) })
      .populate('assignedEmployeeId', 'fullName email')
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id).populate('assignedEmployeeId', 'fullName email').lean().exec();
    if (!client) {
      throw new NotFoundException(`Client with ID '${id}' not found`);
    }
    return client;
  }

  async findOneForEmployee(id: string, employeeId: string): Promise<Client> {
    const client = await this.clientModel
      .findOne({ _id: id, assignedEmployeeId: new Types.ObjectId(employeeId) })
      .populate('assignedEmployeeId', 'fullName email')
      .lean()
      .exec();
    if (!client) {
      throw new NotFoundException(`Client with ID '${id}' not found or not assigned to you`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const email = updateClientDto.email;
    const assignedEmployeeId = updateClientDto.assignedEmployeeId;
    
    if (email) {
      const existing = await this.clientModel.findOne({
        email,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(`Client with email '${email}' already exists`);
      }
    }

    if (assignedEmployeeId) {
      await this.validateEmployee(assignedEmployeeId);
    }

    const updateData: Record<string, any> = { ...updateClientDto };
    if (assignedEmployeeId) {
      updateData.assignedEmployeeId = new Types.ObjectId(assignedEmployeeId);
    }

    const client = await this.clientModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedEmployeeId', 'fullName email')
      .exec();

    if (!client) {
      throw new NotFoundException(`Client with ID '${id}' not found`);
    }
    return client;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Client with ID '${id}' not found`);
    }
  }

  private async validateEmployee(employeeId: string): Promise<void> {
    const employee = await this.userModel.findById(employeeId).populate('roleId').lean().exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID '${employeeId}' not found`);
    }

    const role = employee.roleId as unknown as Role;
    if (!role || role.name !== 'EMPLOYEE') {
      throw new ForbiddenException('Assigned user must have EMPLOYEE role');
    }
  }
}
