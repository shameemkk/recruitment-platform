import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('users')
@UseGuards(AuthGuard('jwt'), SuperAdminGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);
    return plainToInstance(UserResponseDto, user.toObject(), { excludeExtraneousValues: true });
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return plainToInstance(UserResponseDto, users, { excludeExtraneousValues: true });
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.update(id, updateUserDto);
    return plainToInstance(UserResponseDto, user.toObject(), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.userService.remove(id);
  }
}
