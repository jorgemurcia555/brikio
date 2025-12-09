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
    
    // Priority: GOOGLE_CALLBACK_URL > BACKEND_URL > fallback
    const callbackPath = configService.get<string>('GOOGLE_CALLBACK_URL');
    let callbackURL: string;
    
    if (callbackPath) {
      // If GOOGLE_CALLBACK_URL is provided, use it directly (should be full URL)
      if (callbackPath.startsWith('http://') || callbackPath.startsWith('https://')) {
        callbackURL = callbackPath;
      } else {
        // If it's a path, prepend BACKEND_URL
        let backendUrl = configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
        // Ensure BACKEND_URL has protocol
        if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
          backendUrl = `https://${backendUrl}`;
        }
        // Remove trailing slash
        backendUrl = backendUrl.replace(/\/$/, '');
        // Remove leading slash from callbackPath if present
        const cleanPath = callbackPath.startsWith('/') ? callbackPath : `/${callbackPath}`;
        callbackURL = `${backendUrl}${cleanPath}`;
      }
    } else {
      // Build from BACKEND_URL or use default
      let backendUrl = configService.get<string>('BACKEND_URL');
      if (!backendUrl) {
        const nodeEnv = configService.get<string>('NODE_ENV');
        if (nodeEnv === 'production') {
          throw new Error(
            'BACKEND_URL or GOOGLE_CALLBACK_URL must be set in production. ' +
            'Please set BACKEND_URL to your production backend URL (e.g., https://backend-production-e6c5.up.railway.app)'
          );
        }
        callbackURL = `http://localhost:3000/${apiPrefix}/auth/google/callback`;
      } else {
        // Ensure BACKEND_URL has protocol
        if (!backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
          backendUrl = `https://${backendUrl}`;
        }
        // Remove trailing slash
        backendUrl = backendUrl.replace(/\/$/, '');
        callbackURL = `${backendUrl}/${apiPrefix}/auth/google/callback`;
      }
    }

    // Remove any double slashes (except after http:// or https://)
    callbackURL = callbackURL.replace(/([^:]\/)\/+/g, '$1');

    console.log('🔐 Google OAuth Callback URL:', callbackURL);
    console.log('🔐 Make sure this exact URL is registered in Google Cloud Console');
    console.log('🔐 BACKEND_URL:', configService.get<string>('BACKEND_URL'));
    console.log('🔐 FRONTEND_URL:', configService.get<string>('FRONTEND_URL'));

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

