import { NavLink } from 'react-router-dom';
import { motion, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  Users,
  CreditCard,
  ChevronLeft,
  Sparkles,
  Shield,
  Menu,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { Logo } from '../ui/Logo';

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { name: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.estimates'), href: '/estimates', icon: FolderKanban },
    { name: t('sidebar.resources'), href: '/resources', icon: Package },
    { name: t('sidebar.clients'), href: '/clients', icon: Users },
    { name: t('sidebar.billing'), href: '/billing', icon: CreditCard },
  ];

  const adminNavigation = [
    { name: t('sidebar.adminTemplates', { defaultValue: 'Templates' }), href: '/admin/templates', icon: Shield },
  ];

  const isPremium = user?.subscription?.plan?.name === 'premium';
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <motion.aside
        animate={{ 
          width: sidebarOpen ? (isMobile ? 280 : 256) : (isMobile ? 0 : 80),
          x: isMobile ? (sidebarOpen ? 0 : -280) : 0
        }}
        className="fixed left-0 top-0 h-screen bg-white border-r-2 border-secondary-200 z-50 overflow-hidden md:fixed"
      >
        <div className="p-3 sm:p-4 md:p-6 flex items-center justify-between min-h-[64px]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1"
          >
            <Logo size="sm" variant="orange" showText={sidebarOpen && !isMobile} />
          </motion.div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0 touch-manipulation"
            aria-label="Toggle sidebar"
          >
            {isMobile ? (
              <Menu className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-90' : ''}`} />
            ) : (
              <ChevronLeft
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`}
              />
            )}
          </button>
        </div>

        <nav className="px-2 sm:px-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)] pb-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => {
                // Close sidebar on mobile when clicking a link
                if (isMobile) {
                  toggleSidebar();
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base touch-manipulation ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-600 hover:bg-secondary-50 active:bg-secondary-100'
                }`
              }
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              {(sidebarOpen || isMobile) && <span className="font-medium truncate">{item.name}</span>}
            </NavLink>
          ))}
        
        {isAdmin && (
          <>
            <div className="my-2 border-t border-secondary-200"></div>
            {adminNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => {
                  if (isMobile) {
                    toggleSidebar();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-colors text-sm sm:text-base touch-manipulation ${
                    isActive
                      ? 'bg-accent-100 text-accent-700'
                      : 'text-secondary-600 hover:bg-secondary-50 active:bg-secondary-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && <span className="font-medium truncate">{item.name}</span>}
              </NavLink>
            ))}
          </>
        )}
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
    </>
  );
}

