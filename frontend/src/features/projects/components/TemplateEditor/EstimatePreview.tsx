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
    <div className="bg-white w-full max-w-4xl mx-auto shadow-sm" style={{ minHeight: '800px', padding: '60px 80px', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', lineHeight: '1.6' }}>
      {sortedSections.map((section) => {
        switch (section.id) {
          case 'header':
            // Only show header if it has at least companyName or logo
            if (!header.companyName && !header.logoUrl) {
              return null;
            }
            return (
              <div key={section.id} className="mb-10 pb-8" style={{ borderBottom: '2px solid #8A3B12' }}>
                <EstimateHeaderComponent
                  header={header}
                  onChange={() => {}}
                  onLogoUpload={() => {}}
                  readOnly={true}
                />
              </div>
            );
          case 'jobSummary':
            // Only show jobSummary if it has content
            if (!jobSummary.jobTitle && !jobSummary.jobDescription && !projectName) {
              return null;
            }
            return (
              <div key={section.id} className="mb-8 pb-6" style={{ borderBottom: '1px solid #F4C197' }}>
                <JobSummarySection
                  jobSummary={jobSummary}
                  onChange={() => {}}
                  projectName={projectName}
                  readOnly
                />
              </div>
            );
          case 'projectInfo':
            // Only show projectInfo if it has at least one field
            if (!projectInfo.projectAddress && !projectInfo.city && !projectInfo.state && 
                !projectInfo.country && !projectInfo.estimateDate && !projectInfo.workDuration) {
              return null;
            }
            return (
              <div key={section.id} className="mb-8 pb-6" style={{ borderBottom: '1px solid #F4C197' }}>
                <ProjectInfoSection
                  projectInfo={projectInfo}
                  onChange={() => {}}
                  layout={section.layout || 'two-columns'}
                  readOnly
                />
              </div>
            );
          case 'itemsTable':
            return (
              <div key={section.id} className="mb-10">
                {/* Desktop Table */}
                <div className="hidden md:block mb-6">
                  <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #8A3B12' }}>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-[#8A3B12]" style={{ borderBottom: '2px solid #8A3B12' }}>Description</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-[#8A3B12]" style={{ borderBottom: '2px solid #8A3B12' }}>Quantity</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-[#8A3B12]" style={{ borderBottom: '2px solid #8A3B12' }}>Unit Price</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold text-[#8A3B12]" style={{ borderBottom: '2px solid #8A3B12' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr 
                          key={item.id}
                          style={{ 
                            borderBottom: index < lineItems.length - 1 ? '1px solid #F4C197' : 'none',
                            backgroundColor: index % 2 === 0 ? 'white' : '#FFF7EA'
                          }}
                        >
                          <td className="py-3 px-4 text-sm text-[#6C4A32]" style={{ wordBreak: 'break-word' }}>{item.description || '—'}</td>
                          <td className="py-3 px-4 text-sm text-right text-[#6C4A32]">{item.quantity || 0}</td>
                          <td className="py-3 px-4 text-sm text-right text-[#6C4A32]">${(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-right font-semibold text-[#8A3B12]">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-8 pt-6" style={{ borderTop: '2px solid #8A3B12' }}>
                    <div className="flex justify-end">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-[#8A3B12] mb-2">Total Estimate</div>
                        <div className="text-2xl font-bold text-[#F15A24]">
                          ${calculateTotal().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {lineItems.map((item) => (
                    <div key={item.id} className="border-b border-[#F4C197] pb-3">
                      <div className="text-sm font-semibold text-[#8A3B12] mb-2 break-words">{item.description || '—'}</div>
                      <div className="grid grid-cols-2 gap-3 mb-2 text-sm">
                        <div>
                          <span className="text-[#C05A2B] font-semibold">Quantity: </span>
                          <span className="text-[#6C4A32]">{item.quantity || 0}</span>
                        </div>
                        <div>
                          <span className="text-[#C05A2B] font-semibold">Unit Price: </span>
                          <span className="text-[#6C4A32]">${(item.unitPrice || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#F4C197] flex justify-between items-center">
                        <span className="text-sm font-semibold text-[#8A3B12]">Total:</span>
                        <span className="text-base font-bold text-[#F15A24]">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t-2 border-[#8A3B12]">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-[#8A3B12]">Total Estimate</span>
                      <span className="text-xl font-bold text-[#F15A24]">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          case 'paymentMethod':
            // Only show paymentMethod if it has at least one field
            const hasPaymentInfo = paymentMethod.bankName || paymentMethod.accountNumber || paymentMethod.paymentMode;
            const contactInfoSection = sections.find(s => s.id === 'contactInfo' && s.enabled);
            const hasContactInfo = contactInfo && (contactInfo.email || contactInfo.phone || contactInfo.website);
            
            if (contactInfoSection && hasContactInfo) {
              if (!hasPaymentInfo) {
                // Only show contactInfo if paymentMethod is empty
                return null;
              }
              return (
                <div key={`${section.id}-${contactInfoSection.id}`} className="mb-8 pt-8" style={{ borderTop: '2px solid #F4C197' }}>
                  <div className="grid grid-cols-2 gap-12">
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
            if (!hasPaymentInfo) {
              return null;
            }
            return (
              <div key={section.id} className="mb-8 pt-8" style={{ borderTop: '2px solid #F4C197' }}>
                <PaymentMethodSection
                  paymentMethod={paymentMethod}
                  onChange={() => {}}
                  layout={section.layout || 'two-columns'}
                  readOnly
                />
              </div>
            );
          case 'contactInfo':
            // Only show contactInfo if it has at least one field
            const hasContactInfoOnly = contactInfo && (contactInfo.email || contactInfo.phone || contactInfo.website);
            if (!hasContactInfoOnly) {
              return null;
            }
            const paymentMethodSection = sections.find(s => s.id === 'paymentMethod' && s.enabled);
            if (!paymentMethodSection) {
              return (
                <div key={section.id} className="mb-8 pt-8" style={{ borderTop: '2px solid #F4C197' }}>
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

