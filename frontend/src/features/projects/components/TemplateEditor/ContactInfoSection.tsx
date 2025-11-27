import { Mail, Phone, Globe, Linkedin, Facebook, Twitter } from 'lucide-react';
import { EditableField } from './EditableField';
import { ContactInfo } from '../../types/template.types';
import { useTranslation } from 'react-i18next';

interface ContactInfoSectionProps {
  contactInfo: ContactInfo;
  onChange: (field: keyof ContactInfo, value: string) => void;
  layout: 'one-column' | 'two-columns';
  readOnly?: boolean;
}

export function ContactInfoSection({ contactInfo, onChange, layout, readOnly = false }: ContactInfoSectionProps) {
  const { t } = useTranslation();
  
  if (readOnly) {
    const hasAnyField = contactInfo.email || contactInfo.phone || contactInfo.website;
    
    if (!hasAnyField) {
      return null;
    }
    
    return (
      <div className="text-sm text-[#6C4A32] space-y-2 text-right">
        {contactInfo.email && (
          <div>
            <span className="font-semibold text-[#8A3B12]">{t('templateEditor.contactInfo.email')}: </span>
            <span>{contactInfo.email}</span>
          </div>
        )}
        {contactInfo.phone && (
          <div>
            <span className="font-semibold text-[#8A3B12]">{t('templateEditor.contactInfo.phone')}: </span>
            <span>{contactInfo.phone}</span>
          </div>
        )}
        {contactInfo.website && (
          <div>
            <span className="font-semibold text-[#8A3B12]">{t('templateEditor.contactInfo.website')}: </span>
            <span>{contactInfo.website}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6 flex-1">
      <div className="flex items-start gap-4 text-right">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <EditableField
              type="text"
              value={contactInfo.email}
              onChange={(value) => onChange('email', value)}
              placeholder={t('templateEditor.contactInfo.emailPlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <EditableField
              value={contactInfo.phone}
              onChange={(value) => onChange('phone', value)}
              placeholder={t('templateEditor.contactInfo.phonePlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <EditableField
              value={contactInfo.website}
              onChange={(value) => onChange('website', value)}
              placeholder={t('templateEditor.contactInfo.websitePlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

