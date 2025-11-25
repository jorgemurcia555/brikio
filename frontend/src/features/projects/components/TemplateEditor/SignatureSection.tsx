import { PenTool, Upload } from 'lucide-react';
import { EditableField } from './EditableField';
import { Signature } from '../../types/template.types';

interface SignatureSectionProps {
  signature: Signature;
  onChange: (field: keyof Signature, value: string) => void;
  onSignatureUpload: (file: File) => void;
  readOnly?: boolean;
}

export function SignatureSection({ signature, onChange, onSignatureUpload, readOnly = false }: SignatureSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSignatureUpload(file);
    }
  };

  return (
    <div className="mb-8">
{/*       <h3 className="text-xl font-display font-bold text-[#8A3B12] mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-[#F15A24]" />
        Signature
      </h3> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <span className="text-sm font-semibold text-[#6C4A32] block mb-4">Responsible Name</span>
          <EditableField
            value={signature.responsibleName}
            onChange={(value) => onChange('responsibleName', value)}
            placeholder="Full Name"
            displayClassName="text-[#6C4A32] text-lg"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-[#6C4A32] block mb-2">Position</span>
          <EditableField
            value={signature.position}
            onChange={(value) => onChange('position', value)}
            placeholder="Job Title"
            displayClassName="text-[#6C4A32]"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-[#6C4A32] block mb-2">Signature Date</span>
          <EditableField
            value={signature.signatureDate}
            onChange={(value) => onChange('signatureDate', value)}
            type="date"
            displayClassName="text-[#6C4A32]"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-[#6C4A32] block mb-2">Digital Signature</span>
          {signature.signatureUrl ? (
            <div className="relative group">
              <img
                src={signature.signatureUrl}
                alt="Signature"
                className="w-full h-20 object-contain border border-[#F4C197] rounded-lg"
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
            <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-[#F4C197] rounded-lg bg-[#FFF7EA] cursor-pointer hover:border-[#F15A24] transition-colors">
              <Upload className="w-6 h-6 text-[#C05A2B] mb-1" />
              <span className="text-xs text-[#6C4A32]">Upload Signature</span>
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

