import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from './../user/user.service';
import { LoginDto } from './dto/login.dto';
import { Role } from '../role/schemas/role.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @InjectModel(Role.name) private roleModel: Model<Role>,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get role name for the token
    const role = await this.roleModel.findById(user.roleId).lean().exec();
    const roleName = role?.name || '';

    const payload = {
      email: user.email,
      sub: user._id,
      role: roleName,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}