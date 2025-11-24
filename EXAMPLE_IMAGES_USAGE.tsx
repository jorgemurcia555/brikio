// 📸 EJEMPLO: Cómo usar imágenes en Brikio

import { OptimizedImage } from '@/components/ui/OptimizedImage';

// ===================================
// 1. HERO SECTION CON IMAGEN
// ===================================
export function HeroWithImage() {
  return (
    <section className="relative h-screen">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/backgrounds/construction-texture.jpg')" }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto flex items-center h-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-display font-bold text-[#8A3B12]">
              Brikio - Smart Estimates
            </h1>
            <p className="text-xl text-[#6C4A32] mt-4">
              Calculate materials, costs and time in minutes
            </p>
          </div>
          
          {/* Hero illustration */}
          <OptimizedImage 
            src="/images/illustrations/builder-working.svg"
            alt="Builder working with digital tools"
            className="w-full max-w-lg"
          />
        </div>
      </div>
    </section>
  );
}

// ===================================
// 2. FEATURES GRID CON IMÁGENES
// ===================================
const features = [
  {
    title: 'Automatic Calculation',
    image: '/images/features/calculator.png',
    description: 'Calculate materials and costs instantly'
  },
  {
    title: 'AI Assistant',
    image: '/images/features/ai-assistant.png',
    description: 'Get smart suggestions powered by AI'
  },
  {
    title: 'PDF Export',
    image: '/images/features/pdf-export.png',
    description: 'Professional estimates in seconds'
  },
  {
    title: 'Templates',
    image: '/images/features/templates.png',
    description: 'Pre-built templates for any project'
  }
];

export function FeaturesGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature) => (
        <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-lg">
          {/* Feature image */}
          <OptimizedImage 
            src={feature.image}
            alt={feature.title}
            aspectRatio="4/3"
            className="mb-4 rounded-lg"
          />
          
          <h3 className="text-xl font-bold text-[#8A3B12] mb-2">
            {feature.title}
          </h3>
          <p className="text-[#6C4A32]">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

// ===================================
// 3. TESTIMONIALS CON AVATARES
// ===================================
const testimonials = [
  {
    name: 'Juan Pérez',
    role: 'Construction Manager',
    company: 'BuildCo',
    avatar: '/images/testimonials/juan-perez.jpg',
    quote: 'Brikio saves me 5 hours every week. The AI suggestions are incredibly accurate.'
  },
  {
    name: 'María González',
    role: 'Project Director',
    company: 'Constructora MG',
    avatar: '/images/testimonials/maria-gonzalez.jpg',
    quote: 'Best tool for construction estimates. My team loves it!'
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Independent Contractor',
    company: 'Freelancer',
    avatar: '/images/testimonials/carlos-rodriguez.jpg',
    quote: 'Professional estimates in minutes. My clients are impressed!'
  }
];

export function TestimonialsSection() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {testimonials.map((testimonial) => (
        <div 
          key={testimonial.name}
          className="bg-white rounded-2xl p-8 shadow-lg text-center"
        >
          {/* Avatar circular */}
          <OptimizedImage 
            src={testimonial.avatar}
            alt={testimonial.name}
            aspectRatio="square"
            objectFit="cover"
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#F15A24]"
          />
          
          <p className="text-[#6C4A32] italic mb-4">
            "{testimonial.quote}"
          </p>
          
          <p className="font-bold text-[#8A3B12]">{testimonial.name}</p>
          <p className="text-sm text-[#C05A2B]">{testimonial.role}</p>
          <p className="text-xs text-[#6C4A32]">{testimonial.company}</p>
        </div>
      ))}
    </div>
  );
}

// ===================================
// 4. PROJECT SHOWCASE
// ===================================
export function ProjectShowcase() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Screenshot del dashboard */}
      <OptimizedImage 
        src="/images/heroes/dashboard-screenshot.jpg"
        alt="Brikio Dashboard"
        aspectRatio="16/9"
        className="rounded-xl shadow-2xl border-4 border-[#F4C197]"
      />
      
      {/* Screenshot del estimate */}
      <OptimizedImage 
        src="/images/heroes/estimate-screenshot.jpg"
        alt="Estimate creation"
        aspectRatio="16/9"
        className="rounded-xl shadow-2xl border-4 border-[#F4C197]"
      />
    </div>
  );
}

// ===================================
// 5. SIMPLE IMAGE WITH FALLBACK
// ===================================
export function SimpleImage() {
  return (
    <img 
      src="/images/features/calculator.png"
      alt="Calculator feature"
      className="w-full h-auto"
      loading="lazy"
      onError={(e) => {
        // Fallback si la imagen no existe
        e.currentTarget.src = '/logos/brikio-logo.svg';
      }}
    />
  );
}

// ===================================
// 6. BACKGROUND PATTERNS
// ===================================
export function SectionWithPattern() {
  return (
    <section 
      className="py-20"
      style={{
        backgroundImage: "url('/images/backgrounds/blueprint-pattern.svg')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
      }}
    >
      <div className="container mx-auto bg-white/90 backdrop-blur p-12 rounded-3xl">
        <h2>Content over pattern</h2>
      </div>
    </section>
  );
}

// ===================================
// NOTAS:
// ===================================
/*
  IMÁGENES RECOMENDADAS PARA BRIKIO:
  
  Heroes (1920x1080px):
  - /images/heroes/construction-site.jpg
  - /images/heroes/blueprint-desk.jpg
  - /images/heroes/team-meeting.jpg
  
  Features (800x600px):
  - /images/features/calculator.png
  - /images/features/ai-assistant.png
  - /images/features/pdf-export.png
  - /images/features/templates.png
  - /images/features/team-collaboration.png
  
  Testimonials (200x200px):
  - /images/testimonials/client-1.jpg
  - /images/testimonials/client-2.jpg
  - /images/testimonials/client-3.jpg
  
  Backgrounds:
  - /images/backgrounds/construction-texture.jpg
  - /images/backgrounds/blueprint-pattern.svg
  - /images/backgrounds/concrete-texture.jpg
  
  Illustrations:
  - /images/illustrations/builder-working.svg
  - /images/illustrations/project-completed.svg
  - /images/illustrations/empty-state.svg
*/

