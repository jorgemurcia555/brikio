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
}

type ThemeId = 'company' | 'orange' | 'green' | 'blue' | 'red';
type TemplateId = 'classic' | 'minimal' | 'centered-logo' | 'side-band';

const THEMES: { id: ThemeId; label: string; primary: string; secondary: string }[] = [
  { id: 'company', label: 'Company Colors', primary: '#F15A24', secondary: '#8A3B12' },
  { id: 'orange', label: 'Orange', primary: '#F15A24', secondary: '#FF8C42' },
  { id: 'green', label: 'Green', primary: '#22C55E', secondary: '#16A34A' },
  { id: 'blue', label: 'Blue', primary: '#3B82F6', secondary: '#2563EB' },
  { id: 'red', label: 'Red', primary: '#EF4444', secondary: '#DC2626' },
];

const TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Traditional layout with header and sections' },
  { id: 'minimal', label: 'Minimal', description: 'Clean and simple design' },
  { id: 'centered-logo', label: 'Centered Logo', description: 'Logo centered in header' },
  { id: 'side-band', label: 'Side Band', description: 'Color band on the side' },
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
}: TemplateToolbarProps) {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('orange');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('classic');
  const [activeTool, setActiveTool] = useState<'theme' | 'templates' | 'sections' | null>(null);
  const [activeSection, setActiveSection] = useState<TemplateSectionId | null>(null);

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
            Color / Theme
          </div>
        </div>

        {/* Templates Tool */}
        <div className="relative group">
          <button
            onClick={() => setActiveTool(activeTool === 'templates' ? null : 'templates')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
              activeTool === 'templates' 
                ? 'bg-[#F15A24] text-white' 
                : 'text-[#8A3B12] hover:bg-[#FFF7EA]'
            }`}
          >
            <Layers className={`w-5 h-5 ${activeTool === 'templates' ? 'text-white' : 'text-[#F15A24]'}`} />
            <span className="text-[9px] font-medium leading-tight text-center">Templates</span>
          </button>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#8A3B12] text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
            Templates
          </div>
        </div>

        {/* Sections - Individual buttons with click to open panel */}
        {sortedSections.map((section) => {
          const Icon = SECTION_ICONS[section.id] || FileText;
          const isActive = activeSection === section.id;
          return (
            <div key={section.id} className="relative">
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
                <div 
                  className="toolbar-panel absolute left-full ml-2 top-0 bg-white border-2 border-[#F4C197] rounded-xl shadow-xl z-50 min-w-[200px] p-3"
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
                      className={`p-1.5 rounded-lg transition-colors ${
                        section.enabled 
                          ? 'bg-[#F15A24] text-white hover:bg-[#C05A2B]' 
                          : 'bg-[#F4C197] text-[#8A3B12] hover:bg-[#F15A24] hover:text-white'
                      }`}
                      title={section.enabled ? 'Hide section' : 'Show section'}
                    >
                      {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                {section.enabled && section.layout && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F4C197]">
                    <span className="text-xs text-[#6C4A32]">Layout:</span>
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
                        title="One column"
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
                        title="Two columns"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                {section.required && (
                  <div className="text-xs text-[#C05A2B] mt-2 italic">Required section</div>
                )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expandable Panel for Theme and Templates */}
      <AnimatePresence>
        {activeTool && (activeTool === 'theme' || activeTool === 'templates') && (
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

              {/* Templates Panel */}
              {activeTool === 'templates' && (
                <div>
                  <h3 className="text-lg font-display text-[#8A3B12] font-bold mb-4">Templates</h3>
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
