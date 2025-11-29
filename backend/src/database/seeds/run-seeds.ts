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
  
  // Check if plans already exist
  const existingTrialPlan = await plansRepository.findOne({ where: { name: PlanName.TRIAL } });
  const existingBasicPlan = await plansRepository.findOne({ where: { name: PlanName.BASIC } });
  const existingPremiumPlan = await plansRepository.findOne({ where: { name: PlanName.PREMIUM } });

  // Get Stripe price IDs (support both naming conventions)
  const basicStripePriceId = process.env.STRIPE_BASIC_PLAN_PRICE_ID || process.env.STRIPE_FREE_PLAN_PRICE_ID;
  const premiumStripePriceId = process.env.STRIPE_PREMIUM_PLAN_PRICE_ID || process.env.STRIPE_PRO_PLAN_PRICE_ID;

  const trialPlan = existingTrialPlan || plansRepository.create({
    name: PlanName.TRIAL,
    displayName: 'Try First',
    price: 0,
    billingInterval: 'month',
    features: {
      maxEstimates: 3, // Limited to 3 estimates in 7-day trial
      aiEnabled: false,
      csvImport: false,
      advancedReports: false,
      customTemplates: false,
      prioritySupport: false,
    },
    isActive: true,
  });

  const basicPlan = existingBasicPlan || plansRepository.create({
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
  });

  // Update stripePriceId if it's not set or if env var is available
  if (basicStripePriceId && (!basicPlan.stripePriceId || basicPlan.stripePriceId !== basicStripePriceId)) {
    basicPlan.stripePriceId = basicStripePriceId;
  }

  const premiumPlan = existingPremiumPlan || plansRepository.create({
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
  });

  // Update stripePriceId if it's not set or if env var is available
  if (premiumStripePriceId && (!premiumPlan.stripePriceId || premiumPlan.stripePriceId !== premiumStripePriceId)) {
    premiumPlan.stripePriceId = premiumStripePriceId;
  }

  await plansRepository.save([trialPlan, basicPlan, premiumPlan]);
  console.log('✅ Plans seeded/updated (Trial $0, Basic $7, Premium $18)');
  if (basicStripePriceId) {
    console.log(`   ✓ Basic plan configured with Stripe price ID`);
  }
  if (premiumStripePriceId) {
    console.log(`   ✓ Premium plan configured with Stripe price ID`);
  }

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

  // Check which units already exist
  const existingUnits = await unitsRepository.find();
  const existingUnitNames = new Set(existingUnits.map(u => u.name));
  
  // Only create units that don't exist
  const unitsToCreate = units.filter(u => !existingUnitNames.has(u.name));
  
  if (unitsToCreate.length > 0) {
    const savedUnits = await unitsRepository.save(
      unitsToCreate.map((u) => unitsRepository.create(u)),
    );
    console.log(`✅ Created ${savedUnits.length} new units`);
  } else {
    console.log('✅ All units already exist');
  }

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

  // Check which categories already exist
  const existingCategories = await categoriesRepository.find();
  const existingCategoryNames = new Set(existingCategories.map(c => c.name));
  
  // Only create categories that don't exist
  const categoriesToCreate = categories.filter(c => !existingCategoryNames.has(c.name));
  
  if (categoriesToCreate.length > 0) {
    const savedCategories = await categoriesRepository.save(
      categoriesToCreate.map((c) => categoriesRepository.create(c)),
    );
    console.log(`✅ Created ${savedCategories.length} new categories`);
  } else {
    console.log('✅ All categories already exist');
  }
  
  // Get all categories (existing + newly created) for materials
  const allCategories = await categoriesRepository.find();

  // Seed Materials
  console.log('🧱 Seeding materials...');
  // Get all units (existing + newly created)
  const allUnits = await unitsRepository.find();
  const m2Unit = allUnits.find((u) => u.abbreviation === 'm²');
  const sacoUnit = allUnits.find((u) => u.abbreviation === 'saco');
  const pzaUnit = allUnits.find((u) => u.abbreviation === 'pza');

  const albanileriaCategory = allCategories.find((c) => c.name === 'Albañilería');

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

  // Check which materials already exist
  const existingMaterials = await materialsRepository.find();
  const existingMaterialNames = new Set(existingMaterials.map(m => m.name));
  
  // Only create materials that don't exist
  const materialsToCreate = materials.filter(m => !existingMaterialNames.has(m.name));
  
  if (materialsToCreate.length > 0) {
    await materialsRepository.save(
      materialsToCreate.map((m) => materialsRepository.create(m)),
    );
    console.log(`✅ Created ${materialsToCreate.length} new materials`);
  } else {
    console.log('✅ All materials already exist');
  }

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

  // Check which templates already exist
  const existingTemplates = await templatesRepository.find();
  const existingTemplateNames = new Set(existingTemplates.map(t => t.name));
  
  // Only create templates that don't exist
  const templatesToCreate = templates.filter(t => !existingTemplateNames.has(t.name));
  
  if (templatesToCreate.length > 0) {
    for (const template of templatesToCreate) {
      await templatesRepository.save(templatesRepository.create(template as any));
    }
    console.log(`✅ Created ${templatesToCreate.length} new template items`);
  } else {
    console.log('✅ All template items already exist');
  }

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

