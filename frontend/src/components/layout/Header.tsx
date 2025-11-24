import { Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b-2 border-secondary-200 sticky top-0 z-20">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Hola, {user?.companyName || user?.email}
          </h1>
          <p className="text-sm text-secondary-500">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-secondary-100 transition-colors relative">
            <Bell className="w-5 h-5 text-secondary-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 text-secondary-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

