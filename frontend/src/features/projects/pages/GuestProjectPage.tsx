import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Calculator,
  Download,
  FileText,
  Home,
  Plus,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Tooltip } from '../../../components/ui/Tooltip';
import { LanguageSwitcher } from '../../../components/ui/LanguageSwitcher';
import { Logo } from '../../../components/ui/Logo';
import { TemplateEditor, TemplateData } from '../components/TemplateEditor/TemplateEditor';
import type { LineItem } from '../components/TemplateEditor/TemplateEditor';
import { TradeSpecialtyId } from '../types/trade.types';
import { TRADE_SPECIALTIES } from '../constants/trade.constants';
import { EstimatePreview } from '../components/TemplateEditor/EstimatePreview';
import { FileText as FileTextIcon } from 'lucide-react';

export function GuestProjectPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projectName, setProjectName] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<TradeSpecialtyId | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx' | null>(null);
  const [currentStep, setCurrentStep] = useState<'project' | 'items' | 'preview'>('project');

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 0,
      unit: 'm²',
      unitPrice: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleDownload = (format: 'pdf' | 'docx') => {
    // Save project data to localStorage before redirecting to register
    const projectData = {
      projectName,
      lineItems,
      templateData,
      total: calculateTotal(),
      format,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('guestProjectData', JSON.stringify(projectData));
    setDownloadFormat(format);
    setShowDownloadModal(true);
  };

  const handleRegister = () => {
    navigate('/register?from=guest&action=download');
  };

  const totalAmount = calculateTotal();

  return (
    <div className="min-h-screen bg-[#FFF7EA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FFF7EA]/90 backdrop-blur border-b-2 border-[#F1D7C4]">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
              <Logo size="md" variant="orange" showText={false} />
              <div className="hidden sm:block min-w-0">
                <p className="font-display text-lg sm:text-xl text-[#8A3B12] truncate">{t('brand.name')}</p>
                <p className="text-xs text-[#C05A2B]">{t('guestProject.header.tryMode')}</p>
              </div>
              <div className="sm:hidden">
                <p className="font-display text-sm text-[#8A3B12] truncate">{t('brand.name')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center"
              >
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">{t('guestProject.header.backHome')}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="text-xs sm:text-base px-2 sm:px-4"
              >
                <span className="hidden sm:inline">{t('guestProject.header.signIn')}</span>
                <span className="sm:hidden">Sign in</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps - Moved to top (hidden in items step) */}
      {currentStep !== 'items' && (
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 border-b-2 border-[#F1D7C4] bg-[#FFF7EA]/50">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {['project', 'items', 'preview'].map((step, index) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(step as typeof currentStep)}
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 font-bold text-sm sm:text-base ${
                    currentStep === step
                      ? 'bg-[#F15A24] border-[#F15A24] text-white'
                      : 'border-[#F4C197] text-[#8A3B12]'
                  }`}
                >
                  {index + 1}
                </button>
                {index < 2 && (
                  <div className={`w-16 sm:w-32 h-0.5 flex-shrink-0 ${
                    ['items', 'preview'].indexOf(currentStep) > index
                      ? 'bg-[#F15A24]'
                      : 'bg-[#F4C197]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12" style={{ maxWidth: '100%' }}>
        {/* Step 1: Project Info */}
        {currentStep === 'project' && (
          <Card className="p-4 sm:p-8 bg-white border-2 border-[#F4C197] rounded-2xl sm:rounded-3xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[#F15A24] flex-shrink-0" />
              <h2 className="text-xl sm:text-3xl font-display text-[#8A3B12]">{t('guestProject.projectInfo.title')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8A3B12] mb-2">
                  {t('guestProject.projectInfo.nameLabel')}
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t('guestProject.projectInfo.namePlaceholder')}
                  className="text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8A3B12] mb-2">
                  Trade Specialty <span className="text-[#C05A2B]">*</span>
                </label>
                <select
                  value={selectedTrade || ''}
                  onChange={(e) => setSelectedTrade(e.target.value as TradeSpecialtyId)}
                  className="w-full p-3 border-2 border-[#F4C197] rounded-xl focus:border-[#F15A24] focus:outline-none bg-white text-[#8A3B12]"
                >
                  <option value="">Select a specialty...</option>
                  {TRADE_SPECIALTIES.map((trade) => (
                    <option key={trade.id} value={trade.id}>
                      {trade.label} / {trade.labelEs}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-[#FDE3C8] p-4 rounded-xl">
                <p className="text-sm text-[#6C4A32]" dangerouslySetInnerHTML={{ __html: t('guestProject.projectInfo.tip') }} />
              </div>
            </div>
            <div className="flex justify-end mt-6 sm:mt-8">
              <Button
                variant="primary"
                onClick={() => setCurrentStep('items')}
                disabled={!projectName.trim() || !selectedTrade}
                icon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="w-full sm:w-auto"
              >
                {t('guestProject.projectInfo.continue')}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Template Editor */}
        {currentStep === 'items' && (
          <div className="w-full">
            <TemplateEditor
              lineItems={lineItems}
              onLineItemsChange={setLineItems}
              selectedTrade={selectedTrade}
              projectName={projectName}
              onTemplateChange={setTemplateData}
            />
            
            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep('project')}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                {t('common.back')}
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep('preview')}
                disabled={lineItems.length === 0}
                icon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {t('guestProject.items.previewEstimate')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {currentStep === 'preview' && (
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileTextIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#F15A24] flex-shrink-0" />
                <h2 className="text-xl sm:text-3xl font-display text-[#8A3B12]">Preview Estimate</h2>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleDownload('pdf')} 
                  icon={<Download className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="w-full sm:w-auto"
                >
                  Download PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDownload('docx')} 
                  icon={<FileTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="w-full sm:w-auto"
                >
                  Download DOCX
                </Button>
              </div>
            </div>
            
            {templateData ? (
              <EstimatePreview
                projectName={projectName}
                lineItems={lineItems}
                sections={templateData.sections}
                header={templateData.header}
                jobSummary={templateData.jobSummary}
                projectInfo={templateData.projectInfo}
                paymentMethod={templateData.paymentMethod}
                contactInfo={templateData.contactInfo}
                signature={templateData.signature}
              />
            ) : (
              <Card className="p-8 bg-white border-2 border-[#F4C197] rounded-2xl">
                <p className="text-center text-[#6C4A32]">
                  Loading preview...
                </p>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentStep('items')}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Back to Edit
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Download Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Register to Download"
      >
        <div className="space-y-4">
          <div className="bg-[#FDE3C8] p-4 rounded-xl">
            <p className="text-[#6C4A32]">
              🎉 <strong>Great work!</strong> Your estimate is ready.
            </p>
          </div>
          <p className="text-[#6C4A32]">
            To download your professional {downloadFormat === 'pdf' ? 'PDF' : 'DOCX'} and unlock unlimited features, 
            create a free account now. You'll get:
          </p>
          <ul className="space-y-2 text-[#6C4A32]">
            <li className="flex items-center gap-2">
              <span className="text-[#3FA45B]">✓</span> 7 days free trial (no credit card required)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#3FA45B]">✓</span> Unlimited estimate downloads
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#3FA45B]">✓</span> Premium AI assistant
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#3FA45B]">✓</span> Cost optimization tools
            </li>
          </ul>
          <div className="pt-4">
            <Button variant="primary" onClick={handleRegister} className="w-full mb-3">
              Start 7-Day Free Trial
            </Button>
            <Button variant="ghost" onClick={() => setShowDownloadModal(false)} className="w-full">
              Continue Editing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

