import { useState, useEffect } from 'react';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Layout, 
  LayoutGrid, 
  Palette, 
  Layers,
  Settings,
  Wand2,
  FileText,
  MapPin,
  CreditCard,
  Mail,
  PenTool,
  Calculator,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TemplateSectionConfig, TemplateSectionId } from '../../types/template.types';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../../stores/authStore';

interface TemplateToolbarProps {
  sections: TemplateSectionConfig[];
  onToggleSection: (sectionId: TemplateSectionId) => void;
  onChangeLayout: (sectionId: TemplateSectionId, layout: 'one-column' | 'two-columns') => void;
  onDragStart: (sectionId: TemplateSectionId) => void;
  onDragEnd: () => void;
  onReorderSections: (newSections: TemplateSectionConfig[]) => void;
  draggedSection: TemplateSectionId | null;
  onThemeChange?: (theme: string) => void;
  onTemplateChange?: (template: string) => void;
  onSaveTemplate?: () => void;
  templateData?: any;
  profitMarginPercent?: number;
  onProfitMarginChange?: (value: number) => void;
  taxEnabled?: boolean;
  onTaxEnabledChange?: (value: boolean) => void;
}

type ThemeId = 'black' | 'company' | 'orange' | 'green' | 'blue' | 'red';
type TemplateId = 'classic' | 'minimal' | 'centered-logo' | 'side-band';

