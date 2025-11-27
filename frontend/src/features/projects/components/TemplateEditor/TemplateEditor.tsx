import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { TemplateSectionConfig, TemplateSectionId, EstimateHeader, JobSummary, ProjectInfo, PaymentMethod, ContactInfo, Signature } from '../../types/template.types';
import { TradeSpecialtyId, ResourceTemplate } from '../../types/trade.types';
import { TemplateToolbar } from './TemplateToolbar';
import { ResourceBar } from './ResourceBar';
import { AIChatPanel } from './AIChatPanel';
import { RESOURCE_TEMPLATES } from '../../constants/trade.constants';
import * as Icons from 'lucide-react';
import { EstimateHeader as EstimateHeaderComponent } from './EstimateHeader';
import { JobSummarySection } from './JobSummarySection';
import { ProjectInfoSection } from './ProjectInfoSection';
import { PaymentMethodSection } from './PaymentMethodSection';
import { ContactInfoSection } from './ContactInfoSection';
import { SignatureSection } from './SignatureSection';
import { Button } from '../../../../components/ui/Button';
import { EditableField } from './EditableField';
import { InteractiveTooltip } from '../../../../components/ui/InteractiveTooltip';
import { Plus, X, Eye, EyeOff, Settings, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { UNIT_OPTIONS } from '../../constants/units.constants';
import { useAuthStore } from '../../../../stores/authStore';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '../../../../services/api';
import { toast } from 'sonner';
import { Modal } from '../../../../components/ui/Modal';
import { Input } from '../../../../components/ui/Input';
import { useTranslation } from 'react-i18next';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface TemplateData {
  sections: TemplateSectionConfig[];
  header: EstimateHeader;
  jobSummary: JobSummary;
  projectInfo: ProjectInfo;
  paymentMethod: PaymentMethod;
  contactInfo: ContactInfo;
  signature: Signature;
  theme?: string;
}

interface TemplateEditorProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
  selectedTrade: TradeSpecialtyId | null;
  projectName?: string;
  onTemplateChange?: (template: TemplateData) => void;
}

