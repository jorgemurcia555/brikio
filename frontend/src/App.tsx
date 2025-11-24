import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';

// Auth Pages
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';

// App Pages
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { ProjectDetailPage } from './features/projects/pages/ProjectDetailPage';
import { NewEstimatePage } from './features/estimates/pages/NewEstimatePage';
import { MaterialsPage } from './features/materials/pages/MaterialsPage';
import { ClientsPage } from './features/clients/pages/ClientsPage';
import { BillingPage } from './features/billing/pages/BillingPage';

// Landing
import { LandingPage } from './features/landing/pages/LandingPage';

// Guest Pages
import { GuestProjectPage } from './features/projects/pages/GuestProjectPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/projects/new" element={<GuestProjectPage />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/estimates/new/:projectId" element={<NewEstimatePage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/billing" element={<BillingPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

