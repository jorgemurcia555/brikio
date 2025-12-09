import { useState, useEffect } from 'react';
import { EstimateHeader, JobSummary, ProjectInfo, PaymentMethod, ContactInfo, Signature, TemplateSectionConfig } from '../../types/template.types';
import { LineItem } from './TemplateEditor';
import { EstimateHeader as EstimateHeaderComponent } from './EstimateHeader';
import { JobSummarySection } from './JobSummarySection';
import { ProjectInfoSection } from './ProjectInfoSection';
import { PaymentMethodSection } from './PaymentMethodSection';
import { ContactInfoSection } from './ContactInfoSection';
import { SignatureSection } from './SignatureSection';
import { useTranslation } from 'react-i18next';

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
  theme?: string;
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  taxEnabled?: boolean;
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
  theme = 'black',
  subtotal: providedSubtotal,
  taxTotal: providedTaxTotal,
  total: providedTotal,
  taxEnabled = false,
}: EstimatePreviewProps) {
  const { t } = useTranslation();
  const sortedSections = [...sections]
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateSubtotal = () => {
    // Calculate from lineItems first
    const calculatedFromItems = lineItems.reduce((sum, item) => {
      const quantity = parseFloat(String(item.quantity || 0));
      const unitPrice = parseFloat(String(item.unitPrice || 0));
      return sum + (quantity * unitPrice);
    }, 0);
    
    // Use provided value only if it's greater than 0, otherwise calculate from items
    if (providedSubtotal !== undefined && providedSubtotal > 0) {
      return providedSubtotal;
    }
    return calculatedFromItems;
  };

  const calculateTax = () => {
    // Use provided value if available (even if 0, as long as it's defined)
    if (providedTaxTotal !== undefined) {
      return providedTaxTotal;
    }
    
    // If taxEnabled is true but no provided tax, return 0 (will be calculated on backend)
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const calculatedTotal = subtotal + tax;
    
    // Use provided value only if it's greater than calculated total, otherwise use calculated
    if (providedTotal !== undefined && providedTotal > 0) {
      return providedTotal;
    }
    return calculatedTotal;
  };

  const taxValue = calculateTax();
  const shouldShowTax = taxEnabled && (taxValue > 0 || providedTaxTotal !== undefined);

  // Theme colors mapping
  const getThemeColors = () => {
    const themes: Record<string, { primary: string; secondary: string; text: string; border: string }> = {
      black: { primary: '#000000', secondary: '#1F2937', text: '#111827', border: '#E5E7EB' },
      company: { primary: '#F15A24', secondary: '#8A3B12', text: '#8A3B12', border: '#F4C197' },
      orange: { primary: '#F15A24', secondary: '#FF8C42', text: '#8A3B12', border: '#F4C197' },
      green: { primary: '#22C55E', secondary: '#16A34A', text: '#166534', border: '#86EFAC' },
      blue: { primary: '#3B82F6', secondary: '#2563EB', text: '#1E40AF', border: '#93C5FD' },
      red: { primary: '#EF4444', secondary: '#DC2626', text: '#991B1B', border: '#FCA5A5' },
    };
    return themes[theme] || themes.black;
  };

  const themeColors = getThemeColors();

  return (
    <div className="relative w-full">
      {/* Zoom Controls - Mobile Only */}
      {isMobile && (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 bg-white border-2 border-[#F4C197] rounded-lg p-2 shadow-lg">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
            className="p-2 bg-[#F15A24] text-white rounded hover:bg-[#C2410C] transition-colors"
            aria-label={t('templateEditor.preview.zoomIn')}
          >
            <span className="text-lg font-bold">+</span>
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
            className="p-2 bg-[#F15A24] text-white rounded hover:bg-[#C2410C] transition-colors"
            aria-label={t('templateEditor.preview.zoomOut')}
          >
            <span className="text-lg font-bold">−</span>
          </button>
          <div className="text-xs text-center text-[#8A3B12] font-semibold px-1">
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      )}
      
      <div 
        className="bg-white w-full max-w-4xl mx-auto shadow-sm overflow-x-auto" 
        style={{ 
          minHeight: isMobile ? '600px' : '800px', 
          padding: isMobile ? '12px 16px' : '40px 60px', 
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', 
          lineHeight: '1.5',
          transform: isMobile ? `scale(${zoomLevel})` : 'none',
          transformOrigin: 'top left',
          width: isMobile ? `${100 / zoomLevel}%` : '100%',
          color: themeColors.text,
        }}
      >
      {sortedSections.map((section) => {
        switch (section.id) {
          case 'header':
            // Only show header if it has at least companyName or logo
            if (!header.companyName && !header.logoUrl) {
              return null;
            }
            return (
              <div key={section.id} className={`mb-6 sm:mb-10 pb-4 sm:pb-8`} style={{ borderBottom: `2px solid ${themeColors.primary}` }}>
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
              <div key={section.id} className={`mb-4 sm:mb-8 pb-3 sm:pb-6`} style={{ borderBottom: `1px solid ${themeColors.border}` }}>
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
              <div key={section.id} className={`mb-4 sm:mb-8 pb-3 sm:pb-6`} style={{ borderBottom: `1px solid ${themeColors.border}` }}>
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
                      <tr style={{ borderBottom: `2px solid ${themeColors.primary}` }}>
                        <th className="text-left py-4 px-4 text-sm font-semibold" style={{ borderBottom: `2px solid ${themeColors.primary}`, color: themeColors.primary }}>{t('templateEditor.itemsTable.description')}</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold" style={{ borderBottom: `2px solid ${themeColors.primary}`, color: themeColors.primary }}>{t('templateEditor.itemsTable.quantity')}</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold" style={{ borderBottom: `2px solid ${themeColors.primary}`, color: themeColors.primary }}>{t('templateEditor.itemsTable.unitPrice')}</th>
                        <th className="text-right py-4 px-4 text-sm font-semibold" style={{ borderBottom: `2px solid ${themeColors.primary}`, color: themeColors.primary }}>{t('templateEditor.itemsTable.total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr 
                          key={item.id}
                          style={{ 
                            borderBottom: index < lineItems.length - 1 ? `1px solid ${themeColors.border}` : 'none',
                            backgroundColor: index % 2 === 0 ? 'white' : (theme === 'black' ? '#F9FAFB' : '#FFF7EA')
                          }}
                        >
                          <td className="py-3 px-4 text-sm" style={{ wordBreak: 'break-word', color: themeColors.text }}>{item.description || '—'}</td>
                          <td className="py-3 px-4 text-sm text-right" style={{ color: themeColors.text }}>{item.quantity || 0}</td>
                          <td className="py-3 px-4 text-sm text-right" style={{ color: themeColors.text }}>${(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-right font-semibold" style={{ color: themeColors.primary }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-8 pt-6" style={{ borderTop: `2px solid ${themeColors.primary}` }}>
                    <div className="flex justify-end">
                      <div className="text-right space-y-2">
                        <div className="flex justify-between items-center gap-8 mb-2">
                          <span className="text-sm" style={{ color: themeColors.text }}>{t('templateEditor.preview.subtotal', { defaultValue: 'Subtotal' })}:</span>
                          <span className="text-sm font-semibold" style={{ color: themeColors.text }}>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        {shouldShowTax && (
                          <div className="flex justify-between items-center gap-8 mb-2">
                            <span className="text-sm" style={{ color: themeColors.text }}>{t('templateEditor.preview.tax', { defaultValue: 'Tax' })}:</span>
                            <span className="text-sm font-semibold" style={{ color: themeColors.text }}>${taxValue.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center gap-8 pt-2" style={{ borderTop: `2px solid ${themeColors.primary}` }}>
                          <span className="text-lg font-semibold" style={{ color: themeColors.primary }}>{t('templateEditor.preview.totalEstimate')}</span>
                          <span className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                            ${calculateTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-2.5">
                  {lineItems.map((item) => (
                    <div key={item.id} className="border-b border-[#F4C197] pb-2.5 last:border-b-0">
                      <div className="text-xs sm:text-sm font-semibold text-[#8A3B12] mb-1.5 break-words">{item.description || '—'}</div>
                      <div className="grid grid-cols-2 gap-2 mb-1.5 text-xs">
                        <div>
                          <span className="text-[#C05A2B] font-medium">{t('templateEditor.itemsTable.quantity')}: </span>
                          <span className="text-[#6C4A32]">{item.quantity || 0}</span>
                        </div>
                        <div>
                          <span className="text-[#C05A2B] font-medium">{t('templateEditor.itemsTable.unitPrice')}: </span>
                          <span className="text-[#6C4A32]">${(item.unitPrice || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-[#F4C197] flex justify-between items-center">
                        <span className="text-xs font-semibold text-[#8A3B12]">{t('templateEditor.itemsTable.total')}:</span>
                        <span className="text-sm font-bold text-[#F15A24]">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t-2 border-[#8A3B12] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#6C4A32]">{t('templateEditor.preview.subtotal', { defaultValue: 'Subtotal' })}:</span>
                      <span className="text-xs font-semibold text-[#8A3B12]">
                        ${calculateSubtotal().toFixed(2)}
                      </span>
                    </div>
                    {shouldShowTax && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#6C4A32]">{t('templateEditor.preview.tax', { defaultValue: 'Tax' })}:</span>
                        <span className="text-xs font-semibold text-[#8A3B12]">
                          ${taxValue.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1.5 border-t border-[#8A3B12]">
                      <span className="text-sm font-semibold text-[#8A3B12]">{t('templateEditor.preview.totalEstimate')}</span>
                      <span className="text-lg font-bold text-[#F15A24]">
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
                <div key={`${section.id}-${contactInfoSection.id}`} className="mb-8 pt-8" style={{ borderTop: `2px solid ${themeColors.border}` }}>
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
              <div key={section.id} className="mb-8 pt-8" style={{ borderTop: `2px solid ${themeColors.border}` }}>
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
                <div key={section.id} className="mb-8 pt-8" style={{ borderTop: `2px solid ${themeColors.border}` }}>
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
    </div>
  );
}

