import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Logo } from '../ui/Logo';

export function AuthLayout() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:block"
        >
          <div className="space-y-6">
            <Logo size="xl" variant="orange" showText={true} />
            <h1 className="text-5xl font-display font-bold text-secondary-900 leading-tight">
              {t('nav.tagline', { defaultValue: 'Smart Construction Estimates' })}{' '}
              <span className="text-primary-600">{t('nav.for', { defaultValue: 'for Builders' })}</span>
            </h1>
            <p className="text-xl text-secondary-600">
              {t('nav.subtitle', { defaultValue: 'Calculate materials, quantities and costs in minutes. Send professional estimates that impress.' })}
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full" />
                <span className="text-secondary-700">{t('nav.feature1', { defaultValue: 'Automatic calculation' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full" />
                <span className="text-secondary-700">{t('nav.feature2', { defaultValue: 'Optional AI Pro' })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}

