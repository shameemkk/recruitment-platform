import { Controller, Get, Post, Body, Req, Res, HttpCode, HttpStatus, UseGuards, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  private readonly REFRESH_TOKEN_COOKIE = 'refresh_token';
  private readonly COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const tokens = await this.authService.login(loginDto);

    // Set refresh token as HTTP-only cookie
    res.cookie(this.REFRESH_TOKEN_COOKIE, tokens.refresh_token, this.COOKIE_OPTIONS);

    return {
      access_token: tokens.access_token,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const refreshToken = req.cookies?.[this.REFRESH_TOKEN_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    // Set new refresh token as HTTP-only cookie
    res.cookie(this.REFRESH_TOKEN_COOKIE, tokens.refresh_token, this.COOKIE_OPTIONS);

    return {
      access_token: tokens.access_token,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie(this.REFRESH_TOKEN_COOKIE, { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.userService.findById(req.user.userId);
  }
}
