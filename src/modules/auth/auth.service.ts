import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserService } from './../user/user.service';
import { LoginDto } from './dto/login.dto';
import { Role } from '../role/schemas/role.schema';
import jwtConfig from '../../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: { secret: string; expiresIn: string; refreshSecret: string; refreshExpiresIn: string },
  ) {}

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

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async generateTokens(user: any) {
    const role = await this.roleModel.findById(user.roleId).lean().exec();
    const roleName = role?.name || '';

    const payload = {
      email: user.email,
      sub: user._id,
      role: roleName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.expiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.jwtConfiguration.refreshSecret,
        expiresIn: this.jwtConfiguration.refreshExpiresIn as any,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtConfiguration.refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}