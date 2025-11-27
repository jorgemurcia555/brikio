import { CreditCard } from 'lucide-react';
import { EditableField } from './EditableField';
import { PaymentMethod } from '../../types/template.types';
import { useTranslation } from 'react-i18next';

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethod;
  onChange: (field: keyof PaymentMethod, value: string) => void;
  layout: 'one-column' | 'two-columns';
  readOnly?: boolean;
}

export function PaymentMethodSection({ paymentMethod, onChange, layout, readOnly = false }: PaymentMethodSectionProps) {
  const { t } = useTranslation();
  
  if (readOnly) {
    const hasAnyField = paymentMethod.bankName || paymentMethod.accountNumber || paymentMethod.paymentMode;
    
    if (!hasAnyField) {
      return null;
    }
    
    return (
      <div className="text-sm text-[#6C4A32] space-y-2">
        {paymentMethod.bankName && (
          <div>
            <span className="font-semibold text-[#8A3B12]">{t('templateEditor.paymentMethod.bank')}: </span>
            <span>{paymentMethod.bankName}</span>
          </div>
        )}
        {paymentMethod.accountNumber && (
          <div>
            <span className="font-semibold text-[#8A3B12]">{t('templateEditor.paymentMethod.account')}: </span>
            <span>{paymentMethod.accountNumber}</span>
          </div>
        )}
        {paymentMethod.paymentMode && (
          <div>
            <span className="font-semibold text-[#8A3B12]">{t('templateEditor.paymentMethod.paymentMode')}: </span>
            <span>{paymentMethod.paymentMode}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 flex-1">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.paymentMethod.bank')}:</span>
            <EditableField
              value={paymentMethod.bankName}
              onChange={(value) => onChange('bankName', value)}
              placeholder={t('templateEditor.paymentMethod.bankNamePlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.paymentMethod.account')}:</span>
            <EditableField
              value={paymentMethod.accountNumber}
              onChange={(value) => onChange('accountNumber', value)}
              placeholder={t('templateEditor.paymentMethod.accountNumberPlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.paymentMethod.mode')}:</span>
            <EditableField
              value={paymentMethod.paymentMode}
              onChange={(value) => onChange('paymentMode', value)}
              placeholder={t('templateEditor.paymentMethod.paymentModePlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

