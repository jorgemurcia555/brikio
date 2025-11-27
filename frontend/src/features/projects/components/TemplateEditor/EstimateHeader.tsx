import { Upload, Building2, Calendar, Hash } from 'lucide-react';
import { InteractiveTooltip } from '../../../../components/ui/InteractiveTooltip';
import { EditableField } from './EditableField';
import { EstimateHeader as EstimateHeaderType } from '../../types/template.types';
import { useTranslation } from 'react-i18next';

interface EstimateHeaderProps {
  header: EstimateHeaderType;
  onChange: (field: keyof EstimateHeaderType, value: string) => void;
  onLogoUpload: (file: File) => void;
  readOnly?: boolean;
}

export function EstimateHeader({ header, onChange, onLogoUpload, readOnly = false }: EstimateHeaderProps) {
  const { t, i18n } = useTranslation();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoUpload(file);
    }
  };

  return (
    <div className={readOnly ? "" : "mb-8"}>
      {!readOnly && (
        <div className="flex items-center gap-2 mb-4 absolute ml-[-30px] mt-[2px]" >
          <InteractiveTooltip
            title={t('templateEditor.header.title')}
            content={
              <div className="space-y-2">
                <p><strong>{t('templateEditor.header.companyName')}:</strong> {t('templateEditor.header.companyNameDesc')}</p>
                <p><strong>{t('templateEditor.header.tagline')}:</strong> {t('templateEditor.header.taglineDesc')}</p>
                <p><strong>{t('templateEditor.header.logo')}:</strong> {t('templateEditor.header.logoDesc')}</p>
                <p><strong>{t('templateEditor.header.estimateDetails')}:</strong> {t('templateEditor.header.estimateDetailsDesc')}</p>
              </div>
            }
            size="lg"
          />
        </div>
      )}
      
      {/* Logo and Company Name Row */}
      <div className={`flex items-start justify-between gap-8 ${readOnly ? 'mb-0' : 'mb-6 pb-6 border-b-2 border-[#F4C197]'}`}>
        <div className="flex-1">
          {readOnly ? (
            <>
              {header.companyName && (
                <div className="text-2xl font-bold text-[#8A3B12] mb-3">{header.companyName}</div>
              )}
              {header.companyTagline && (
                <div className="text-sm text-[#6C4A32] mb-4 leading-relaxed">{header.companyTagline}</div>
              )}
              {(header.estimateNumber || header.date || header.workDuration) && (
                <div className="flex items-center gap-3 text-sm text-[#6C4A32] flex-wrap">
                  {header.estimateNumber && (
                    <div>
                      <span className="font-semibold text-[#8A3B12]">{t('templateEditor.header.estimateNumber')}: </span>
                      <span>{header.estimateNumber}</span>
                    </div>
                  )}
                  {header.date && (
                    <div>
                      <span className="font-semibold text-[#8A3B12]">{t('templateEditor.header.date')}: </span>
                      <span>{new Date(header.date).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  {header.workDuration && (
                    <div>
                      <span className="font-semibold text-[#8A3B12]">{t('templateEditor.header.duration')}: </span>
                      <span>{header.workDuration}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <EditableField
                value={header.companyName}
                onChange={(value) => onChange('companyName', value)}
                placeholder="Company Name"
                displayClassName="text-3xl font-display font-bold text-[#8A3B12] mb-2"
                className="text-2xl font-display font-bold"
              />
              <EditableField
                value={header.companyTagline}
                onChange={(value) => onChange('companyTagline', value)}
                placeholder="What does your company do? (optional)"
                displayClassName="text-sm text-[#6C4A32]"
                className="text-sm"
              />
              <div className="flex items-center gap-2 mt-1">
                <Hash className="w-4 h-4 text-[#C05A2B]" />
                <EditableField
                  value={header.estimateNumber}
                  onChange={(value) => onChange('estimateNumber', value)}
                  placeholder="0001"
                  displayClassName="flex-1"
                />
              </div>
            </>
          )}
        </div>

        {/* Logo Upload Area */}
        <div className="flex-shrink-0">
          {readOnly ? (
            header.logoUrl ? (
              <img
                src={header.logoUrl}
                alt="Company logo"
                className="w-20 h-20 object-contain"
              />
            ) : null
          ) : (
            <>
              {header.logoUrl ? (
                <div className="relative group">
                  <img
                    src={header.logoUrl}
                    alt="Company logo"
                    className="w-24 h-24 object-contain"
                  />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center cursor-pointer transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-[#F4C197] rounded-lg bg-[#FFF7EA] cursor-pointer hover:border-[#F15A24] transition-colors">
                  <Upload className="w-6 h-6 text-[#C05A2B] mb-1" />
                  <span className="text-xs text-[#6C4A32] text-center px-2">{t('templateEditor.header.uploadLogo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

