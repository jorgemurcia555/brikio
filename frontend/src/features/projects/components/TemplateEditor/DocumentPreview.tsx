import { EstimateHeader, JobSummary, ProjectInfo, PaymentMethod, ContactInfo, Signature, TemplateSectionConfig } from '../../types/template.types';
import { LineItem } from './TemplateEditor';

interface DocumentPreviewProps {
  header: EstimateHeader;
  jobSummary: JobSummary;
  projectInfo: ProjectInfo;
  paymentMethod: PaymentMethod;
  contactInfo: ContactInfo;
  signature: Signature;
  lineItems: LineItem[];
  sections: TemplateSectionConfig[];
}

export function DocumentPreview({
  header,
  jobSummary,
  projectInfo,
  paymentMethod,
  contactInfo,
  signature,
  lineItems,
  sections,
}: DocumentPreviewProps) {
  const sortedSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div className="w-80 bg-white border-2 border-[#F4C197] rounded-2xl p-4 shadow-lg max-h-[calc(100vh-120px)] overflow-y-auto">
      <h3 className="text-lg font-display text-[#8A3B12] font-bold mb-4 sticky top-0 bg-white pb-2 border-b-2 border-[#F4C197] z-10">
        Document Preview
      </h3>
      <div className="space-y-4 text-xs bg-white" style={{ minHeight: '800px', padding: '30px', boxShadow: 'inset 0 0 0 1px #e5e7eb' }}>
        {/* Header */}
        {sortedSections.some((s) => s.id === 'header') && (
          <div className="border-b border-[#8A3B12] pb-3 mb-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="text-lg font-display font-bold text-[#8A3B12] mb-0.5 leading-tight">
                  {header.companyName || 'Company Name'}
                </div>
                {header.companyTagline && (
                  <div className="text-[10px] text-[#6C4A32] leading-tight">{header.companyTagline}</div>
                )}
              </div>
              {header.logoUrl && (
                <img src={header.logoUrl} alt="Logo" className="w-12 h-12 object-contain flex-shrink-0" />
              )}
            </div>
            <div className="flex gap-3 text-[10px] text-[#6C4A32]">
              {header.estimateNumber && <span><strong>Est. #:</strong> {header.estimateNumber}</span>}
              {header.date && <span><strong>Date:</strong> {new Date(header.date).toLocaleDateString()}</span>}
              {header.workDuration && <span><strong>Duration:</strong> {header.workDuration}</span>}
            </div>
          </div>
        )}

        {/* Job Summary - shown above table */}
        {sortedSections.some((s) => s.id === 'jobSummary') && sortedSections.some((s) => s.id === 'itemsTable') && (
          <div className="mb-3">
            <div className="text-base font-display font-bold text-[#8A3B12] mb-1 leading-tight">
              {jobSummary.jobTitle || 'Job Title'}
            </div>
            {jobSummary.jobDescription && (
              <div className="text-[10px] text-[#6C4A32] leading-tight">{jobSummary.jobDescription}</div>
            )}
          </div>
        )}

        {/* Project Info */}
        {sortedSections.some((s) => s.id === 'projectInfo') && (
          <div className="border-b border-[#F4C197] pb-2 mb-3">
            <div className="flex items-start gap-2">
              <div className="text-[10px] text-[#6C4A32] flex-1 space-y-0.5">
                {projectInfo.projectAddress && <div>{projectInfo.projectAddress}</div>}
                {(projectInfo.city || projectInfo.state || projectInfo.country) && (
                  <div>
                    {projectInfo.city}
                    {projectInfo.city && projectInfo.state && ', '}
                    {projectInfo.state}
                    {projectInfo.state && projectInfo.country && ', '}
                    {projectInfo.country}
                  </div>
                )}
                {(projectInfo.estimateDate || projectInfo.workDuration) && (
                  <div className="flex gap-2">
                    {projectInfo.estimateDate && <span>Date: {new Date(projectInfo.estimateDate).toLocaleDateString()}</span>}
                    {projectInfo.workDuration && <span>Duration: {projectInfo.workDuration}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        {sortedSections.some((s) => s.id === 'itemsTable') && (
          <div className="border-b border-[#F4C197] pb-3 mb-3">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-[#8A3B12]">
                  <th className="text-left py-1 px-1 text-[#8A3B12] font-semibold">Description</th>
                  <th className="text-right py-1 px-1 text-[#8A3B12] font-semibold">Qty</th>
                  <th className="text-right py-1 px-1 text-[#8A3B12] font-semibold">Unit</th>
                  <th className="text-right py-1 px-1 text-[#8A3B12] font-semibold">Price</th>
                  <th className="text-right py-1 px-1 text-[#8A3B12] font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.slice(0, 6).map((item) => (
                  <tr key={item.id} className="border-b border-[#F4C197]/50">
                    <td className="py-1 px-1 text-[#6C4A32] leading-tight">{item.description || 'Item'}</td>
                    <td className="py-1 px-1 text-right text-[#6C4A32]">{item.quantity}</td>
                    <td className="py-1 px-1 text-right text-[#6C4A32]">{item.unit}</td>
                    <td className="py-1 px-1 text-right text-[#6C4A32]">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-1 px-1 text-right font-semibold text-[#8A3B12]">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {lineItems.length > 6 && (
                <tfoot>
                  <tr>
                    <td colSpan={5} className="py-0.5 text-center text-[#C05A2B] text-[9px]">
                      +{lineItems.length - 6} more items
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
            <div className="mt-2 pt-2 border-t border-[#8A3B12] flex justify-between items-center">
              <span className="text-xs font-display font-bold text-[#8A3B12]">Estimate Total</span>
              <span className="text-sm font-display font-bold text-[#F15A24]">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Payment Method */}
        {sortedSections.some((s) => s.id === 'paymentMethod') && (
          <div className="border-b border-[#F4C197] pb-4 mb-4">
            <div className="text-lg font-display font-bold text-[#8A3B12] mb-2">Payment Method</div>
            <div className="text-sm text-[#6C4A32] space-y-1">
              {paymentMethod.bankName && <div><strong>Bank:</strong> {paymentMethod.bankName}</div>}
              {paymentMethod.accountNumber && <div><strong>Account:</strong> {paymentMethod.accountNumber}</div>}
              {paymentMethod.paymentMode && <div><strong>Mode:</strong> {paymentMethod.paymentMode}</div>}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {sortedSections.some((s) => s.id === 'contactInfo') && (
          <div className="border-b border-[#F4C197] pb-4 mb-4">
            <div className="text-lg font-display font-bold text-[#8A3B12] mb-2">Contact Information</div>
            <div className="text-sm text-[#6C4A32] space-y-1">
              {contactInfo.email && <div><strong>Email:</strong> {contactInfo.email}</div>}
              {contactInfo.phone && <div><strong>Phone:</strong> {contactInfo.phone}</div>}
              {contactInfo.website && <div><strong>Website:</strong> {contactInfo.website}</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

