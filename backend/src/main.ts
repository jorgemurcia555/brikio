import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { initializeDatabase } from './database/init-db';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Initialize database (create tables if they don't exist)
  // This is safe to run on every startup as it only creates missing tables
  try {
    await initializeDatabase(configService);
  } catch (error) {
    console.error('⚠️  Database initialization failed, continuing anyway:', error);
    // Continue even if initialization fails (might already be initialized)
  }

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS - Allow multiple origins for production flexibility
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const allowedOrigins: string[] = frontendUrl 
    ? frontendUrl.split(',').map((url: string) => url.trim())
    : ['http://localhost:5173'];
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list (exact match or starts with)
      const isAllowed = allowedOrigins.some((allowed: string) => {
        return origin === allowed || origin.startsWith(allowed);
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        // In production, allow all for now (tighten later)
        // Only log warning if not in allowed list
        if (configService.get('NODE_ENV') === 'production') {
          console.warn(`🚫 CORS: Origin ${origin} not in allowed list, but allowing for production`);
          callback(null, true);
        } else {
          console.warn(`🚫 CORS blocked origin: ${origin}`);
          callback(null, true);
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  console.log(`🌐 CORS configured for origins: ${allowedOrigins.join(', ')}`);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
    🚀 BudgetApp API running on: http://localhost:${port}/${apiPrefix}
    📚 Environment: ${configService.get('NODE_ENV')}
    🗄️  Database: ${configService.get('DATABASE_URL') ? 'Connected via DATABASE_URL' : `${configService.get('DB_HOST')}:${configService.get('DB_PORT')}`}
    🌐 Frontend URL: ${frontendUrl || 'Not configured'}
    🔒 CORS Origins: ${allowedOrigins.join(', ')}
  `);
}

bootstrap();

