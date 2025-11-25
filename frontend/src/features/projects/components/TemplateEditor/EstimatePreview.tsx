import { EstimateHeader, JobSummary, ProjectInfo, PaymentMethod, ContactInfo, Signature, TemplateSectionConfig } from '../../types/template.types';
import { LineItem } from './TemplateEditor';
import { EstimateHeader as EstimateHeaderComponent } from './EstimateHeader';
import { JobSummarySection } from './JobSummarySection';
import { ProjectInfoSection } from './ProjectInfoSection';
import { PaymentMethodSection } from './PaymentMethodSection';
import { ContactInfoSection } from './ContactInfoSection';
import { SignatureSection } from './SignatureSection';

interface EstimatePreviewProps {
  projectName?: string;
  lineItems: LineItem[];
  sections: TemplateSectionConfig[];
  header: EstimateHeader;
  jobSummary: JobSummary;
  projectInfo: ProjectInfo;
  paymentMethod: PaymentMethod;
  contactInfo: ContactInfo;
  signature: Signature;
}

export function EstimatePreview({
  projectName,
  lineItems,
  sections,
  header,
  jobSummary,
  projectInfo,
  paymentMethod,
  contactInfo,
  signature,
}: EstimatePreviewProps) {
  const sortedSections = [...sections]
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="bg-white border-2 border-[#F4C197] rounded-2xl shadow-lg w-full max-w-4xl mx-auto" style={{ minHeight: '800px', padding: '40px' }}>
      {sortedSections.map((section) => {
        switch (section.id) {
          case 'header':
            return (
              <EstimateHeaderComponent
                key={section.id}
                header={header}
                onChange={() => {}}
                onLogoUpload={() => {}}
                readOnly={true}
              />
            );
          case 'jobSummary':
            return (
              <div key={section.id} className="mb-4">
                <JobSummarySection
                  jobSummary={jobSummary}
                  onChange={() => {}}
                  projectName={projectName}
                />
              </div>
            );
          case 'projectInfo':
            return (
              <ProjectInfoSection
                key={section.id}
                projectInfo={projectInfo}
                onChange={() => {}}
                layout={section.layout || 'two-columns'}
                readOnly
              />
            );
          case 'itemsTable':
            return (
              <div key={section.id} className="mb-8">
                {/* Desktop Table */}
                <div className="hidden md:block mb-4">
                  <div className="grid grid-cols-10 gap-1.5 mb-2 pb-1.5 border-b-2 border-[#8A3B12]">
                    <div className="col-span-5 text-left py-1 px-1.5 text-[#8A3B12] font-semibold">
                      <span className="text-xs">Description</span>
                    </div>
                    <div className="col-span-2 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                      <span className="text-xs">Quantity</span>
                    </div>
                    <div className="col-span-2 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                      <span className="text-xs">Unit Price</span>
                    </div>
                    <div className="col-span-1 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                      <span className="text-xs">Total</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#FFF7EA] border-2 border-[#F4C197] rounded-lg p-2.5 grid grid-cols-10 gap-1.5 items-center"
                      >
                        <div className="col-span-5 text-xs text-[#6C4A32] min-w-0 truncate">
                          {item.description || '—'}
                        </div>
                        <div className="col-span-2 text-right text-xs text-[#6C4A32]">
                          {item.quantity || 0}
                        </div>
                        <div className="col-span-2 text-right text-xs text-[#6C4A32]">
                          ${(item.unitPrice || 0).toFixed(2)}
                        </div>
                        <div className="col-span-1 text-right text-xs font-semibold text-[#8A3B12] min-w-0 truncate">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-[#F15A24]">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <div className="text-xl font-display text-[#8A3B12] mb-1">Total</div>
                        <div className="text-2xl font-display text-[#F15A24]">
                          ${calculateTotal().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2">
                  {lineItems.map((item) => (
                    <div key={item.id} className="bg-[#FFF7EA] rounded-lg border border-[#F4C197] p-2.5">
                      <div className="text-xs font-semibold text-[#8A3B12] mb-1.5 break-words">{item.description || '—'}</div>
                      <div className="grid grid-cols-2 gap-2 mb-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#C05A2B] font-semibold whitespace-nowrap">Qty:</span>
                          <span className="text-xs text-[#6C4A32]">{item.quantity || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#C05A2B] font-semibold whitespace-nowrap">Price:</span>
                          <span className="text-xs text-[#6C4A32]">${(item.unitPrice || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-[#F4C197] flex justify-between items-center">
                        <span className="text-[10px] text-[#C05A2B] font-semibold">Total:</span>
                        <span className="text-sm font-bold text-[#F15A24]">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="bg-[#FDEFD9] rounded-xl border-2 border-[#F4C197] p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-[#8A3B12]">Total</span>
                      <span className="text-2xl font-bold text-[#F15A24]">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          case 'paymentMethod':
            const contactInfoSection = sections.find(s => s.id === 'contactInfo' && s.enabled);
            if (contactInfoSection) {
              return (
                <div key={`${section.id}-${contactInfoSection.id}`} className="mb-6 pt-4 border-t border-[#F4C197]">
                  <div className="flex gap-6 items-start">
                    <PaymentMethodSection
                      paymentMethod={paymentMethod}
                      onChange={() => {}}
                      layout={section.layout || 'two-columns'}
                      readOnly
                    />
                    <ContactInfoSection
                      contactInfo={contactInfo}
                      onChange={() => {}}
                      layout={contactInfoSection.layout || 'two-columns'}
                      readOnly
                    />
                  </div>
                </div>
              );
            }
            return (
              <div key={section.id} className="mb-6 pt-4 border-t border-[#F4C197]">
                <PaymentMethodSection
                  paymentMethod={paymentMethod}
                  onChange={() => {}}
                  layout={section.layout || 'two-columns'}
                  readOnly
                />
              </div>
            );
          case 'contactInfo':
            const paymentMethodSection = sections.find(s => s.id === 'paymentMethod' && s.enabled);
            if (!paymentMethodSection) {
              return (
                <div key={section.id} className="mb-6 pt-4 border-t border-[#F4C197]">
                  <ContactInfoSection
                    contactInfo={contactInfo}
                    onChange={() => {}}
                    layout={section.layout || 'two-columns'}
                    readOnly
                  />
                </div>
              );
            }
            return null;
          /* case 'signature':
            return (
              <SignatureSection
                key={section.id}
                signature={signature}
                onChange={() => {}}
                onSignatureUpload={() => {}}
                readOnly
              />
            ); */
          default:
            return null;
        }
      })}
    </div>
  );
}

