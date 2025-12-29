import { Expose, Type } from 'class-transformer';

class AssignedEmployeeDto {
  @Expose()
  _id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;
}

export class ClientResponseDto {
  @Expose()
  _id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  company: string;

  @Expose()
  address: string;

  @Expose()
  notes: string;

  @Expose()
  @Type(() => AssignedEmployeeDto)
  assignedEmployeeId: AssignedEmployeeDto;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
