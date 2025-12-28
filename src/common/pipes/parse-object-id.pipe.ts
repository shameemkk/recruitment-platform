import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!value) {
      throw new BadRequestException('ID is required');
    }
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ID format: '${value}'`);
    }
    return value;
  }
}
