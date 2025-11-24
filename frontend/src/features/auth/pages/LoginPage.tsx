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

