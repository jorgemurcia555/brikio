import { Upload, Building2, Calendar, Hash } from 'lucide-react';
import { InteractiveTooltip } from '../../../../components/ui/InteractiveTooltip';
import { EditableField } from './EditableField';
import { EstimateHeader as EstimateHeaderType } from '../../types/template.types';

interface EstimateHeaderProps {
  header: EstimateHeaderType;
  onChange: (field: keyof EstimateHeaderType, value: string) => void;
  onLogoUpload: (file: File) => void;
  readOnly?: boolean;
}

export function EstimateHeader({ header, onChange, onLogoUpload, readOnly = false }: EstimateHeaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLogoUpload(file);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 absolute ml-[-30px] mt-[2px]" >
        <InteractiveTooltip
          title="Header Information"
          content={
            <div className="space-y-2">
              <p><strong>Company Name:</strong> Your business name will appear prominently at the top.</p>
              <p><strong>Tagline:</strong> Optional brief description of what your company does.</p>
              <p><strong>Logo:</strong> Upload your company logo. It will appear on every page of the PDF.</p>
              <p><strong>Estimate Details:</strong> Number, date, and work duration help organize your estimates.</p>
            </div>
          }
          size="lg"
        />
      </div>
      
      {/* Logo and Company Name Row */}
      <div className="flex items-start justify-between gap-6 mb-6 pb-6 border-b-2 border-[#F4C197]">
        <div className="flex-1">
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
        </div>

        {/* Logo Upload Area */}
        <div className="flex-shrink-0">
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
              <span className="text-xs text-[#6C4A32] text-center px-2">Upload Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

