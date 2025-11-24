import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Plan, PlanName } from '../entities/plan.entity';
import { MaterialCategory } from '../entities/material-category.entity';
import { Unit } from '../entities/unit.entity';
import { Material } from '../entities/material.entity';
import { TemplateItem } from '../entities/template-item.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'budgetapp',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'budgetapp',
  entities: [__dirname + '/../entities/**/*.entity{.ts,.js}'],
  synchronize: true, // Create tables automatically
});

async function runSeeds() {
  console.log('🌱 Starting database seeding...');

  await AppDataSource.initialize();

  const plansRepository = AppDataSource.getRepository(Plan);
  const categoriesRepository = AppDataSource.getRepository(MaterialCategory);
  const unitsRepository = AppDataSource.getRepository(Unit);
  const materialsRepository = AppDataSource.getRepository(Material);
  const templatesRepository = AppDataSource.getRepository(TemplateItem);

  // Seed Plans
  console.log('📋 Seeding plans...');
  
  const trialPlan = plansRepository.create({
    name: PlanName.TRIAL,
    displayName: 'Try First',
    price: 0,
    billingInterval: 'month',
    features: {
      maxEstimates: null, // Unlimited estimates (no downloads)
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
      maxEstimates: null, // Unlimited
      aiEnabled: false, // No AI features
      csvImport: false,
      advancedReports: false,
      customTemplates: true,
      prioritySupport: false,
    },
    isActive: true,
    stripePriceId: process.env.STRIPE_BASIC_PLAN_PRICE_ID,
  });

  const premiumPlan = plansRepository.create({
    name: PlanName.PREMIUM,
    displayName: 'Premium',
    price: 18.00,
    billingInterval: 'month',
    features: {
      maxEstimates: null, // Unlimited
      aiEnabled: true, // AI features included
      csvImport: true,
      advancedReports: true,
      customTemplates: true,
      prioritySupport: true,
    },
    isActive: true,
    stripePriceId: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
  });

  await plansRepository.save([trialPlan, basicPlan, premiumPlan]);
  console.log('✅ Plans seeded (Trial $0, Basic $7, Premium $18)');

  // Seed Units
  console.log('📏 Seeding units...');
  const units = [
    { name: 'Metro cuadrado', abbreviation: 'm²', conversionFactor: 1 },
    { name: 'Metro lineal', abbreviation: 'ml', conversionFactor: 1 },
    { name: 'Metro cúbico', abbreviation: 'm³', conversionFactor: 1 },
    { name: 'Kilogramo', abbreviation: 'kg', conversionFactor: 1 },
    { name: 'Saco', abbreviation: 'saco', conversionFactor: 1 },
    { name: 'Pieza', abbreviation: 'pza', conversionFactor: 1 },
    { name: 'Litro', abbreviation: 'l', conversionFactor: 1 },
    { name: 'Tonelada', abbreviation: 'ton', conversionFactor: 1000 },
  ];

  const savedUnits = await unitsRepository.save(
    units.map((u) => unitsRepository.create(u)),
  );
  console.log('✅ Units seeded');

  // Seed Categories
  console.log('📂 Seeding categories...');
  const categories = [
    { name: 'Cimentación', icon: '🏗️', color: '#7C2D12', sortOrder: 1 },
    { name: 'Estructura', icon: '🏛️', color: '#9A3412', sortOrder: 2 },
    { name: 'Albañilería', icon: '🧱', color: '#C2410C', sortOrder: 3 },
    { name: 'Acabados', icon: '🎨', color: '#EA580C', sortOrder: 4 },
    { name: 'Instalaciones', icon: '⚡', color: '#F97316', sortOrder: 5 },
    { name: 'Herrería', icon: '🔨', color: '#FB923C', sortOrder: 6 },
  ];

  const savedCategories = await categoriesRepository.save(
    categories.map((c) => categoriesRepository.create(c)),
  );
  console.log('✅ Categories seeded');

  // Seed Materials
  console.log('🧱 Seeding materials...');
  const m2Unit = savedUnits.find((u) => u.abbreviation === 'm²');
  const sacoUnit = savedUnits.find((u) => u.abbreviation === 'saco');
  const pzaUnit = savedUnits.find((u) => u.abbreviation === 'pza');

  const albanileriaCategory = savedCategories.find((c) => c.name === 'Albañilería');

  const materials = [
    {
      name: 'Cemento Portland',
      category: albanileriaCategory,
      unit: sacoUnit,
      basePrice: 185,
      taxRate: 16,
      performanceFactor: 7,
      supplier: 'CEMEX',
    },
    {
      name: 'Block de concreto 15x20x40',
      category: albanileriaCategory,
      unit: pzaUnit,
      basePrice: 12.5,
      taxRate: 16,
      performanceFactor: 12.5,
      supplier: 'Local',
    },
    {
      name: 'Arena',
      category: albanileriaCategory,
      unit: m2Unit,
      basePrice: 350,
      taxRate: 16,
      performanceFactor: 1,
      supplier: 'Local',
    },
  ];

  await materialsRepository.save(
    materials.map((m) => materialsRepository.create(m)),
  );
  console.log('✅ Materials seeded');

  // Seed Template Items
  console.log('📝 Seeding template items...');
  const templates = [
    {
      name: 'Muro de block 15x20x40',
      description: 'Muro de block de concreto con mortero',
      category: 'Estructura',
      formula: {
        variables: [
          {
            name: 'area',
            label: 'Área del muro',
            type: 'number' as const,
            unit: 'm²',
            required: true,
          },
        ],
      },
      isPublic: true,
    },
    {
      name: 'Repello de mortero',
      description: 'Repello de mortero cemento-arena',
      category: 'Acabados',
      formula: {
        variables: [
          {
            name: 'area',
            label: 'Área a repellar',
            type: 'number' as const,
            unit: 'm²',
            required: true,
          },
        ],
      },
      isPublic: true,
    },
  ];

  for (const template of templates) {
    await templatesRepository.save(templatesRepository.create(template as any));
  }
  console.log('✅ Template items seeded');

  await AppDataSource.destroy();
  console.log('🎉 Seeding completed successfully!');
}

runSeeds()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  });

