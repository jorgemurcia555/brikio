import { Mail, Phone, Globe, Linkedin, Facebook, Twitter } from 'lucide-react';
import { EditableField } from './EditableField';
import { ContactInfo } from '../../types/template.types';

interface ContactInfoSectionProps {
  contactInfo: ContactInfo;
  onChange: (field: keyof ContactInfo, value: string) => void;
  layout: 'one-column' | 'two-columns';
  readOnly?: boolean;
}

export function ContactInfoSection({ contactInfo, onChange, layout, readOnly = false }: ContactInfoSectionProps) {
  if (readOnly) {
    const hasAnyField = contactInfo.email || contactInfo.phone || contactInfo.website;
    
    if (!hasAnyField) {
      return null;
    }
    
    return (
      <div className="text-sm text-[#6C4A32] space-y-2 text-right">
        {contactInfo.email && (
          <div>
            <span className="font-semibold text-[#8A3B12]">Email: </span>
            <span>{contactInfo.email}</span>
          </div>
        )}
        {contactInfo.phone && (
          <div>
            <span className="font-semibold text-[#8A3B12]">Phone: </span>
            <span>{contactInfo.phone}</span>
          </div>
        )}
        {contactInfo.website && (
          <div>
            <span className="font-semibold text-[#8A3B12]">Website: </span>
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
              placeholder="email@example.com"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <EditableField
              value={contactInfo.phone}
              onChange={(value) => onChange('phone', value)}
              placeholder="+1 (555) 123-4567"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <EditableField
              value={contactInfo.website}
              onChange={(value) => onChange('website', value)}
              placeholder="https://example.com"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

