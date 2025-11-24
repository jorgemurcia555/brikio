import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Users,
  CreditCard,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { Logo } from '../ui/Logo';

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const navigation = [
    { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.projects'), href: '/projects', icon: FolderKanban },
    { name: t('sidebar.materials'), href: '/materials', icon: Package },
    { name: t('sidebar.clients'), href: '/clients', icon: Users },
    { name: t('sidebar.billing'), href: '/billing', icon: CreditCard },
  ];

  const isPremium = user?.subscription?.plan?.name === 'premium';

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 80 }}
      className="fixed left-0 top-0 h-screen bg-white border-r-2 border-secondary-200 z-30 overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1"
        >
          <Logo size="md" variant="orange" showText={sidebarOpen} />
        </motion.div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <nav className="px-3 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-secondary-600 hover:bg-secondary-50'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Premium Badge */}
      {isPremium && sidebarOpen && (
        <div className="absolute bottom-6 left-3 right-3">
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">{t('sidebar.premiumBadge.title')}</span>
            </div>
            <p className="text-sm text-primary-100">
              {t('sidebar.premiumBadge.description')}
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

