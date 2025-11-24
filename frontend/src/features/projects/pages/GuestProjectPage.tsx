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
  Save,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Tooltip } from '../../../components/ui/Tooltip';
import { LanguageSwitcher } from '../../../components/ui/LanguageSwitcher';
import { Logo } from '../../../components/ui/Logo';

interface Area {
  id: string;
  name: string;
  sqMeters: number;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export function GuestProjectPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projectName, setProjectName] = useState('');
  const [areas, setAreas] = useState<Area[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'project' | 'areas' | 'items' | 'preview'>('project');

  const addArea = () => {
    const newArea: Area = {
      id: Date.now().toString(),
      name: '',
      sqMeters: 0,
    };
    setAreas([...areas, newArea]);
  };

  const updateArea = (id: string, field: keyof Area, value: string | number) => {
    setAreas(areas.map(area => 
      area.id === id ? { ...area, [field]: value } : area
    ));
  };

  const removeArea = (id: string) => {
    setAreas(areas.filter(area => area.id !== id));
  };

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

  const handleDownload = () => {
    // Save project data to localStorage before redirecting to register
    const projectData = {
      projectName,
      areas,
      lineItems,
      total: calculateTotal(),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('guestProjectData', JSON.stringify(projectData));
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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" variant="orange" showText={false} />
            <div>
              <p className="font-display text-xl text-[#8A3B12]">{t('brand.name')}</p>
              <p className="text-xs text-[#C05A2B]">{t('guestProject.header.tryMode')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              {t('guestProject.header.backHome')}
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              {t('guestProject.header.signIn')}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {['project', 'areas', 'items', 'preview'].map((step, index) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step as typeof currentStep)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${
                  currentStep === step
                    ? 'bg-[#F15A24] border-[#F15A24] text-white'
                    : 'border-[#F4C197] text-[#8A3B12]'
                }`}
              >
                {index + 1}
              </button>
              {index < 3 && (
                <div className={`w-24 h-0.5 ${
                  ['areas', 'items', 'preview'].indexOf(currentStep) > index
                    ? 'bg-[#F15A24]'
                    : 'bg-[#F4C197]'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Project Info */}
        {currentStep === 'project' && (
          <Card className="p-8 bg-white border-2 border-[#F4C197] rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-[#F15A24]" />
              <h2 className="text-3xl font-display text-[#8A3B12]">{t('guestProject.projectInfo.title')}</h2>
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
              <div className="bg-[#FDE3C8] p-4 rounded-xl">
                <p className="text-sm text-[#6C4A32]" dangerouslySetInnerHTML={{ __html: t('guestProject.projectInfo.tip') }} />
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Button
                variant="primary"
                onClick={() => setCurrentStep('areas')}
                disabled={!projectName.trim()}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {t('guestProject.projectInfo.continue')}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Areas */}
        {currentStep === 'areas' && (
          <Card className="p-8 bg-white border-2 border-[#F4C197] rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-8 h-8 text-[#F15A24]" />
              <h2 className="text-3xl font-display text-[#8A3B12]">Define Areas</h2>
            </div>
            <div className="space-y-4 mb-6">
              {areas.map((area) => (
                <div key={area.id} className="flex gap-3 items-start">
                  <Input
                    value={area.name}
                    onChange={(e) => updateArea(area.id, 'name', e.target.value)}
                    placeholder="Area name (e.g., Living Room)"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={area.sqMeters || ''}
                    onChange={(e) => updateArea(area.id, 'sqMeters', parseFloat(e.target.value) || 0)}
                    placeholder="m²"
                    className="w-32"
                  />
                  <Button variant="ghost" onClick={() => removeArea(area.id)}>
                    <X className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={addArea} icon={<Plus className="w-5 h-5" />}>
              Add Area
            </Button>
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setCurrentStep('project')}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep('items')}
                disabled={areas.length === 0}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Continue to Line Items
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Line Items */}
        {currentStep === 'items' && (
          <Card className="p-8 bg-white border-2 border-[#F4C197] rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-8 h-8 text-[#F15A24]" />
              <h2 className="text-3xl font-display text-[#8A3B12]">{t('guestProject.items.title')}</h2>
            </div>

            <p className="text-secondary-600 mb-6">
              {t('guestProject.items.description')}
            </p>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-3 mb-3 px-3">
              <div className="col-span-5 flex items-center gap-2">
                <span className="text-sm font-semibold text-secondary-700">
                  {t('guestProject.items.headers.description')}
                </span>
                <Tooltip content={t('guestProject.items.tooltips.description')} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-secondary-700">
                  {t('guestProject.items.headers.quantity')}
                </span>
                <Tooltip content={t('guestProject.items.tooltips.quantity')} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-secondary-700">
                  {t('guestProject.items.headers.unit')}
                </span>
                <Tooltip content={t('guestProject.items.tooltips.unit')} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-secondary-700">
                  {t('guestProject.items.headers.price')}
                </span>
                <Tooltip content={t('guestProject.items.tooltips.price')} />
              </div>
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-sm font-semibold text-secondary-700">
                  {t('guestProject.items.headers.total')}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3 mb-6">
              {lineItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[#FFF7EA] rounded-xl border border-[#F4C197] p-3"
                >
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder={t('guestProject.items.placeholders.description')}
                        className="bg-white w-full"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder={t('guestProject.items.placeholders.quantity')}
                        className="bg-white w-full"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={item.unit}
                        onChange={(e) => updateLineItem(item.id, 'unit', e.target.value)}
                        placeholder={t('guestProject.items.placeholders.unit')}
                        className="bg-white w-full"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder={t('guestProject.items.placeholders.price')}
                        className="bg-white w-full"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1 flex flex-col items-center justify-center gap-2">
                      <span className="text-[#6C4A32] font-bold text-sm whitespace-nowrap">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title={t('common.delete')}
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add Item Button */}
            <Button 
              variant="outline" 
              onClick={addLineItem} 
              className="w-full border-2 border-dashed border-[#F15A24] text-[#F15A24] hover:bg-[#FFF7EA]"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('guestProject.items.addItem')}
            </Button>

            {/* Total Summary */}
            <div className="mt-6 p-4 bg-[#FDEFD9] rounded-xl border-2 border-[#F4C197]">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#8A3B12]">
                  {t('guestProject.items.estimateTotal')}
                </span>
                <span className="text-2xl font-bold text-[#F15A24]">
                  ${lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={() => setCurrentStep('areas')}>
                {t('common.back')}
              </Button>
              <Button
                variant="primary"
                onClick={() => setCurrentStep('preview')}
                disabled={lineItems.length === 0}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                {t('guestProject.items.previewEstimate')}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Preview */}
        {currentStep === 'preview' && (
          <Card className="p-8 bg-white border-2 border-[#F4C197] rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#F15A24]" />
                <h2 className="text-3xl font-display text-[#8A3B12]">Preview Estimate</h2>
              </div>
              <Button variant="primary" onClick={handleDownload} icon={<Download className="w-5 h-5" />}>
                Download PDF
              </Button>
            </div>

            {/* Project Summary */}
            <div className="mb-8">
              <h3 className="text-2xl font-display text-[#8A3B12] mb-4">{projectName}</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-[#FFF7EA]">
                  <p className="text-sm text-[#C05A2B] mb-1">Total Areas</p>
                  <p className="text-2xl font-bold text-[#8A3B12]">{areas.length}</p>
                </Card>
                <Card className="p-4 bg-[#FFF7EA]">
                  <p className="text-sm text-[#C05A2B] mb-1">Total m²</p>
                  <p className="text-2xl font-bold text-[#8A3B12]">
                    {areas.reduce((sum, area) => sum + area.sqMeters, 0).toFixed(2)}
                  </p>
                </Card>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#F4C197]">
                    <th className="text-left py-3 text-[#8A3B12] font-semibold">Description</th>
                    <th className="text-right py-3 text-[#8A3B12] font-semibold">Qty</th>
                    <th className="text-right py-3 text-[#8A3B12] font-semibold">Unit</th>
                    <th className="text-right py-3 text-[#8A3B12] font-semibold">Price</th>
                    <th className="text-right py-3 text-[#8A3B12] font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b border-[#F4C197]">
                      <td className="py-3 text-[#6C4A32]">{item.description}</td>
                      <td className="py-3 text-right text-[#6C4A32]">{item.quantity}</td>
                      <td className="py-3 text-right text-[#6C4A32]">{item.unit}</td>
                      <td className="py-3 text-right text-[#6C4A32]">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-semibold text-[#8A3B12]">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#F15A24]">
                    <td colSpan={4} className="py-4 text-right text-xl font-display text-[#8A3B12]">
                      Total
                    </td>
                    <td className="py-4 text-right text-2xl font-display text-[#F15A24]">
                      ${totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep('items')}>
                Back to Edit
              </Button>
              <Button variant="primary" onClick={handleDownload} icon={<Download className="w-5 h-5" />}>
                Download PDF
              </Button>
            </div>
          </Card>
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
            To download your professional PDF and unlock unlimited features, 
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

