import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

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
      
      // Check if origin is in allowed list
      if (allowedOrigins.some((allowed: string) => origin === allowed || origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(null, true); // Allow all in production for debugging - tighten later
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

