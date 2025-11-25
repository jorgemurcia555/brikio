import { useState, useCallback, useEffect } from 'react';
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
import { Plus, X, Eye, EyeOff, Settings, Sparkles, MessageCircle } from 'lucide-react';
import { UNIT_OPTIONS } from '../../constants/units.constants';

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
}

interface TemplateEditorProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
  selectedTrade: TradeSpecialtyId | null;
  projectName?: string;
  onTemplateChange?: (template: TemplateData) => void;
}

const initialSections: TemplateSectionConfig[] = [
  { id: 'header', label: 'Header', enabled: true, order: 0 },
  { id: 'jobSummary', label: 'Job Summary', enabled: true, order: 1 },
  { id: 'projectInfo', label: 'Project Info', enabled: true, order: 2, layout: 'two-columns' },
  { id: 'itemsTable', label: 'Items Table', enabled: true, order: 3, required: true },
  { id: 'paymentMethod', label: 'Payment Method', enabled: true, order: 4, layout: 'two-columns' },
  { id: 'contactInfo', label: 'Contact Info', enabled: true, order: 5, layout: 'two-columns' },
  /* { id: 'signature', label: 'Signature', enabled: false, order: 6 }, */
];

export function TemplateEditor({ lineItems, onLineItemsChange, selectedTrade, projectName, onTemplateChange }: TemplateEditorProps) {
  const [sections, setSections] = useState<TemplateSectionConfig[]>(initialSections);
  const [draggedSection, setDraggedSection] = useState<TemplateSectionId | null>(null);
  const [showUnitColumn, setShowUnitColumn] = useState(true);
  
  // Mobile floating panels state
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [showMobileResources, setShowMobileResources] = useState(false);
  const [showMobileAIChat, setShowMobileAIChat] = useState(false);
  
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
      });
    }
  }, [sections, header, jobSummary, projectInfo, paymentMethod, contactInfo, signature, onTemplateChange]);

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

  return (
    <div className="flex gap-2 sm:gap-4 lg:gap-6 items-start">
      {/* Left Sidebar - Template Tools with equal width container */}
      <div className="hidden sm:block w-12 sm:w-16 lg:w-80 flex-shrink-0">
        <TemplateToolbar
          sections={sections}
          onToggleSection={handleToggleSection}
          onChangeLayout={handleChangeLayout}
          onDragStart={setDraggedSection}
          onDragEnd={() => setDraggedSection(null)}
          onReorderSections={handleReorderSections}
          draggedSection={draggedSection}
        />
      </div>

      {/* Center - Main Editor */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        {/* Resource Bar */}
        <div className="w-full max-w-4xl px-2 sm:px-0">
          <ResourceBar selectedTrade={selectedTrade} onAddResource={handleAddResource} />
        </div>

        {/* Document Content - Centered, looks like real document */}
        <div className="rounded-xl mt-2 sm:mt-[2rem] bg-white shadow-sm border-2 border-[#F4C197] rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-4xl p-3 sm:p-6 lg:p-10" style={{ minHeight: '600px' }}>
          {sortedSections.map((section) => {
            switch (section.id) {
              case 'header':
                return (
                  <EstimateHeaderComponent
                    key={section.id}
                    header={header}
                    onChange={(field, value) => setHeader({ ...header, [field]: value })}
                    onLogoUpload={handleLogoUpload}
                  />
                );
              case 'jobSummary':
                // Job Summary is now shown above items table, skip here
                return null;
              case 'projectInfo':
                return (
                  <ProjectInfoSection
                    key={section.id}
                    projectInfo={projectInfo}
                    onChange={(field, value) => setProjectInfo({ ...projectInfo, [field]: value })}
                    layout={section.layout || 'two-columns'}
                  />
                );
              case 'itemsTable':
                return (
                  <div key={section.id} className="mb-8">
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
                            <span className="text-xs">Description</span>
                            <InteractiveTooltip
                              title="Description"
                              content="Enter a detailed description of the item, material, labor, or service. Be specific with brand names, specifications, or model numbers to avoid confusion."
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs">Quantity</span>
                            <InteractiveTooltip
                              title="Quantity"
                              content="Enter the quantity needed for this item. Use whole numbers or decimals as needed (e.g., 2, 1.5, 0.75)."
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-2 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-xs">Unit Price</span>
                            <InteractiveTooltip
                              title="Unit Price"
                              content="Enter the cost per unit in dollars. Use decimal format (e.g., 12.50, 45.00). The total will calculate automatically."
                              size="sm"
                            />
                          </div>
                        </div>
                        <div className="col-span-1 text-right py-1 px-1.5 text-[#8A3B12] font-semibold">
                          <span className="text-xs">Total</span>
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
                                placeholder="e.g., Portland cement"
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
                                title="Remove item"
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
                              placeholder="Description"
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
                            <span className="text-[10px] text-[#C05A2B] font-semibold">Total:</span>
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
                      Add Line Item
                    </Button>

                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-[#8A3B12]">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-base sm:text-xl font-display font-bold text-[#8A3B12]">Estimate Total</span>
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
      <div className="hidden lg:block w-64 lg:w-80 flex-shrink-0 flex items-center">
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
        onClick={() => setShowMobileTools(!showMobileTools)}
        className="sm:hidden fixed left-0 top-1/2 -translate-y-1/2 z-[40] bg-[#F15A24] text-white p-2 rounded-r-lg shadow-lg hover:bg-[#C2410C] transition-colors"
        aria-label="Toggle Tools"
      >
        <Settings className="w-5 h-5" />
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
              aria-label="Close Tools"
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
            aria-label="Toggle Resources"
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
        aria-label="Toggle AI Assistant"
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
    </div>
  );
}

