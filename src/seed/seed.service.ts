import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ConfigType } from '@nestjs/config';
import adminConfig from '../config/admin.config';
import { Role } from '../modules/role/schemas/role.schema';
import { User } from '../modules/user/schemas/user.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private isSeeded = false;
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(adminConfig.KEY)
    private adminConf: ConfigType<typeof adminConfig>,
  ) {}

  async onModuleInit() {
    if (this.isSeeded) return;
    await this.seedRoles();
    await this.seedAdmin();
    this.isSeeded = true;
  }

  async seedRoles() {
    const adminExists = await this.roleModel.findOne({ name: 'ADMIN' });
    if (!adminExists) {
      await this.roleModel.create({
        name: 'ADMIN',
        permissions: [],
        isSuperAdmin: true,
      });
      console.log('Roles seeded');
    }
  }

  async seedAdmin() {
    const adminEmail = this.adminConf.email; 
    const adminPassword = this.adminConf.password; 

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD environment variable is required');
    }
    
    const exists = await this.userModel.findOne({ email: adminEmail });
    if (exists) return;

    const adminRole = await this.roleModel.findOne({ name: 'ADMIN' });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }
    
    await this.userModel.create({
      fullName: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      roleId: adminRole._id,
    });

    console.log('Admin user created');
  }
}