const getThemes = (t: any): { id: ThemeId; label: string; primary: string; secondary: string; text: string; bg: string; border: string }[] => [
  { id: 'black', label: t('templateEditor.toolbar.themes.black'), primary: '#000000', secondary: '#1F2937', text: '#111827', bg: '#FFFFFF', border: '#E5E7EB' },
  { id: 'company', label: t('templateEditor.toolbar.themes.company'), primary: '#F15A24', secondary: '#8A3B12', text: '#8A3B12', bg: '#FFF7EA', border: '#F4C197' },
  { id: 'orange', label: t('templateEditor.toolbar.themes.orange'), primary: '#F15A24', secondary: '#FF8C42', text: '#8A3B12', bg: '#FFF7EA', border: '#F4C197' },
  { id: 'green', label: t('templateEditor.toolbar.themes.green'), primary: '#22C55E', secondary: '#16A34A', text: '#166534', bg: '#F0FDF4', border: '#86EFAC' },
  { id: 'blue', label: t('templateEditor.toolbar.themes.blue'), primary: '#3B82F6', secondary: '#2563EB', text: '#1E40AF', bg: '#EFF6FF', border: '#93C5FD' },
  { id: 'red', label: t('templateEditor.toolbar.themes.red'), primary: '#EF4444', secondary: '#DC2626', text: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5' },
];

const getTemplates = (t: any): { id: TemplateId; label: string; description: string }[] => [
  { id: 'classic', label: t('templateEditor.toolbar.templateTypes.classic'), description: t('templateEditor.toolbar.templateTypes.classicDesc') },
  { id: 'minimal', label: t('templateEditor.toolbar.templateTypes.minimal'), description: t('templateEditor.toolbar.templateTypes.minimalDesc') },
  { id: 'centered-logo', label: t('templateEditor.toolbar.templateTypes.centeredLogo'), description: t('templateEditor.toolbar.templateTypes.centeredLogoDesc') },
  { id: 'side-band', label: t('templateEditor.toolbar.templateTypes.sideBand'), description: t('templateEditor.toolbar.templateTypes.sideBandDesc') },
];

const SECTION_ICONS: Record<TemplateSectionId, any> = {
  header: Building2,
  jobSummary: FileText,
  projectInfo: MapPin,
  itemsTable: Calculator,
  paymentMethod: CreditCard,
  contactInfo: Mail,
  /* signature: PenTool, */
};

export function TemplateToolbar({
  sections,
  onToggleSection,
  onChangeLayout,
  onDragStart,
  onDragEnd,
  onReorderSections,
  draggedSection,
  onThemeChange,
  onTemplateChange,
  onSaveTemplate,
  templateData,
  profitMarginPercent = 15,
  onProfitMarginChange,
  taxEnabled = false,
  onTaxEnabledChange,
}: TemplateToolbarProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('black');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [activeTool, setActiveTool] = useState<'theme' | 'templates' | 'profitMargin' | 'sections' | null>(null);
  const [activeSection, setActiveSection] = useState<TemplateSectionId | null>(null);
  
  const THEMES = getThemes(t);
  const TEMPLATES = getTemplates(t);

  const handleThemeSelect = (themeId: ThemeId) => {
    setSelectedTheme(themeId);
    onThemeChange?.(themeId);
  };

  const handleTemplateSelect = (templateId: TemplateId) => {
    setSelectedTemplate(templateId);
    onTemplateChange?.(templateId);
  };

  const handleDragEnd = (event: any, info: any, sectionId: TemplateSectionId) => {
    onDragEnd();
    if (!draggedSection || !onReorderSections) return;

    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const draggedIndex = sorted.findIndex(s => s.id === sectionId);
    if (draggedIndex === -1) return;

    const newSections = [...sorted];
    
    if (info.offset.y < -30 && draggedIndex > 0) {
      [newSections[draggedIndex], newSections[draggedIndex - 1]] = 
      [newSections[draggedIndex - 1], newSections[draggedIndex]];
    } else if (info.offset.y > 30 && draggedIndex < newSections.length - 1) {
      [newSections[draggedIndex], newSections[draggedIndex + 1]] = 
      [newSections[draggedIndex + 1], newSections[draggedIndex]];
    }
    
    newSections.forEach((s, i) => { s.order = i; });
    onReorderSections(newSections);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.toolbar-panel') && !target.closest('.section-button')) {
        setActiveSection(null);
      }
    };

    if (activeSection) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeSection]);

  return (
    <div className="flex h-auto">
      {/* Vertical Icon Bar */}
      <div className="w-16 m-auto bg-white border-2 border-[#F4C197] rounded-2xl shadow-lg flex flex-col items-center py-4 gap-1 flex-shrink-0">
        {/* Theme Tool */}
        <div className="relative group">
          <button
            onClick={() => setActiveTool(activeTool === 'theme' ? null : 'theme')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
              activeTool === 'theme' 
                ? 'bg-[#F15A24] text-white' 
                : 'text-[#8A3B12] hover:bg-[#FFF7EA]'
            }`}
          >
            <Palette className={`w-5 h-5 ${activeTool === 'theme' ? 'text-white' : 'text-[#F15A24]'}`} />
            <span className="text-[9px] font-medium leading-tight text-center">Theme</span>
          </button>
          {/* Floating tooltip */}
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#8A3B12] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
            {t('templateEditor.toolbar.colorTheme')}
          </div>
        </div>

        {/* Templates Tool */}
        <div className="relative group tour-templates">
          <button
            onClick={() => setActiveTool(activeTool === 'templates' ? null : 'templates')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
              activeTool === 'templates' 
                ? 'bg-[#F15A24] text-white' 
                : 'text-[#8A3B12] hover:bg-[#FFF7EA]'
            }`}
          >
            <Layers className={`w-5 h-5 ${activeTool === 'templates' ? 'text-white' : 'text-[#F15A24]'}`} />
            <span className="text-[9px] font-medium leading-tight text-center">{t('templateEditor.toolbar.templates')}</span>
          </button>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#8A3B12] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
            {t('templateEditor.toolbar.templates')}
          </div>
        </div>

        {/* Profit Margin Tool */}
        <div className="relative group">
          <button
            onClick={() => setActiveTool(activeTool === 'profitMargin' ? null : 'profitMargin')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
              activeTool === 'profitMargin' 
                ? 'bg-[#F15A24] text-white' 
                : 'text-[#8A3B12] hover:bg-[#FFF7EA]'
            }`}
          >
            <Calculator className={`w-5 h-5 ${activeTool === 'profitMargin' ? 'text-white' : 'text-[#F15A24]'}`} />
            <span className="text-[9px] font-medium leading-tight text-center">Tax</span>
          </button>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#8A3B12] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
            {t('templateEditor.toolbar.profitMargin')}
          </div>
        </div>

        {/* Sections - Individual buttons with click to open panel */}
        {sortedSections.map((section) => {
          const Icon = SECTION_ICONS[section.id] || FileText;
          const isActive = activeSection === section.id;
          return (
            <div key={section.id} className={`relative ${section.id === 'header' ? 'tour-sections' : ''}`}>
              <motion.div
                drag={!section.required ? 'y' : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragStart={() => onDragStart(section.id)}
                onDragEnd={(event, info) => {
                  handleDragEnd(event, info, section.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSection(isActive ? null : section.id);
                }}
                className={`section-button flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all cursor-pointer ${
                  section.required ? '' : 'cursor-move'
                } ${
                  section.enabled 
                    ? 'text-[#8A3B12] hover:bg-[#FFF7EA]' 
                    : 'text-[#8A3B12] hover:bg-[#FFF7EA] opacity-40'
                } ${isActive ? 'bg-[#FFF7EA]' : ''}`}
              >
                <Icon className={`w-5 h-5 ${section.enabled ? 'text-[#F15A24]' : 'text-[#C05A2B]'}`} />
                <span className="text-[9px] font-medium leading-tight text-center">{section.label}</span>
              </motion.div>
              {/* Floating panel with options - stays visible when active */}
              {isActive && (
                <>
                  {/* Mobile overlay */}
                  <div 
                    className="sm:hidden fixed inset-0 bg-black/20 z-[55]"
                    onClick={() => setActiveSection(null)}
                  />
                  <div 
                    className="toolbar-panel fixed sm:absolute left-16 sm:left-full top-1/2 sm:top-0 -translate-y-1/2 sm:translate-y-0 ml-0 sm:ml-2 bg-white border-2 border-[#F4C197] rounded-xl shadow-xl z-[60] min-w-[200px] max-w-[calc(100vw-5rem)] sm:max-w-none p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#8A3B12]">{section.label}</span>
                  {!section.required && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSection(section.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors tour-hide-show ${
                        section.enabled 
                          ? 'bg-[#F15A24] text-white hover:bg-[#C05A2B]' 
                          : 'bg-[#F4C197] text-[#8A3B12] hover:bg-[#F15A24] hover:text-white'
                      }`}
                      title={section.enabled ? t('templateEditor.toolbar.hideSection') : t('templateEditor.toolbar.showSection')}
                    >
                      {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                {section.enabled && section.layout && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F4C197]">
                    <span className="text-xs text-[#6C4A32]">{t('templateEditor.toolbar.layout')}:</span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeLayout(section.id, 'one-column');
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          section.layout === 'one-column' 
                            ? 'bg-[#F15A24] text-white' 
                            : 'bg-white text-[#8A3B12] hover:bg-[#FFF7EA] border border-[#F4C197]'
                        }`}
                        title={t('templateEditor.toolbar.oneColumn')}
                      >
                        <Layout className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeLayout(section.id, 'two-columns');
                        }}
                        className={`p-1.5 rounded transition-colors ${
                          section.layout === 'two-columns' 
                            ? 'bg-[#F15A24] text-white' 
                            : 'bg-white text-[#8A3B12] hover:bg-[#FFF7EA] border border-[#F4C197]'
                        }`}
                        title={t('templateEditor.toolbar.twoColumns')}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {section.required && (
                  <div className="text-xs text-[#C05A2B] mt-2">Required section</div>
                )}
                </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Expandable Panel for Theme, Templates, and Profit Margin */}
      <AnimatePresence>
        {activeTool && (activeTool === 'theme' || activeTool === 'templates' || activeTool === 'profitMargin') && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-r-2 border-[#F4C197] shadow-lg overflow-hidden"
          >
            <div className="w-70 p-4 overflow-y-auto max-h-[calc(100vh-120px)]">
              {/* Theme Panel */}
              {activeTool === 'theme' && (
                <div>
                  <h3 className="text-lg font-display text-[#8A3B12] font-bold mb-4">Color / Theme</h3>
                  <div className="space-y-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeSelect(theme.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          selectedTheme === theme.id
                            ? 'bg-[#F15A24] text-white'
                            : 'bg-[#FFF7EA] text-[#8A3B12] hover:bg-[#FDEFD9] border-2 border-transparent hover:border-[#F4C197]'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <span className="text-sm font-semibold">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Panel */}
              {activeTool === 'profitMargin' && (
                <div>
                  <h3 className="text-lg font-display text-[#8A3B12] font-bold mb-4">{t('templateEditor.toolbar.tax')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#8A3B12] mb-2">
                        {t('templateEditor.toolbar.taxPercent')} (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={profitMarginPercent}
                        onChange={(e) => onProfitMarginChange?.(parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border-2 border-[#F4C197] rounded-lg focus:border-[#F15A24] focus:outline-none text-[#8A3B12]"
                      />
                      <p className="text-xs text-[#6C4A32] mt-2">
                        {t('templateEditor.toolbar.taxDesc')}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <div className="mt-4 pt-4 border-t border-[#F4C197]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={taxEnabled}
                            onChange={(e) => onTaxEnabledChange?.(e.target.checked)}
                            className="w-4 h-4 text-[#F15A24] border-2 border-[#F4C197] rounded focus:ring-[#F15A24]"
                          />
                          <span className="text-sm font-medium text-[#8A3B12]">
                            {t('templateEditor.toolbar.enableTax')}
                          </span>
                        </label>
                        <p className="text-xs text-[#6C4A32] mt-1 ml-6">
                          {t('templateEditor.toolbar.enableTaxDesc')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Templates Panel */}
              {activeTool === 'templates' && (
                <div>
                  <h3 className="text-lg font-display text-[#8A3B12] font-bold mb-4">{t('templateEditor.toolbar.templates')}</h3>
                  {onSaveTemplate && (
                    <button
                      onClick={onSaveTemplate}
                      className="w-full mb-4 p-3 bg-[#F15A24] text-white rounded-xl hover:bg-[#C2410C] transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Wand2 className="w-4 h-4" />
                      {t('templateEditor.toolbar.saveTemplate')}
                    </button>
                  )}
                  <div className="space-y-2">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className={`w-full p-3 rounded-xl text-left transition-colors ${
                          selectedTemplate === template.id
                            ? 'bg-[#F15A24] text-white'
                            : 'bg-[#FFF7EA] text-[#8A3B12] hover:bg-[#FDEFD9] border-2 border-transparent hover:border-[#F4C197]'
                        }`}
                      >
                        <div className="text-sm font-semibold mb-1">{template.label}</div>
                        <div className={`text-xs ${selectedTemplate === template.id ? 'text-white/80' : 'text-[#6C4A32]'}`}>
                          {template.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
