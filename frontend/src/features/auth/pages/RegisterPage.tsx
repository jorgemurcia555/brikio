import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Building2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../stores/authStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data: any) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(t('register.success'));
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        t('register.error');
      toast.error(typeof errorMessage === 'string' ? errorMessage : t('register.error'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <Card className="w-full max-w-md">
      <h2 className="text-3xl font-bold text-secondary-900 mb-2">
        {t('register.title')}
      </h2>
      <p className="text-secondary-600 mb-6">
        {t('register.subtitle', { brandName: t('brand.name') })}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label={t('register.email.label')}
          placeholder={t('register.email.placeholder')}
          icon={<Mail className="w-5 h-5" />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          type="text"
          label={t('register.company.label')}
          placeholder={t('register.company.placeholder')}
          icon={<Building2 className="w-5 h-5" />}
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
        />

        <Input
          type="password"
          label={t('register.password.label')}
          placeholder={t('register.password.placeholder')}
          helperText={t('register.password.helper', { defaultValue: 'Minimum 8 characters' })}
          icon={<Lock className="w-5 h-5" />}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={registerMutation.isPending}
          className="w-full"
        >
          {t('register.submit')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-secondary-600">
          {t('register.hasAccount')}{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {t('register.signInLink')}
          </Link>
        </p>
      </div>
    </Card>
  );
}

