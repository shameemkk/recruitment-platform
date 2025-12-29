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
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('clients')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Roles('ADMIN')
  @Permissions('CREATE_CLIENT')
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientService.create(createClientDto);
    return plainToInstance(ClientResponseDto, client.toObject(), { excludeExtraneousValues: true });
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  @Permissions('READ_CLIENT')
  async findAll(@CurrentUser() user: { userId: string; role: string }): Promise<ClientResponseDto[]> {
    // Admin sees all clients, Employee sees only assigned clients
    const clients = user.role === 'ADMIN' 
      ? await this.clientService.findAll()
      : await this.clientService.findAllForEmployee(user.userId);
    return plainToInstance(ClientResponseDto, clients.map(c => c.toObject()), { excludeExtraneousValues: true });
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  @Permissions('READ_CLIENT')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: { userId: string; role: string },
  ): Promise<ClientResponseDto> {
    const client = user.role === 'ADMIN'
      ? await this.clientService.findOne(id)
      : await this.clientService.findOneForEmployee(id, user.userId);
    return plainToInstance(ClientResponseDto, client.toObject(), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @Roles('ADMIN')
  @Permissions('UPDATE_CLIENT')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientService.update(id, updateClientDto);
    return plainToInstance(ClientResponseDto, client.toObject(), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @Permissions('DELETE_CLIENT')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.clientService.remove(id);
  }
}
