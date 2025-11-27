import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    // Build the full callback URL
    const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
    const backendUrl = configService.get<string>('BACKEND_URL') || 
                      (configService.get<string>('NODE_ENV') === 'production' 
                        ? 'https://your-production-domain.com' 
                        : 'http://localhost:3000');
    
    const callbackPath = configService.get<string>('GOOGLE_CALLBACK_URL');
    const callbackURL = callbackPath 
      ? (callbackPath.startsWith('http') ? callbackPath : `${backendUrl}${callbackPath}`)
      : `${backendUrl}/${apiPrefix}/auth/google/callback`;

    console.log('🔐 Google OAuth Callback URL:', callbackURL);

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      avatarUrl: photos[0]?.value,
      googleId: profile.id,
      accessToken,
    };
    done(null, user);
  }
}

