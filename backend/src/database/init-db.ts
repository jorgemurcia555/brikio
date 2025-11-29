import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Plan, PlanName } from './entities/plan.entity';

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
    
    // Check if plans exist, if not, create them
    const plansRepository = dataSource.getRepository(Plan);
    const existingPlans = await plansRepository.count();
    
    if (existingPlans === 0) {
      console.log('🌱 No plans found, creating default plans...');
      
      const trialPlan = plansRepository.create({
        name: PlanName.TRIAL,
        displayName: 'Try First',
        price: 0,
        billingInterval: 'month',
        features: {
          maxEstimates: null,
          aiEnabled: false,
          csvImport: false,
          advancedReports: false,
          customTemplates: false,
          prioritySupport: false,
        },
        isActive: true,
      });

      const basicPlan = plansRepository.create({
        name: PlanName.BASIC,
        displayName: 'Basic',
        price: 7.00,
        billingInterval: 'month',
        features: {
          maxEstimates: null,
          aiEnabled: false,
          csvImport: false,
          advancedReports: false,
          customTemplates: true,
          prioritySupport: false,
        },
        isActive: true,
        // Support both naming conventions
        stripePriceId: configService.get('STRIPE_BASIC_PLAN_PRICE_ID') || configService.get('STRIPE_FREE_PLAN_PRICE_ID'),
      });

      const premiumPlan = plansRepository.create({
        name: PlanName.PREMIUM,
        displayName: 'Premium',
        price: 18.00,
        billingInterval: 'month',
        features: {
          maxEstimates: null,
          aiEnabled: true,
          csvImport: true,
          advancedReports: true,
          customTemplates: true,
          prioritySupport: true,
        },
        isActive: true,
        // Support both naming conventions
        stripePriceId: configService.get('STRIPE_PREMIUM_PLAN_PRICE_ID') || configService.get('STRIPE_PRO_PLAN_PRICE_ID'),
      });

      await plansRepository.save([trialPlan, basicPlan, premiumPlan]);
      console.log('✅ Default plans created (Trial $0, Basic $7, Premium $18)');
    } else {
      console.log(`✅ Plans already exist (${existingPlans} plans found)`);
    }
    
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't throw - let the app continue (might already be initialized via TypeORM)
  }
}

