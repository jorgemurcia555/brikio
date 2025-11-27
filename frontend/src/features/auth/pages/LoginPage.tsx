import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../stores/authStore';
import api from '../../../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data: any) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(t('login.success'));
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        t('login.error');
      toast.error(typeof errorMessage === 'string' ? errorMessage : t('login.error'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    // Remove trailing slash
    const baseUrl = apiUrl.replace(/\/$/, '');
    // If URL already includes /api/v1, use /auth/google, otherwise use /api/v1/auth/google
    const authPath = baseUrl.endsWith('/api/v1') ? '/auth/google' : '/api/v1/auth/google';
    window.location.href = `${baseUrl}${authPath}`;
  };

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-3xl font-bold text-secondary-900 mb-2">
        {t('login.title')}
      </h2>
      <p className="text-secondary-600 mb-6">
        {t('login.subtitle', { brandName: t('brand.name') })}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label={t('login.email.label')}
          placeholder={t('login.email.placeholder')}
          icon={<Mail className="w-5 h-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="password"
          label={t('login.password.label')}
          placeholder={t('login.password.placeholder')}
          icon={<Lock className="w-5 h-5" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loginMutation.isPending}
          className="w-full"
        >
          {t('login.submit')}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-secondary-500">{t('login.orContinueWith')}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t('login.googleSignIn')}
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-secondary-600">
          {t('login.noAccount')}{' '}
          <Link
            to="/register"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {t('login.signUpLink')}
          </Link>
        </p>
      </div>
    </Card>
  );
}

