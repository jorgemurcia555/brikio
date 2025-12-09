import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(
      refreshTokenDto.userId,
      refreshTokenDto.refreshToken,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      const result = await this.authService.validateGoogleUser(user);

      // Redirect to frontend with tokens
      // Ensure FRONTEND_URL has protocol (https:// or http://)
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      // If FRONTEND_URL doesn't start with http:// or https://, add https://
      if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      
      // Remove trailing slash if present
      frontendUrl = frontendUrl.replace(/\/$/, '');
      
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`;
      
      console.log('🔐 Redirecting to frontend:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error in Google OAuth callback:', error);
      // Redirect to frontend login page with error
      let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      frontendUrl = frontendUrl.replace(/\/$/, '');
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getUserProfile(userId);
  }
}