export function TemplateEditor({ lineItems, onLineItemsChange, selectedTrade, projectName, onTemplateChange }: TemplateEditorProps) {
  const { t } = useTranslation();
  
  const getInitialSections = (): TemplateSectionConfig[] => [
    { id: 'header', label: t('templateEditor.sections.header'), enabled: true, order: 0 },
    { id: 'projectInfo', label: t('templateEditor.sections.projectInfo'), enabled: true, order: 1, layout: 'two-columns' },
    { id: 'jobSummary', label: t('templateEditor.sections.jobSummary'), enabled: true, order: 2 },
    { id: 'itemsTable', label: t('templateEditor.sections.itemsTable'), enabled: true, order: 3, required: true },
    { id: 'paymentMethod', label: t('templateEditor.sections.paymentMethod'), enabled: true, order: 4, layout: 'two-columns' },
    { id: 'contactInfo', label: t('templateEditor.sections.contactInfo'), enabled: true, order: 5, layout: 'two-columns' },
    /* { id: 'signature', label: t('templateEditor.sections.signature'), enabled: false, order: 6 }, */
  ];
  
  const [sections, setSections] = useState<TemplateSectionConfig[]>(getInitialSections());
  
  // Update section labels when language changes
  useEffect(() => {
    setSections(getInitialSections());
  }, [t]);
  const [draggedSection, setDraggedSection] = useState<TemplateSectionId | null>(null);
  const [showUnitColumn, setShowUnitColumn] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string>('black');
  
  // Mobile floating panels state
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showMobileResources, setShowMobileResources] = useState(false);
  const [showMobileAIChat, setShowMobileAIChat] = useState(false);
  const [clickedSection, setClickedSection] = useState<TemplateSectionId | null>(null);
  
  // Tour state
  const [runTour, setRunTour] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const toolsBarRef = useRef<HTMLDivElement>(null);
  const resourcesBarRef = useRef<HTMLDivElement>(null);
  const aiChatRef = useRef<HTMLDivElement>(null);
  const editableFieldRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile first
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check if tour has been shown before - after mobile detection
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('template-editor-tour-seen');
    if (!hasSeenTour) {
      // Longer delay to ensure DOM is ready and mobile detection is complete
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);
  
  // Save template state
  const { isAuthenticated } = useAuthStore();
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  // Fetch saved templates
  const { data: savedTemplates } = useQuery({
    queryKey: ['estimate-templates'],
    queryFn: () => api.get('/estimate-templates'),
    enabled: isAuthenticated,
  });
  
  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; templateData: any }) =>
      api.post('/estimate-templates', data),
    onSuccess: () => {
      toast.success(t('templateEditor.saveTemplate.success'));
      setShowSaveTemplateModal(false);
      setTemplateName('');
      setTemplateDescription('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('templateEditor.saveTemplate.error'));
    },
  });
  
  const handleSaveTemplate = () => {
    if (!isAuthenticated) {
      toast.error(t('templateEditor.saveTemplate.error'));
      return;
    }
    setShowSaveTemplateModal(true);
  };
  
  const handleConfirmSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error(t('templateEditor.saveTemplate.nameRequiredError'));
      return;
    }
    
    const templateData = {
      sections,
      header,
      jobSummary,
      projectInfo,
      paymentMethod,
      contactInfo,
      signature,
      theme: selectedTheme,
    };
    
    saveTemplateMutation.mutate({
      name: templateName,
      description: templateDescription,
      templateData,
    });
  };
  
  const [header, setHeader] = useState<EstimateHeader>({
    companyName: '',
    companyTagline: '',
    estimateNumber: '',
    date: new Date().toISOString().split('T')[0],
    workDuration: '',
  });
  
  const [jobSummary, setJobSummary] = useState<JobSummary>({
    jobTitle: '',
    jobDescription: '',
  });
  
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    clientName: '',
    projectAddress: '',
    city: '',
    state: '',
    country: '',
    estimateDate: new Date().toISOString().split('T')[0],
    workDuration: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    bankName: '',
    accountNumber: '',
    paymentMode: '',
  });
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    facebook: '',
    twitter: '',
  });
  
  const [signature, setSignature] = useState<Signature>({
    responsibleName: '',
    position: '',
    signatureDate: new Date().toISOString().split('T')[0],
  });

  const handleToggleSection = (sectionId: TemplateSectionId) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleChangeLayout = (sectionId: TemplateSectionId, layout: 'one-column' | 'two-columns') => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, layout } : s
    ));
  };

  const handleReorderSections = useCallback((newSections: TemplateSectionConfig[]) => {
    setSections(newSections);
  }, []);

  // Expose template data to parent
  useEffect(() => {
    if (onTemplateChange) {
      onTemplateChange({
        sections,
        header,
        jobSummary,
        projectInfo,
        paymentMethod,
        contactInfo,
        signature,
        theme: selectedTheme,
      } as TemplateData & { theme: string });
    }
  }, [sections, header, jobSummary, projectInfo, paymentMethod, contactInfo, signature, selectedTheme, onTemplateChange]);

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setHeader({ ...header, logoUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSignature({ ...signature, signatureUrl: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 0,
      unit: 'm²',
      unitPrice: 0,
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    onLineItemsChange(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeLineItem = (id: string) => {
    onLineItemsChange(lineItems.filter(item => item.id !== id));
  };

  const handleAddResource = (resource: ResourceTemplate) => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: resource.label, // Use label (English) instead of description
      quantity: resource.defaultQuantity,
      unit: resource.defaultUnit,
      unitPrice: 0,
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const sortedSections = [...sections]
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  // Tour steps - filter out toolbar steps on mobile
  const allTourSteps: Step[] = [
    {
      target: 'body',
      content: t('tour.welcome.content'),
      title: t('tour.welcome.title'),
      placement: 'center' as const,
      disableBeacon: true,
      styles: {
        options: {
          width: isMobile ? '95vw' : 'auto',
        },
      },
    },
    {
      target: isMobile ? '.tour-mobile-tools-button' : '.tour-tools-bar',
      content: isMobile ? t('tour.mobileToolsButton.content') : t('tour.toolsBar.content'),
      title: isMobile ? t('tour.mobileToolsButton.title') : t('tour.toolsBar.title'),
      placement: isMobile ? ('left' as const) : ('right' as const),
      disableBeacon: true,
      disableScrolling: isMobile ? true : false,
      floaterProps: isMobile ? {
        disableAnimation: true,
        placement: 'left',
        styles: {
          arrow: {
            display: 'none',
          },
        },
      } : undefined,
      styles: isMobile ? {
        options: {
          zIndex: 10001,
        },
        tooltip: {
          position: 'fixed',
          maxWidth: '80vw',
        },
      } : undefined,
    },
    {
      target: '.tour-themes',
      content: t('tour.themes.content'),
      title: t('tour.themes.title'),
      placement: 'right' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-templates',
      content: t('tour.templates.content'),
      title: t('tour.templates.title'),
      placement: 'right' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-sections',
      content: t('tour.sections.content'),
      title: t('tour.sections.title'),
      placement: 'right' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-resources-bar',
      content: t('tour.resourcesBar.content'),
      title: t('tour.resourcesBar.title'),
      placement: 'bottom' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-ai-chat',
      content: t('tour.aiChat.content'),
      title: t('tour.aiChat.title'),
      placement: 'left' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-editable-field',
      content: t('tour.editableFields.content'),
      title: t('tour.editableFields.title'),
      placement: 'top' as const,
      disableBeacon: true,
    },
    {
      target: '.tour-hide-show',
      content: t('tour.hideShow.content'),
      title: t('tour.hideShow.title'),
      placement: 'right' as const,
      disableBeacon: true,
    },
    {
      target: 'body',
      content: t('tour.finish.content'),
      title: t('tour.finish.title'),
      placement: 'center' as const,
      disableBeacon: true,
      styles: {
        options: {
          width: isMobile ? '95vw' : 'auto',
        },
      },
    },
  ];
  
  // Filter steps for mobile (exclude toolbar-related steps, but keep mobile tools button)
  const tourSteps = useMemo(() => {
    if (isMobile) {
      return allTourSteps.filter(step => {
        const target = typeof step.target === 'string' ? step.target : '';
        // Keep mobile tools button step, but exclude desktop toolbar steps
        if (target.includes('tour-mobile-tools-button')) {
          return true;
        }
        return !target.includes('tour-tools-bar') && 
               !target.includes('tour-themes') && 
               !target.includes('tour-templates') && 
               !target.includes('tour-sections') &&
               !target.includes('tour-hide-show') &&
               !target.includes('tour-ai-chat'); // AI chat is also hidden on mobile initially
      });
    }
    return allTourSteps;
  }, [allTourSteps, isMobile]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;
    
    // Log for debugging
    if (import.meta.env.DEV) {
      console.log('Joyride callback:', { status, action, index, type, stepIndex: index });
    }
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem('template-editor-tour-seen', 'true');
    }
  };

  const startTour = () => {
    setRunTour(true);
  };

  return (
    <div className="flex gap-2 sm:gap-4 lg:gap-6 items-start">
      {/* Tour Button - Positioned to avoid overlap with chat button */}
      <button
        onClick={startTour}
        className={`fixed ${isMobile ? 'bottom-24 right-4' : 'bottom-4 right-4'} z-50 bg-[#F15A24] text-white p-3 rounded-full shadow-lg hover:bg-[#C2410C] transition-colors flex items-center gap-2`}
        title={t('tour.welcome.title')}
        aria-label={t('tour.welcome.title')}
      >
        <HelpCircle className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-semibold">Tour</span>
      </button>

      <Joyride
        steps={tourSteps}
        run={runTour}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: '#F15A24',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: '12px',
            padding: '20px',
            maxWidth: isMobile ? '95vw' : '400px',
            width: isMobile ? '95vw' : 'auto',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            backgroundColor: '#F15A24',
            borderRadius: '8px',
            padding: '10px 20px',
          },
          buttonBack: {
            color: '#8A3B12',
            marginRight: '10px',
          },
          buttonSkip: {
            color: '#6C4A32',
          },
        }}
        locale={{
          back: t('common.back'),
          close: t('common.close'),
          last: t('tour.finish.title'),
          next: t('common.next'),
          skip: t('common.skip'),
        }}
        floaterProps={{
          disableAnimation: true,
        }}
        spotlightClicks={false}
        disableOverlayClose
        scrollOffset={0}
        scrollToFirstStep={false}
        disableScrolling={false}
        disableScrollParentFix={true}
      />

      {/* Left Sidebar - Template Tools with equal width container */}
      <div ref={toolsBarRef} className="hidden sm:block w-12 sm:w-16 lg:w-80 flex-shrink-0 tour-tools-bar">
        <TemplateToolbar
          sections={sections}
          onToggleSection={handleToggleSection}
          onChangeLayout={handleChangeLayout}
          onDragStart={setDraggedSection}
          onDragEnd={() => setDraggedSection(null)}
          onReorderSections={handleReorderSections}
          draggedSection={draggedSection}
          onThemeChange={setSelectedTheme}
          onSaveTemplate={isAuthenticated ? handleSaveTemplate : undefined}
          templateData={{
            sections,
            header,
            jobSummary,
            projectInfo,
            paymentMethod,
            contactInfo,
            signature,
            theme: selectedTheme,
          }}
        />
      </div>

      {/* Center - Main Editor */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        {/* Resource Bar */}
        <div ref={resourcesBarRef} className="w-full max-w-4xl px-2 sm:px-0 tour-resources-bar">
          <ResourceBar selectedTrade={selectedTrade} onAddResource={handleAddResource} />
        </div>

        {/* Document Content - Centered, looks like real document */}
        <div className="rounded-xl mt-2 sm:mt-[2rem] bg-white shadow-sm border-2 border-[#F4C197] rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-4xl p-3 sm:p-6 lg:p-10" style={{ minHeight: '600px' }}>
          {sortedSections.map((section) => {
            switch (section.id) {
              case 'header':
                return (
                  <div 
                    key={section.id}
                    className="relative group tour-editable-field"
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setClickedSection(section.id);
                        setTimeout(() => setClickedSection(null), 3000);
                      }
                    }}
                  >
                    {clickedSection === section.id && window.innerWidth < 640 && (
                      <div className="absolute top-full left-0 mt-2 z-50 bg-[#8A3B12] text-white text-xs px-4 py-3 rounded-lg shadow-xl max-w-[280px]">
                        <p className="font-semibold mb-1">{t('templateEditor.sections.header')}</p>
                        <p className="mb-2">{t('templateEditor.header.editCompanyInfo')}</p>
                        <p className="text-[10px] opacity-90">{t('templateEditor.toolbar.useToolsPanel')}</p>
                      </div>
                    )}
                    <EstimateHeaderComponent
                      header={header}
                      onChange={(field, value) => setHeader({ ...header, [field]: value })}
                      onLogoUpload={handleLogoUpload}
                    />
                  </div>
                );
              case 'jobSummary':
                // Job Summary is now shown above items table, skip here
                return null;
              case 'projectInfo':
                return (
                  <div 
                    key={section.id}
                    className="relative group"
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setClickedSection(section.id);
                        setTimeout(() => setClickedSection(null), 3000);
                      }
                    }}
                  >
                    {clickedSection === section.id && window.innerWidth < 640 && (
                      <div className="absolute top-full left-0 mt-2 z-50 bg-[#8A3B12] text-white text-xs px-4 py-3 rounded-lg shadow-xl max-w-[280px]">
                        <p className="font-semibold mb-1">{t('templateEditor.sections.projectInfo')}</p>
                        <p className="mb-2">{t('templateEditor.projectInfo.editProjectInfo')}</p>
                        <p className="text-[10px] opacity-90">{t('templateEditor.toolbar.useToolsPanelColumns')}</p>
                      </div>
                    )}
                    <ProjectInfoSection
                      projectInfo={projectInfo}
                      onChange={(field, value) => setProjectInfo({ ...projectInfo, [field]: value })}
                      layout={section.layout || 'two-columns'}
                    />
                  </div>
                );
              case 'itemsTable':
                return (
                  <div 
                    key={section.id} 
                    className="mb-8 relative group"
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setClickedSection(section.id);
                        setTimeout(() => setClickedSection(null), 3000);
                      }
                    }}
                  >
                    {clickedSection === section.id && window.innerWidth < 640 && (
                      <div className="absolute top-full left-0 mt-2 z-50 bg-[#8A3B12] text-white text-xs px-4 py-3 rounded-lg shadow-xl max-w-[280px]">
                        <p className="font-semibold mb-1">{t('templateEditor.sections.itemsTable')}</p>
                        <p className="mb-2">{t('templateEditor.itemsTable.editItems')}</p>
                        <p className="text-[10px] opacity-90">{t('templateEditor.toolbar.requiredSection')}</p>
                      </div>
                    )}
                    {/* Job Summary above table if enabled */}
                    {sections.find(s => s.id === 'jobSummary' && s.enabled) && (
                      <div className="mb-4">
                        <JobSummarySection
                          jobSummary={jobSummary}
                          onChange={(field, value) => setJobSummary({ ...jobSummary, [field]: value })}
                          projectName={projectName}
                        />
                      </div>
                    )}

                    {/* Desktop Table */}
                    <div className="hidden md:block mb-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-11 gap-1.5 mb-2 pb-1.5 border-b-2 border-[#8A3B12]">
                        <div className="col-span-5 text-left py-1 px-1.5 text-[#8A3B12] font-semibold">
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{t('templateEditor.itemsTable.description')}</span>
                            <InteractiveTooltip
                              title={t('templateEditor.itemsTable.description')}
                              content={t('templateEditor.itemsTable.descriptionTooltip')}
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs">{t('templateEditor.itemsTable.quantity')}</span>
                            <InteractiveTooltip
                              title={t('templateEditor.itemsTable.quantity')}
                              content={t('templateEditor.itemsTable.quantityTooltip')}
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs">{t('templateEditor.itemsTable.unitPrice')}</span>
                            <InteractiveTooltip
                              title={t('templateEditor.itemsTable.unitPrice')}
                              content={t('templateEditor.itemsTable.unitPriceTooltip')}
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-1 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                          <span className="text-xs">{t('templateEditor.itemsTable.total')}</span>
                        </div>
                        <div className="col-span-1"></div>
                      </div>

                      {/* Line Items as Cards */}
                      <div className="space-y-2">
                        {lineItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#FFF7EA] border-2 border-[#F4C197] rounded-lg p-2.5 grid grid-cols-11 gap-1.5 items-center"
                          >
                            <div className="col-span-5 min-w-0">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                placeholder={t('templateEditor.itemsTable.descriptionPlaceholder')}
                                className="w-full bg-white border border-[#F4C197] rounded px-2 py-1.5 text-xs text-[#6C4A32] focus:outline-none focus:border-[#F15A24] truncate"
                              />
                            </div>
                            <div className="col-span-2 min-w-0">
                              <input
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min={0}
                                step={0.01}
                                className="w-full bg-white border border-[#F4C197] rounded px-2 py-1.5 text-xs text-right text-[#6C4A32] focus:outline-none focus:border-[#F15A24]"
                              />
                            </div>
                            <div className="col-span-2 min-w-0">
                              <input
                                type="number"
                                value={item.unitPrice || ''}
                                onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                className="w-full bg-white border border-[#F4C197] rounded px-2 py-1.5 text-xs text-right text-[#6C4A32] focus:outline-none focus:border-[#F15A24]"
                              />
                            </div>
                            <div className="col-span-1 text-right text-xs font-semibold text-[#8A3B12] min-w-0 truncate">
                              ${(item.quantity * item.unitPrice).toFixed(2)}
                            </div>
                            <div className="col-span-1 flex justify-end">
                              <button
                                onClick={() => removeLineItem(item.id)}
                                className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                                title={t('templateEditor.itemsTable.removeItem')}
                              >
                                <X className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-2 mb-4">
                      {lineItems.map((item) => (
                        <div key={item.id} className="bg-[#FFF7EA] border border-[#F4C197] rounded-lg p-2.5">
                          <div className="flex justify-between items-start mb-1.5 gap-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              placeholder={t('templateEditor.itemsTable.descriptionPlaceholder')}
                              className="flex-1 bg-white border border-[#F4C197] rounded px-2 py-1.5 text-xs text-[#6C4A32] focus:outline-none focus:border-[#F15A24] min-w-0"
                            />
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5 text-red-600" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#C05A2B] font-semibold whitespace-nowrap">Qty:</span>
                              <input
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min={0}
                                step={0.01}
                                className="flex-1 bg-white border border-[#F4C197] rounded px-1.5 py-1 text-xs text-right text-[#6C4A32] focus:outline-none focus:border-[#F15A24] min-w-0"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-[#C05A2B] font-semibold whitespace-nowrap">Price:</span>
                              <input
                                type="number"
                                value={item.unitPrice || ''}
                                onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                className="flex-1 bg-white border border-[#F4C197] rounded px-1.5 py-1 text-xs text-right text-[#6C4A32] focus:outline-none focus:border-[#F15A24] min-w-0"
                              />
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-[#F4C197] flex justify-between items-center">
                            <span className="text-[10px] text-[#C05A2B] font-semibold">{t('templateEditor.itemsTable.total')}:</span>
                            <span className="text-sm font-bold text-[#F15A24]">
                              ${(item.quantity * item.unitPrice).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={addLineItem}
                      className="w-full border-2 border-dashed border-[#F15A24] text-[#F15A24] hover:bg-[#FFF7EA] mb-4 text-xs sm:text-sm py-2"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                      {t('templateEditor.itemsTable.addLineItem')}
                    </Button>

                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-[#8A3B12]">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-base sm:text-xl font-display font-bold text-[#8A3B12]">{t('templateEditor.itemsTable.estimateTotal')}</span>
                        <span className="text-lg sm:text-2xl font-display font-bold text-[#F15A24]">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              case 'paymentMethod':
                // Check if ContactInfo is also enabled to show them together
                const contactInfoSection = sections.find(s => s.id === 'contactInfo' && s.enabled);
                if (contactInfoSection) {
                  return (
                    <div key={`${section.id}-${contactInfoSection.id}`} className="mb-6 pt-4 border-t border-[#F4C197]">
                      <div className="flex gap-6 items-start">
                        <PaymentMethodSection
                          paymentMethod={paymentMethod}
                          onChange={(field, value) => setPaymentMethod({ ...paymentMethod, [field]: value })}
                          layout={section.layout || 'two-columns'}
                        />
                        <ContactInfoSection
                          contactInfo={contactInfo}
                          onChange={(field, value) => setContactInfo({ ...contactInfo, [field]: value })}
                          layout={contactInfoSection.layout || 'two-columns'}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={section.id} className="mb-6 pt-4 border-t border-[#F4C197]">
                    <PaymentMethodSection
                      paymentMethod={paymentMethod}
                      onChange={(field, value) => setPaymentMethod({ ...paymentMethod, [field]: value })}
                      layout={section.layout || 'two-columns'}
                    />
                  </div>
                );
              case 'contactInfo':
                // Check if PaymentMethod is also enabled to show them together
                const paymentMethodSection = sections.find(s => s.id === 'paymentMethod' && s.enabled);
                if (!paymentMethodSection) {
                  // Only show ContactInfo if PaymentMethod is not enabled
                  return (
                    <div key={section.id} className="mb-6 pt-4 border-t border-[#F4C197]">
                      <ContactInfoSection
                        contactInfo={contactInfo}
                        onChange={(field, value) => setContactInfo({ ...contactInfo, [field]: value })}
                        layout={section.layout || 'two-columns'}
                      />
                    </div>
                  );
                }
                // If PaymentMethod is enabled, ContactInfo is already shown with it
                return null;
              /* case 'signature': */
                return (
                  <SignatureSection
                    key={section.id}
                    signature={signature}
                    onChange={(field, value) => setSignature({ ...signature, [field]: value })}
                    onSignatureUpload={handleSignatureUpload}
                  />
                );
              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Right Sidebar - AI Chat Panel with equal width container, vertically centered */}
      <div ref={aiChatRef} className="hidden lg:block w-64 lg:w-80 flex-shrink-0 flex items-center tour-ai-chat">
        <AIChatPanel
          onGenerateEstimate={(prompt) => {
            // TODO: Implement AI estimate generation
            console.log('Generate estimate with prompt:', prompt);
          }}
        />
      </div>

      {/* Mobile Floating Panels */}
      <>
      {/* Mobile Tools Tab - Left Side */}
      <button
        onClick={() => {
          if (!runTour) {
            setShowMobileTools(!showMobileTools);
          }
        }}
          className="sm:hidden fixed left-0 top-1/2 -translate-y-1/2 z-[40] bg-[#F15A24] text-white px-2 py-3 rounded-r-lg shadow-lg hover:bg-[#C2410C] transition-colors flex flex-col items-center gap-1 tour-mobile-tools-button"
          aria-label={t('templateEditor.mobile.toggleTools')}
          style={{ pointerEvents: runTour ? 'auto' : 'auto' }}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-tight writing-vertical-rl" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
            {t('templateEditor.mobile.tools')}
          </span>
        </button>

      {/* Mobile Tools Floating Panel */}
      {showMobileTools && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="sm:hidden fixed left-0 top-[5rem] bottom-0 z-[50] flex items-center"
        >
          <div className="relative h-full">
            {/* Close button */}
            <button
              onClick={() => setShowMobileTools(false)}
              className="absolute -right-8 top-1/2 -translate-y-1/2 bg-[#F15A24] text-white p-1.5 rounded-r-lg hover:bg-[#C2410C] transition-colors z-10 shadow-lg"
                aria-label={t('templateEditor.mobile.closeTools')}
            >
              <X className="w-4 h-4" />
            </button>
            {/* Toolbar - just the bar itself */}
            <div className="h-full overflow-y-auto">
              <TemplateToolbar
                sections={sections}
                onToggleSection={handleToggleSection}
                onChangeLayout={handleChangeLayout}
                onDragStart={setDraggedSection}
                onDragEnd={() => setDraggedSection(null)}
                onReorderSections={handleReorderSections}
                draggedSection={draggedSection}
                onThemeChange={setSelectedTheme}
                onSaveTemplate={isAuthenticated ? handleSaveTemplate : undefined}
                templateData={{
                  sections,
                  header,
                  jobSummary,
                  projectInfo,
                  paymentMethod,
                  contactInfo,
                  signature,
                  theme: selectedTheme,
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Resources Tab - Top */}
      {selectedTrade && RESOURCE_TEMPLATES.filter((r) => r.tradeId === selectedTrade).length > 0 && (
        <>
          <button
            onClick={() => setShowMobileResources(!showMobileResources)}
            className="sm:hidden fixed top-0 left-1/2 -translate-x-1/2 z-40 bg-[#F15A24] text-white px-4 py-2 rounded-b-lg shadow-lg hover:bg-[#C2410C] transition-colors flex items-center gap-2"
              aria-label={t('templateEditor.mobile.toggleResources')}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Resources</span>
          </button>

          {/* Mobile Resources Floating Panel */}
          {showMobileResources && (
            <>
              <div 
                className="sm:hidden fixed inset-0 bg-black/50 z-[45]"
                onClick={() => setShowMobileResources(false)}
              />
              <motion.div
                initial={{ y: '-100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-100%' }}
                className="sm:hidden fixed top-0 left-0 right-0 max-h-[70vh] bg-white border-b-2 border-[#F4C197] shadow-2xl z-[50] overflow-y-auto"
              >
                <div className="p-4 border-b-2 border-[#F4C197] flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#8A3B12]">Quick Resources</h3>
                  <button
                    onClick={() => setShowMobileResources(false)}
                    className="p-1 hover:bg-[#FFF7EA] rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-[#8A3B12]" />
                  </button>
                </div>
                <div className="p-2">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {RESOURCE_TEMPLATES.filter((r) => r.tradeId === selectedTrade).map((resource) => {
                      // Map icon names to actual icon components (same as ResourceBar)
                      const iconMap: Record<string, React.ComponentType<any>> = {
                        Trash2: Icons.Trash2, Layers: Icons.Layers, FileStack: Icons.FileStack, Shield: Icons.Shield, Fan: Icons.Fan, Sparkles: Icons.Sparkles,
                        Cable: Icons.Cable, Power: Icons.Power, Settings: Icons.Settings, Lightbulb: Icons.Lightbulb, PanelTop: Icons.PanelTop, Gauge: Icons.Gauge,
                        Droplets: Icons.Droplets, Droplet: Icons.Droplet, Toilet: Icons.Droplet, Faucet: Icons.Droplet, Flame: Icons.Flame, TestTube: Icons.TestTube,
                        SquareStack: Icons.SquareStack, Scissors: Icons.Scissors, Spray: Icons.Paintbrush, Ceiling: Icons.SquareStack, WrenchIcon: Icons.Wrench,
                        Building2: Icons.Building2, BrickWall: Icons.BrickWall, Package: Icons.Package, HardHat: Icons.HardHat,
                        Home: Icons.Home, DoorOpen: Icons.DoorOpen, Box: Icons.Box, Paintbrush: Icons.Paintbrush,
                        TreePine: Icons.TreePine, GaugeIcon: Icons.Gauge, Sprout: Icons.Sprout, Trees: Icons.Trees, Road: Icons.SquareStack, Fence: Icons.Fence,
                        Snowflake: Icons.Snowflake, Wind: Icons.Wind, Thermometer: Icons.Thermometer, Wrench: Icons.Wrench,
                        UtensilsCrossed: Icons.UtensilsCrossed, Container: Icons.Container, Sofa: Icons.Sofa, WrenchIcon2: Icons.Wrench,
                        Zap: Icons.Zap, Hammer: Icons.Hammer,
                      };
                      const IconComponent = iconMap[resource.icon || 'Box'] || Icons.Box;
                      return (
                        <motion.button
                          key={resource.id}
                          onClick={() => {
                            handleAddResource(resource);
                            setShowMobileResources(false);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-0.5 p-1.5 bg-[#FFF7EA] border border-[#F4C197] rounded-lg hover:border-[#F15A24] transition-colors min-w-[70px] flex-shrink-0"
                        >
                          <IconComponent className="w-4 h-4 text-[#F15A24]" />
                          <span className="text-[10px] font-medium text-[#8A3B12] text-center leading-tight">
                            {resource.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}

      {/* Mobile AI Chat Floating Button - Bottom Right */}
      <button
        onClick={() => setShowMobileAIChat(!showMobileAIChat)}
        className="sm:hidden fixed bottom-6 right-6 z-[40] w-14 h-14 bg-[#F15A24] text-white rounded-full shadow-2xl hover:bg-[#C2410C] transition-colors flex items-center justify-center"
          aria-label={t('templateEditor.mobile.toggleAIChat')}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Mobile AI Chat Floating Panel */}
      {showMobileAIChat && (
        <>
          <div 
            className="sm:hidden fixed inset-0 bg-black/50 z-[45]"
            onClick={() => setShowMobileAIChat(false)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="sm:hidden fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white border-t-2 border-[#F4C197] rounded-t-2xl shadow-2xl z-[50] flex flex-col"
          >
            <div className="p-4 border-b-2 border-[#F4C197] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#8A3B12]">AI Assistant</h3>
              <button
                onClick={() => setShowMobileAIChat(false)}
                className="p-1 hover:bg-[#FFF7EA] rounded transition-colors"
              >
                <X className="w-5 h-5 text-[#8A3B12]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AIChatPanel
                onGenerateEstimate={(prompt) => {
                  // TODO: Implement AI estimate generation
                  console.log('Generate estimate with prompt:', prompt);
                }}
              />
            </div>
          </motion.div>
        </>
      )}
      </>
      
      {/* Save Template Modal */}
      <Modal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        title={t('templateEditor.saveTemplate.title')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#8A3B12] mb-2">
              {t('templateEditor.saveTemplate.nameLabel')} <span className="text-[#C05A2B]">{t('templateEditor.saveTemplate.nameRequired')}</span>
            </label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={t('templateEditor.saveTemplate.namePlaceholder')}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8A3B12] mb-2">
              {t('templateEditor.saveTemplate.descriptionLabel')}
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder={t('templateEditor.saveTemplate.descriptionPlaceholder')}
              className="w-full p-3 border-2 border-[#F4C197] rounded-xl focus:outline-none focus:border-[#F15A24] text-sm text-[#6C4A32]"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleConfirmSaveTemplate}
              disabled={!templateName.trim() || saveTemplateMutation.isPending}
              className="flex-1"
            >
              {saveTemplateMutation.isPending ? t('templateEditor.saveTemplate.saving') : t('templateEditor.saveTemplate.save')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowSaveTemplateModal(false)}
              className="flex-1"
            >
              {t('templateEditor.saveTemplate.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

