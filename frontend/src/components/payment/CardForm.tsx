import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

interface CardFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function CardForm({ onSuccess, onCancel, loading = false }: CardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setError(submitError.message || t('register.payment.error'));
      setIsProcessing(false);
      return;
    }

    const { error: confirmError, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: 'if_required',
      confirmParams: {
        // No return_url needed when using if_required
      },
    });

    if (confirmError) {
      console.error('Stripe confirmSetup error:', confirmError);
      
      // Provide more helpful error messages
      let errorMessage = confirmError.message || t('register.payment.error');
      
      if (confirmError.code === 'card_declined') {
        if (import.meta.env.DEV) {
          errorMessage = `${confirmError.message}\n\n💡 For testing, use Stripe test cards:\n• Success: 4242 4242 4242 4242\n• Decline: 4000 0000 0000 0002\n• 3D Secure: 4000 0025 0000 3155`;
        } else {
          errorMessage = confirmError.message || 'Your card was declined. Please try a different card or contact your card issuer.';
        }
      } else if (confirmError.type === 'card_error') {
        errorMessage = confirmError.message || 'There was an error processing your card. Please check your card details and try again.';
      }
      
      setError(errorMessage);
      setIsProcessing(false);
      return;
    }

    if (setupIntent?.payment_method) {
      // setupIntent.payment_method can be a string (ID) or PaymentMethod object
      const paymentMethodId = typeof setupIntent.payment_method === 'string' 
        ? setupIntent.payment_method 
        : setupIntent.payment_method.id;
      
      console.log('Setup intent confirmed, payment method ID:', paymentMethodId);
      onSuccess(paymentMethodId);
    } else {
      console.error('No payment method in setup intent:', setupIntent);
      setError(t('register.payment.error'));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-secondary-200 rounded-lg bg-white">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {import.meta.env.DEV && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs">
          <p className="font-semibold mb-1">💡 Testing Mode</p>
          <p>Use Stripe test cards:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li><strong>Success:</strong> 4242 4242 4242 4242</li>
            <li><strong>3D Secure:</strong> 4000 0025 0000 3155</li>
            <li>Any future expiry date and CVC</li>
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing || loading}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isProcessing || loading}
          disabled={!stripe || isProcessing || loading}
          className="flex-1"
        >
          {t('register.payment.submit')}
        </Button>
      </div>
    </form>
  );
}

