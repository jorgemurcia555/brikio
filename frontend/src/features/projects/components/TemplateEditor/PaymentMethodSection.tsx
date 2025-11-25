import { CreditCard } from 'lucide-react';
import { EditableField } from './EditableField';
import { PaymentMethod } from '../../types/template.types';

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethod;
  onChange: (field: keyof PaymentMethod, value: string) => void;
  layout: 'one-column' | 'two-columns';
  readOnly?: boolean;
}

export function PaymentMethodSection({ paymentMethod, onChange, layout, readOnly = false }: PaymentMethodSectionProps) {
  return (
    <div className="mb-6 flex-1">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">Bank:</span>
            <EditableField
              value={paymentMethod.bankName}
              onChange={(value) => onChange('bankName', value)}
              placeholder="Bank Name"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">Account:</span>
            <EditableField
              value={paymentMethod.accountNumber}
              onChange={(value) => onChange('accountNumber', value)}
              placeholder="Account Number / IBAN"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">Mode:</span>
            <EditableField
              value={paymentMethod.paymentMode}
              onChange={(value) => onChange('paymentMode', value)}
              placeholder="Bank transfer, Cash, Check, Card, Online, etc."
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

