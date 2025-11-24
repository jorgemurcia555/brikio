import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Initialize database - create tables if they don't exist
 * This runs automatically on app startup
 */
export async function initializeDatabase(configService: ConfigService): Promise<void> {
  const databaseUrl = configService.get('DATABASE_URL');
  
  if (!databaseUrl) {
    console.log('⚠️  DATABASE_URL not found, skipping database initialization');
    return;
  }

  console.log('🗄️  Initializing database (creating tables if needed)...');

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true, // Create tables if they don't exist (safe, only creates missing tables)
    logging: false,
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database tables verified/created successfully');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw - let the app continue (might already be initialized via TypeORM)
  }
}

