import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../stores/uiStore';

export function MainLayout() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-primary-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarOpen 
            ? 'ml-0 md:ml-[256px]' 
            : 'ml-0 md:ml-20'
        }`}
      >
        <Header />
        <main className="p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

