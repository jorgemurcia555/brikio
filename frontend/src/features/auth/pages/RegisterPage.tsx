import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Mail, Lock, Building2, CreditCard, ArrowLeft } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { CardForm } from '../../../components/payment/CardForm';
import { authService } from '../../../services/authService';
import { useAuthStore } from '../../../stores/authStore';
import api from '../../../services/api';

const getStripeKey = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!key) {
    console.warn('Stripe publishable key not found. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file');
  }
  return key || '';
};

const stripePromise = loadStripe(getStripeKey());

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<'register' | 'payment'>('register');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
  });
  const [userTokens, setUserTokens] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);

  // Fetch setup intent when on payment step
  const { data: setupIntentData, isLoading: isLoadingSetupIntent, error: setupIntentError } = useQuery({
    queryKey: ['setup-intent', userTokens?.accessToken],
    queryFn: async () => {
      if (!userTokens?.accessToken) {
        throw new Error('No access token available');
      }
      try {
        // api.post already returns response.data due to axios interceptor
        // But TransformInterceptor wraps it in { success: true, data: { clientSecret: '...' } }
        const response = await api.post('/billing/setup-intent', {}, {
          headers: {
            Authorization: `Bearer ${userTokens.accessToken}`,
          },
        });
        console.log('Setup intent response:', response);
        // Response structure from TransformInterceptor: { success: true, data: { clientSecret: '...' }, timestamp: '...' }
        // api.post already returns response.data, so response is the transformed data
        const clientSecret = (response as any)?.data?.clientSecret || (response as any)?.clientSecret;
        if (!clientSecret) {
          console.error('No clientSecret in response:', response);
          throw new Error('Invalid response from server: missing clientSecret');
        }
        return { clientSecret };
      } catch (error: any) {
        console.error('Setup intent error:', error);
        if (error?.response?.status === 404) {
          throw new Error('Payment endpoint not found. Please ensure the backend server is running and has been restarted.');
        }
        if (error?.response?.status === 401) {
          throw new Error('Authentication failed. Please try logging in again.');
        }
        throw error;
      }
    },
    enabled: step === 'payment' && !!userTokens?.accessToken,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data: any) => {
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      setUserTokens({ accessToken, refreshToken });
      toast.success(t('register.success'));
      setStep('payment'); // Move to payment step
    },
    onError: (error: any) => {
      let errorMessage = t('register.error');
      
      if (error?.response?.status === 409) {
        errorMessage = t('register.userExists', { 
          defaultValue: 'An account with this email already exists. Please sign in instead.' 
        });
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });

  const savePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      if (!userTokens?.accessToken) {
        throw new Error('No access token available');
      }
      // Temporarily set auth in store so interceptor can use it
      const { setAuth: setAuthStore } = useAuthStore.getState();
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        setAuthStore(currentUser, userTokens.accessToken, userTokens.refreshToken);
      }
      
      try {
        // Use api instance which will use the interceptor
        const response = await api.post('/billing/save-payment-method', { paymentMethodId });
        return response;
      } catch (error: any) {
        // Log the full error for debugging
        console.error('Save payment method error:', error);
        console.error('Error response:', error?.response);
        console.error('Error status:', error?.response?.status);
        console.error('Error data:', error?.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success(t('register.payment.success'));
      
      // Check if user was registering to download a guest project
      const fromGuest = searchParams.get('from') === 'guest';
      const guestProjectData = localStorage.getItem('guestProjectData');
      
      if (fromGuest && guestProjectData) {
        navigate('/projects/new?restore=true');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (error: any) => {
      console.error('Payment method save error:', error);
      console.error('Error response:', error?.response);
      console.error('Error status:', error?.response?.status);
      console.error('Error data:', error?.response?.data);
      
      let errorMessage = t('register.payment.error');
      
      if (error?.response?.status === 404) {
        errorMessage = 'Payment endpoint not found. Please ensure the backend server is running and has been restarted.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  const handlePaymentSuccess = (paymentMethodId: string) => {
    savePaymentMethodMutation.mutate(paymentMethodId);
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    // Remove trailing slash
    const baseUrl = apiUrl.replace(/\/$/, '');
    // If URL already includes /api/v1, use /auth/google, otherwise use /api/v1/auth/google
    const authPath = baseUrl.endsWith('/api/v1') ? '/auth/google' : '/api/v1/auth/google';
    window.location.href = `${baseUrl}${authPath}`;
  };

  if (step === 'payment') {
    return (
      <Card className="w-full max-w-md">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep('register')}
          className="mb-4"
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          {t('common.back')}
        </Button>

        <h2 className="text-3xl font-bold text-secondary-900 mb-2">
          {t('register.payment.title')}
        </h2>
        <p className="text-secondary-600 mb-6">
          {t('register.payment.subtitle')}
        </p>

        {!getStripeKey() ? (
          <div className="text-center py-8">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <p className="font-semibold mb-2">Stripe not configured</p>
              <p className="text-sm">
                Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file
              </p>
            </div>
          </div>
        ) : isLoadingSetupIntent ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-secondary-600">{t('register.payment.loading')}</p>
          </div>
        ) : setupIntentError ? (
          <div className="text-center py-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <p className="font-semibold mb-2">{t('register.payment.error')}</p>
              <p className="text-sm">
                {setupIntentError instanceof Error 
                  ? setupIntentError.message 
                  : t('register.payment.errorDescription', { 
                      defaultValue: 'Unable to load payment form. Please try again.' 
                    })
                }
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                {t('common.retry', { defaultValue: 'Retry' })}
              </Button>
            </div>
          </div>
        ) : setupIntentData?.clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: setupIntentData.clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <CardForm
              onSuccess={handlePaymentSuccess}
              onCancel={() => setStep('register')}
              loading={savePaymentMethodMutation.isPending}
            />
          </Elements>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
              <p className="font-semibold mb-2">{t('register.payment.error')}</p>
              <p className="text-sm">
                {t('register.payment.errorDescription', { 
                  defaultValue: 'Unable to load payment form. Please try again.' 
                })}
              </p>
              {setupIntentData && (
                <p className="text-xs mt-2 text-gray-600">
                  Debug: Response received but missing clientSecret. Data: {JSON.stringify(setupIntentData)}
                </p>
              )}
            </div>
          </div>
        )}
      </Card>
    );
  }

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

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-secondary-500">{t('register.orContinueWith', { defaultValue: 'Or continue with' })}</span>
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
          {t('register.googleSignUp', { defaultValue: 'Sign up with Google' })}
        </Button>
      </div>

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

