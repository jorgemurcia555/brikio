import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      // Fetch user data with the token
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.user) {
            setAuth(data.data.user, token, refreshToken);
            toast.success(t('login.success'));
            
            // Check if user was registering to download a guest project
            const guestProjectData = localStorage.getItem('guestProjectData');
            if (guestProjectData) {
              // Redirect back to guest project page with saved data
              navigate('/projects/new?restore=true');
            } else {
              navigate('/dashboard');
            }
          } else {
            throw new Error('Failed to fetch user data');
          }
        })
        .catch((error) => {
          console.error('Auth callback error:', error);
          toast.error(t('login.error'));
          navigate('/login');
        });
    } else {
      toast.error(t('login.error'));
      navigate('/login');
    }
  }, [searchParams, setAuth, navigate, t]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-secondary-600">{t('login.processing')}</p>
      </div>
    </div>
  );
}

