import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import api from '../../../services/api';

export function BillingPage() {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get('/billing/subscription'),
  });

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get('/billing/plans'),
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => api.post('/billing/checkout', { planId }),
    onSuccess: (data: any) => {
      window.location.href = data.data.url;
    },
    onError: () => {
      toast.error('Error al procesar el pago');
    },
  });

  const currentPlan = subscription?.data?.plan;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Facturación</h1>
        <p className="text-secondary-600 mt-1">
          Gestiona tu suscripción y métodos de pago
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">
              Plan Actual: {currentPlan?.displayName}
            </h2>
            <p className="text-secondary-600">
              {currentPlan?.name === 'free'
                ? 'Plan gratuito con funciones básicas'
                : 'Acceso completo a todas las funciones'}
            </p>
          </div>
          {currentPlan?.name === 'pro' && (
            <div className="flex items-center gap-2 text-primary-600">
              <Crown className="w-6 h-6" />
              <span className="font-bold">PRO</span>
            </div>
          )}
        </div>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans?.data?.map((plan: any) => (
          <Card
            key={plan.id}
            variant={plan.name === 'pro' ? 'elevated' : 'default'}
            className={plan.name === 'pro' ? 'border-2 border-primary-500' : ''}
          >
            {plan.name === 'pro' && (
              <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white px-4 py-2 rounded-t-lg -mt-6 -mx-6 mb-4">
                <p className="text-center font-bold">MÁS POPULAR</p>
              </div>
            )}
            <h3 className="text-2xl font-bold text-secondary-900">
              {plan.displayName}
            </h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary-600">
                ${plan.price}
              </span>
              <span className="text-secondary-600">/ {plan.billingInterval}</span>
            </div>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-secondary-700">
                  {plan.features.maxEstimates || 'Presupuestos ilimitados'}
                </span>
              </li>
              {plan.features.aiEnabled && (
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-secondary-700">IA Avanzada</span>
                </li>
              )}
              {plan.features.csvImport && (
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-secondary-700">Importar CSV</span>
                </li>
              )}
            </ul>
            <Button
              variant={plan.name === 'pro' ? 'primary' : 'outline'}
              size="lg"
              className="w-full mt-6"
              disabled={currentPlan?.id === plan.id}
              loading={checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate(plan.id)}
            >
              {currentPlan?.id === plan.id ? 'Plan Actual' : 'Seleccionar'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

