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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('roles')
@UseGuards(AuthGuard('jwt'), SuperAdminGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.roleService.remove(id);
  }

  // Simple permission management by key
  @Post(':id/permissions/:permissionKey')
  addPermission(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('permissionKey') permissionKey: string,
  ) {
    return this.roleService.addPermissionByKey(id, permissionKey);
  }

  @Delete(':id/permissions/:permissionKey')
  removePermission(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('permissionKey') permissionKey: string,
  ) {
    return this.roleService.removePermissionByKey(id, permissionKey);
  }

  @Post(':id/permissions')
  addMultiplePermissions(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: { permissions: string[] },
  ) {
    return this.roleService.addMultiplePermissionsByKey(id, body.permissions);
  }
}
