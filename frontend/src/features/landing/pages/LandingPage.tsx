import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle,
  ChevronDown,
  FileText,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { LanguageSwitcher } from '../../../components/ui/LanguageSwitcher';
import { Logo } from '../../../components/ui/Logo';
import { OptimizedImage } from '../../../components/ui/OptimizedImage';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const RetroMascot = () => (
  <svg
    viewBox="0 0 300 260"
    className="w-full h-full"
    role="img"
    aria-label="Friendly builder carrying a blueprint"
  >
    <rect width="300" height="260" rx="40" fill="#FDEFD9" />
    <path
      d="M175 75c0 16-12 28-27 28s-27-12-27-28 12-28 27-28 27 12 27 28Z"
      fill="#F97316"
    />
    <path
      d="M134 148 96 214c-4 7 1 17 9 17h20c3 0 6-2 7-5l24-62 24 62c1 3 4 5 7 5h20c8 0 13-10 9-17l-38-66H134Z"
      fill="#C2410C"
    />
    <path
      d="m95 119 62 36 65-36c5-3 6-10 2-14l-38-37-24 15-22-15-38 37c-5 4-4 11 3 14Z"
      fill="#F15A24"
    />
    <path
      d="M120 58c24-8 52-8 76 0l13 5c3 1 5-1 4-4-5-19-24-32-44-32h-22c-20 0-37 13-42 32-1 3 1 5 4 4l11-5Z"
      fill="#F97316"
    />
    <circle cx="173" cy="73" r="5" fill="#fff" />
    <circle cx="143" cy="73" r="5" fill="#fff" />
    <path
      d="M150 94c7 5 15 5 22 0"
      stroke="#fff"
      strokeWidth="5"
      strokeLinecap="round"
    />
  </svg>
);

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const year = useMemo(() => new Date().getFullYear(), []);

  const socialProof = [
    { label: t('socialProof.googleReviews'), score: '4.8/5' },
    { label: t('socialProof.g2Crowd'), score: '4.7/5' },
    { label: t('socialProof.capterra'), score: '4.6/5' },
    { label: t('socialProof.trustpilot'), score: '4.8/5' },
  ];

  const templateShowcase = [
    { name: t('templates.blockWall'), metric: t('templates.blockWallMetric'), accent: 'bg-primary-200' },
    { name: t('templates.finePlaster'), metric: t('templates.finePlasterMetric'), accent: 'bg-secondary-200' },
    { name: t('templates.metalRoof'), metric: t('templates.metalRoofMetric'), accent: 'bg-amber-200' },
    { name: t('templates.ceramicFloor'), metric: t('templates.ceramicFloorMetric'), accent: 'bg-orange-200' },
  ];

  const essentialElements = [
    {
      title: t('essentials.header.title'),
      copy: t('essentials.header.description'),
    },
    {
      title: t('essentials.clientData.title'),
      copy: t('essentials.clientData.description'),
    },
    {
      title: t('essentials.dateValidity.title'),
      copy: t('essentials.dateValidity.description'),
    },
    {
      title: t('essentials.lineItems.title'),
      copy: t('essentials.lineItems.description'),
    },
    {
      title: t('essentials.totals.title'),
      copy: t('essentials.totals.description'),
    },
  ];

  const caseStudies = [
    {
      name: t('caseStudies.olea.name'),
      result: t('caseStudies.olea.result'),
      detail: t('caseStudies.olea.detail'),
    },
    {
      name: t('caseStudies.cafe.name'),
      result: t('caseStudies.cafe.result'),
      detail: t('caseStudies.cafe.detail'),
    },
    {
      name: t('caseStudies.maiz.name'),
      result: t('caseStudies.maiz.result'),
      detail: t('caseStudies.maiz.detail'),
    },
  ];

  const testimonials = [
    {
      person: t('testimonials.carlos.name'),
      role: t('testimonials.carlos.role'),
      quote: t('testimonials.carlos.quote'),
    },
    {
      person: t('testimonials.ana.name'),
      role: t('testimonials.ana.role'),
      quote: t('testimonials.ana.quote'),
    },
    {
      person: t('testimonials.miguel.name'),
      role: t('testimonials.miguel.role'),
      quote: t('testimonials.miguel.quote'),
    },
  ];

  const features = [
    {
      icon: Calculator,
      title: t('features.automated.title'),
      copy: t('features.automated.description'),
    },
    {
      icon: FileText,
      title: t('features.pdf.title'),
      copy: t('features.pdf.description'),
    },
    {
      icon: TrendingUp,
      title: t('features.kpis.title'),
      copy: t('features.kpis.description'),
    },
  ];

  const pricingPlans = [
    {
      name: t('pricing.trial.name'),
      price: t('pricing.trial.price'),
      duration: t('pricing.trial.duration'),
      features: [
        t('pricing.trial.features.create'),
        t('pricing.trial.features.templates'),
        t('pricing.trial.features.calculate'),
        t('pricing.trial.features.preview'),
        t('pricing.trial.features.noDownload'),
      ],
      cta: t('pricing.trial.cta'),
      badge: t('pricing.trial.badge'),
      note: null,
      highlight: false,
    },
    {
      name: t('pricing.basic.name'),
      price: t('pricing.basic.price'),
      duration: t('pricing.basic.duration'),
      features: [
        t('pricing.basic.features.everything'),
        t('pricing.basic.features.download'),
        t('pricing.basic.features.templates'),
        t('pricing.basic.features.support'),
      ],
      cta: t('pricing.basic.cta'),
      badge: t('pricing.basic.badge'),
      note: t('pricing.basic.note'),
      highlight: false,
    },
    {
      name: t('pricing.premium.name'),
      price: t('pricing.premium.price'),
      duration: t('pricing.premium.duration'),
      features: [
        t('pricing.premium.features.everything'),
        t('pricing.premium.features.ai'),
        t('pricing.premium.features.optimization'),
        t('pricing.premium.features.suggestions'),
        t('pricing.premium.features.review'),
        t('pricing.premium.features.support'),
      ],
      cta: t('pricing.premium.cta'),
      badge: t('pricing.premium.badge'),
      note: t('pricing.premium.note'),
      highlight: true,
    },
  ];

  const faqs = [
    {
      q: t('faq.q1.question'),
      a: t('faq.q1.answer'),
    },
    {
      q: t('faq.q2.question'),
      a: t('faq.q2.answer'),
    },
    {
      q: t('faq.q3.question'),
      a: t('faq.q3.answer'),
    },
  ];

  const steps = [
    t('howItWorks.step1'),
    t('howItWorks.step2'),
    t('howItWorks.step3'),
    t('howItWorks.step4'),
    t('howItWorks.step5'),
  ];

  return (
    <div className="min-h-screen bg-[#FFF7EA]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FFF7EA]/90 backdrop-blur border-b-2 border-[#F1D7C4]">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="lg" variant="orange" showText={false} />
            <div>
              <p className="font-display text-2xl text-[#8A3B12] tracking-wide">{t('brand.name')}</p>
              <p className="text-xs uppercase text-[#C05A2B]">{t('brand.taglineShort')}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[#8A3B12] font-medium">
            <a href="#features" className="hover:text-[#F15A24] transition-colors">
              {t('nav.features')}
            </a>
            <a href="#templates" className="hover:text-[#F15A24] transition-colors">
              {t('nav.templates')}
            </a>
            <a href="#how-it-works" className="hover:text-[#F15A24] transition-colors">
              {t('nav.workflow')}
            </a>
            <a href="#pricing" className="hover:text-[#F15A24] transition-colors">
              {t('nav.pricing')}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => navigate('/login')}>
              {t('nav.signIn')}
            </Button>
            <Button variant="primary" onClick={() => navigate('/projects/new')}>
              {t('nav.tryNow')}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-16 lg:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#FDE3C8] text-[#D35425] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            {t('hero.badge')}
          </div>
          <h1 className="text-5xl lg:text-6xl font-display text-[#8A3B12] leading-tight mb-6">
            {t('hero.title')}{' '}
            <span className="text-[#F15A24] relative">
              {t('hero.titleHighlight')}
              <span className="absolute -bottom-1 left-0 w-full h-2 bg-[#F9AF6B]/60 rounded-full" />
            </span>{' '}
            {t('hero.titleEnd')}
          </h1>
          <p className="text-xl text-[#6C4A32] mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              variant="primary"
              size="lg"
              className="text-lg"
              onClick={() => navigate('/projects/new')}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              {t('hero.ctaPrimary')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg border-[#8A3B12] text-[#8A3B12]"
              onClick={() => navigate('/login')}
            >
              {t('hero.ctaSecondary')}
            </Button>
          </div>
          <p className="text-sm text-[#6C4A32] flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-[#3FA45B]" /> {t('hero.noCreditCard')}
          </p>
        </div>
        <div className="p-6 p-6 overflow-hidden">
          <div className="relative overflow-hidden w-full">
            <img src="/images/heroes/hero.png" 
            alt="Brikio - Smart Construction Estimates" 
            loading="lazy" 
            className="transition-opacity duration-300 w-full h-full object-cover opacity-100 transform rotate-1"
            style={{ transform: 'scaleX(-1)' }}
            />
          </div>
        </div>
{/*         <Card className="p-6 overflow-hidden">
          <OptimizedImage 
            src="/images/heroes/hero.png"
            alt="Brikio - Smart Construction Estimates"
            className="w-full transform rotate-1"
            aspectRatio="square"
            objectFit="cover"
          />
        </Card> */}
      </section>

      {/* Social proof */}
      <section className="bg-[#F4C197]/40 py-8">
        <div className="container mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {socialProof.map((item) => (
            <div key={item.label}>
              <p className="text-[#C05A2B] text-sm uppercase tracking-wide">{item.label}</p>
              <p className="font-display text-2xl text-[#8A3B12]">{item.score}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="container mx-auto px-6 py-16 grid lg:grid-cols-3 gap-8">
        {features.map((feature) => (
          <Card key={feature.title} className="p-8 border-2 border-[#F4C197] bg-[#FFF7EA]">
            <feature.icon className="w-10 h-10 text-[#F15A24] mb-4" />
            <h3 className="font-display text-2xl text-[#8A3B12] mb-3">{feature.title}</h3>
            <p className="text-[#6C4A32] leading-relaxed">{feature.copy}</p>
          </Card>
        ))}
      </section>

      {/* Templates inspired by Venngage */}
      <section id="templates" className="bg-white py-16">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn()} className="text-center max-w-3xl mx-auto mb-12">
            <p className="font-display text-4xl text-[#8A3B12]">
              {t('templates.title')}
            </p>
            <p className="text-[#6C4A32] mt-4">
              {t('templates.subtitle')}
            </p>
          </motion.div>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
            {templateShowcase.map((template) => (
              <Card
                key={template.name}
                className={`min-w-[220px] snap-start border-none ${template.accent} rounded-3xl p-6 shadow-md`}
              >
                <p className="font-display text-2xl text-[#8A3B12]">{template.name}</p>
                <p className="text-[#C05A2B] mt-2">{template.metric}</p>
                <Button variant="ghost" className="mt-6 text-[#8A3B12] hover:text-[#F15A24] px-0">
                  {t('templates.viewDetail')}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container mx-auto px-6 py-16">
        <motion.div {...fadeIn()} className="text-center mb-14">
          <p className="font-display text-4xl text-[#8A3B12]">{t('howItWorks.title')}</p>
          <p className="text-[#6C4A32]">
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>
        <div className="grid lg:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <div
              key={step}
              className="bg-[#FFF0DD] border border-[#F4C197] rounded-3xl p-6 text-center flex flex-col gap-3"
            >
              <span className="text-4xl font-display text-[#F15A24]">{idx + 1}</span>
              <p className="text-[#8A3B12] font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Essential elements */}
      <section className="bg-[#FDE3C8] py-16">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn()} className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="font-display text-4xl text-[#8A3B12]">{t('essentials.title')}</h3>
            <p className="text-[#6C4A32]">
              {t('essentials.subtitle')}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-5 gap-4">
            {essentialElements.map((item) => (
              <Card key={item.title} className="bg-white h-full p-5 rounded-3xl border-[#F4C197] border">
                <h4 className="font-display text-xl text-[#8A3B12]">{item.title}</h4>
                <p className="text-sm text-[#6C4A32] mt-2">{item.copy}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {caseStudies.map((caseItem) => (
            <Card key={caseItem.name} className="bg-[#FFF7EA] border-2 border-[#F4C197] p-6 rounded-[28px]">
              <h4 className="font-display text-2xl text-[#8A3B12]">{caseItem.name}</h4>
              <p className="text-[#F15A24] font-semibold mt-2">{caseItem.result}</p>
              <p className="text-[#6C4A32] mt-2">{caseItem.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn()} className="text-center mb-12">
            <p className="font-display text-4xl text-[#8A3B12]">{t('testimonials.title')}</p>
            <p className="text-[#6C4A32]">{t('testimonials.subtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.person} className="p-6 rounded-[28px] border-[#F4C197] border bg-[#FFF7EA]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-[#F7B733] fill-[#F7B733]" />
                  ))}
                </div>
                <p className="text-[#6C4A32] mt-4">{testimonial.quote}</p>
                <p className="font-bold text-[#8A3B12] mt-4">{testimonial.person}</p>
                <p className="text-sm text-[#C05A2B]">{testimonial.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#FDEFD9] py-16">
        <div className="container mx-auto px-6">
          <motion.div {...fadeIn()} className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-4xl text-[#8A3B12] mb-4">{t('pricing.title')}</h2>
            <p className="text-[#6C4A32]">{t('pricing.subtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 rounded-[30px] border-4 relative ${
                  plan.highlight ? 'border-[#F15A24] shadow-2xl bg-white' : 'border-[#F4C197] bg-[#FFF7EA]'
                }`}
              >
                {plan.badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                    plan.highlight ? 'bg-[#F15A24] text-white' : 'bg-[#3FA45B] text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <p className="font-display text-3xl text-[#8A3B12]">{plan.name}</p>
                <div className="mt-4">
                  <p className="text-5xl font-display text-[#F15A24]">{plan.price}</p>
                  {plan.duration && (
                    <p className="text-sm text-[#C05A2B] mt-1">{plan.duration}</p>
                  )}
                </div>
                <ul className="mt-6 space-y-3 text-[#6C4A32]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#3FA45B] flex-shrink-0 mt-0.5" /> 
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  className="mt-8 w-full"
                  onClick={() => navigate(plan.highlight ? '/projects/new' : '/projects/new')}
                >
                  {plan.cta}
                </Button>
                {plan.note && (
                  <p className="text-xs text-center text-[#6C4A32] mt-3">{plan.note}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-6 py-16" id="faq">
        <motion.div {...fadeIn()} className="text-center mb-12">
          <p className="font-display text-4xl text-[#8A3B12]">{t('faq.title')}</p>
          <p className="text-[#6C4A32]">{t('faq.subtitle')}</p>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((item) => (
            <Card key={item.q} className="p-6 bg-white border border-[#F4C197] rounded-3xl flex items-center justify-between">
              <div>
                <p className="font-display text-2xl text-[#8A3B12]">{item.q}</p>
                <p className="text-[#6C4A32] mt-2">{item.a}</p>
              </div>
              <ChevronDown className="w-5 h-5 text-[#C05A2B]" />
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#F15A24] py-16 text-center text-white">
        <div className="container mx-auto px-6">
          <h3 className="font-display text-4xl mb-4">{t('cta.title')}</h3>
          <p className="max-w-2xl mx-auto mb-8">
            {t('cta.subtitle')}
          </p>
          <Button variant="secondary" className="bg-white text-[#F15A24]" onClick={() => navigate('/projects/new')}>
            {t('cta.button')}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3C1F12] text-[#FDEFD9] py-10">
        <div className="container mx-auto px-6 flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
          <p>© {year} {t('brand.name')}. {t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-white">{t('footer.links.features')}</a>
            <a href="#pricing" className="hover:text-white">{t('footer.links.pricing')}</a>
            <a href="#faq" className="hover:text-white">{t('footer.links.faq')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
