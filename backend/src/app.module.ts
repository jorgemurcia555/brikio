import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BillingModule } from './modules/billing/billing.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EstimatesModule } from './modules/estimates/estimates.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { EstimateTemplatesModule } from './modules/estimate-templates/estimate-templates.module';
import { HealthController } from './common/controllers/health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Use DATABASE_URL if available (Railway), otherwise use individual vars
        const databaseUrl = configService.get('DATABASE_URL');
        
        if (databaseUrl) {
          // Allow synchronize in production if ENABLE_SYNC is set (for initial setup)
          const enableSync = configService.get('ENABLE_SYNC') === 'true' || configService.get('NODE_ENV') !== 'production';
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: enableSync,
            logging: configService.get('NODE_ENV') === 'development',
            migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
            ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Fallback to individual variables (local development)
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
          migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        };
      },
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL') || 60,
          limit: configService.get('THROTTLE_LIMIT') || 100,
        },
      ],
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    BillingModule,
    MaterialsModule,
    TemplatesModule,
    ProjectsModule,
    EstimatesModule,
    ClientsModule,
    AiModule,
    AnalyticsModule,
    PdfModule,
    EstimateTemplatesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

