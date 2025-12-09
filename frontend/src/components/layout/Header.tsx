import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { useState, useEffect } from 'react';

export function Header() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b-2 border-secondary-200 sticky top-0 z-20 w-full">
      <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Mobile menu button - only show when sidebar is closed on mobile */}
          {isMobile && !sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors flex-shrink-0 touch-manipulation md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-secondary-600" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 truncate">
              Hola, {user?.companyName || user?.email?.split('@')[0] || 'Usuario'}
            </h1>
            <p className="text-xs sm:text-sm text-secondary-500 hidden sm:block">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-secondary-500 sm:hidden">
              {new Date().toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          <button className="p-1.5 sm:p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors relative touch-manipulation">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-500 rounded-full" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary-600" />
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-secondary-100 active:bg-secondary-200 transition-colors touch-manipulation"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

