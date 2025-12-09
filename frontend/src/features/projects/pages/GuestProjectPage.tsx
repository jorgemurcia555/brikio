import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n/config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { useAuthStore } from '../../../stores/authStore';
import { projectsService } from '../../../services/projectsService';
import { estimatesService } from '../../../services/estimatesService';
import api from '../../../services/api';
import axios from 'axios';

export function GuestProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [projectName, setProjectName] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<TradeSpecialtyId | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx' | null>(null);
  const [currentStep, setCurrentStep] = useState<'project' | 'items' | 'preview'>('project');
  const [dataRestored, setDataRestored] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<'pdf' | 'docx' | null>(null);

  // Restore saved project data when user becomes authenticated
  useEffect(() => {
    const isNewProject = searchParams.get('new') === 'true';
    const shouldRestore = searchParams.get('restore') === 'true';
    
    // If this is a new project, clear any saved data
    if (isNewProject) {
      localStorage.removeItem('guestProjectData');
      setProjectName('');
      setLineItems([]);
      setTemplateData(null);
      setSelectedTrade(null);
      setCurrentStep('project');
      setDataRestored(true);
      return;
    }
    
    if (isAuthenticated && !dataRestored) {
      // Only restore if explicitly requested via restore=true parameter
      if (shouldRestore) {
        const savedData = localStorage.getItem('guestProjectData');
        
        if (savedData) {
          try {
            const projectData = JSON.parse(savedData);
            
            // Restore project data
            if (projectData.projectName) setProjectName(projectData.projectName);
            if (projectData.lineItems) setLineItems(projectData.lineItems);
            if (projectData.templateData) setTemplateData(projectData.templateData);
            if (projectData.selectedTrade) setSelectedTrade(projectData.selectedTrade);
            if (projectData.downloadFormat) {
              setDownloadFormat(projectData.downloadFormat);
              setPendingDownload(projectData.downloadFormat);
            }
            
            // Go to preview step if we have line items
            if (projectData.lineItems && projectData.lineItems.length > 0) {
              setCurrentStep('preview');
            } else if (projectData.projectName) {
              setCurrentStep('items');
            }
            
            setDataRestored(true);
            toast.success(t('guestProject.dataRestored'));
          } catch (error) {
            console.error('Error restoring project data:', error);
            toast.error(t('guestProject.restoreError'));
            setDataRestored(true); // Mark as restored to avoid infinite loop
          }
        } else {
          setDataRestored(true); // Mark as restored even if no data to restore
        }
      } else {
        // If authenticated but no restore parameter, start fresh
        setDataRestored(true);
      }
    } else if (!isAuthenticated) {
      // Reset restored flag when user logs out
      setDataRestored(false);
      setPendingDownload(null);
    }
  }, [isAuthenticated, dataRestored, searchParams, t]);

  // Fetch units for mapping unit strings to unitIds
  const { data: unitsResponse, isLoading: isLoadingUnits, error: unitsError } = useQuery<any[]>({
    queryKey: ['units'],
    queryFn: async () => {
      try {
        const response = await api.get('/materials/units');
        // API interceptor returns response.data, so response is already the array
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (error: any) {
        console.error('Error fetching units:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
    retry: 3, // Retry 3 times if it fails
    retryDelay: 1000, // Wait 1 second between retries
  });
  
  // Extract units from response (API interceptor returns response.data)
  const units: any[] = Array.isArray(unitsResponse) ? unitsResponse : (unitsResponse?.data || []);

  // Trigger download after data is restored and user is authenticated
  useEffect(() => {
    if (isAuthenticated && dataRestored && pendingDownload && lineItems.length > 0 && units) {
      // Small delay to ensure all state is updated
      const timer = setTimeout(() => {
        // Execute download directly
        handleDownload(pendingDownload).catch((error) => {
          console.error('Error during auto-download:', error);
        });
        setPendingDownload(null); // Clear pending download
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, dataRestored, pendingDownload, lineItems.length, units]);

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

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: projectsService.create,
  });

  // Create estimate mutation
  const createEstimateMutation = useMutation({
    mutationFn: estimatesService.create,
  });

  // Download PDF mutation
  const downloadPdfMutation = useMutation({
    mutationFn: async ({ estimateId, projectId }: { estimateId: string; projectId: string }) => {
      // Use axios directly to handle blob response correctly
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const { accessToken } = useAuthStore.getState();
      // Get current language from i18n
      const currentLanguage = i18n.language || 'en';
      const response = await axios.get(`${API_URL}/pdf/estimate/${estimateId}?lang=${currentLanguage}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      // Check if response is actually a PDF (starts with PDF header) or an error JSON
      const blob = response.data as Blob;
      if (blob.type === 'application/json' || blob.size < 100) {
        // Likely an error response, try to parse it
        const text = await blob.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to generate PDF');
        } catch (parseError) {
          throw new Error('Failed to generate PDF. Please try again.');
        }
      }
      
      return { blob, estimateId, projectId };
    },
    onSuccess: ({ blob, estimateId }: { blob: Blob; estimateId: string; projectId: string }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'estimate'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Invalidate queries to refresh projects list and materials
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['materials', 'custom'] });
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      
      toast.success(t('guestProject.download.success'), {
        action: {
          label: t('guestProject.download.viewProject'),
          onClick: () => navigate(`/estimates/${estimateId}`),
        },
        duration: 5000,
      });
      
      // Navigate to estimates list after a short delay if authenticated
      if (isAuthenticated) {
        setTimeout(() => {
          navigate('/estimates');
        }, 2000);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('guestProject.download.error'));
    },
  });

  // Download DOCX mutation
  const downloadDocxMutation = useMutation({
    mutationFn: async ({ estimateId, projectId }: { estimateId: string; projectId: string }) => {
      // Use axios directly to handle blob response correctly
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const { accessToken } = useAuthStore.getState();
      const response = await axios.get(`${API_URL}/pdf/estimate/${estimateId}/docx`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { blob: response.data as Blob, estimateId, projectId };
    },
    onSuccess: ({ blob, estimateId }: { blob: Blob; estimateId: string; projectId: string }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName || 'estimate'}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Invalidate queries to refresh projects list and materials
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['materials', 'custom'] });
      queryClient.invalidateQueries({ queryKey: ['estimates'] });
      
      toast.success(t('guestProject.download.success'), {
        action: {
          label: t('guestProject.download.viewProject'),
          onClick: () => navigate(`/estimates/${estimateId}`),
        },
        duration: 5000,
      });
      
      // Navigate to estimates list after a short delay if authenticated
      if (isAuthenticated) {
        setTimeout(() => {
          navigate('/estimates');
        }, 2000);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('guestProject.download.error'));
    },
  });

  const handleDownload = async (format: 'pdf' | 'docx') => {
    // If user is not authenticated, show registration modal
    if (!isAuthenticated) {
      const projectData = {
        projectName,
        lineItems,
        templateData,
        selectedTrade,
        total: calculateTotal(),
        format,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('guestProjectData', JSON.stringify(projectData));
      setDownloadFormat(format);
      setShowDownloadModal(true);
      return;
    }

    // If user is authenticated, create project and estimate, then download
    try {
      toast.loading(t('guestProject.download.creating'));

      // Wait for units to load if they're still loading (max 5 seconds)
      if (isLoadingUnits) {
        toast.loading('Loading units...');
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
          // Check if units are now loaded
          const currentUnits: any[] = Array.isArray(unitsResponse) ? unitsResponse : (unitsResponse?.data || []);
          if (currentUnits && Array.isArray(currentUnits) && currentUnits.length > 0) {
            break;
          }
        }
      }

      // Re-fetch units from response after waiting
      const currentUnits: any[] = Array.isArray(unitsResponse) ? unitsResponse : (unitsResponse?.data || []);

      // Check if units loaded successfully
      if (unitsError) {
        console.error('Error loading units:', unitsError);
        toast.error(t('guestProject.download.noUnits'));
        return;
      }

      // Check if units array is empty or undefined
      if (!currentUnits || !Array.isArray(currentUnits) || currentUnits.length === 0) {
        console.error('No units available:', currentUnits);
        toast.error(t('guestProject.download.noUnits'));
        return;
      }

      // Find a default unit (m²) or use the first available
      const defaultUnit = currentUnits.find((u: any) => 
        u.symbol?.toLowerCase() === 'm²' || 
        u.abbreviation?.toLowerCase() === 'm²' ||
        u.name?.toLowerCase().includes('square meter') ||
        u.name?.toLowerCase().includes('metro cuadrado') ||
        u.symbol?.toLowerCase() === 'm2' ||
        u.abbreviation?.toLowerCase() === 'm2'
      ) || currentUnits[0];

      if (!defaultUnit || !defaultUnit.id) {
        console.error('No valid default unit found:', defaultUnit);
        toast.error(t('guestProject.download.noUnits'));
        return;
      }

      // Create project
      const projectResponse = await createProjectMutation.mutateAsync({
        name: projectName,
        projectType: selectedTrade || undefined,
        metadata: {
          templateData,
          trade: selectedTrade,
        },
      });
      
      // Extract project from response (API interceptor returns response.data)
      const project = projectResponse?.data || projectResponse;

      // Map line items to estimate items format
      const estimateItems = lineItems.map((item) => {
        // Try to find matching unit by symbol, abbreviation, or name
        const unit = currentUnits.find((u: any) => 
          u.symbol?.toLowerCase() === item.unit?.toLowerCase() ||
          u.abbreviation?.toLowerCase() === item.unit?.toLowerCase() ||
          u.name?.toLowerCase() === item.unit?.toLowerCase()
        ) || defaultUnit;

        // Ensure unit has an id
        if (!unit || !unit.id) {
          console.warn('No valid unit found for item, using default:', item, unit);
          return {
            description: item.description,
            quantity: item.quantity,
            unitId: defaultUnit.id,
            unitCost: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
            tax: 0,
          };
        }

        const subtotal = item.quantity * item.unitPrice;
        // Calculate tax if taxEnabled is true
        const taxRatePercent = templateData?.taxRatePercent || templateData?.profitMarginPercent || 0;
        const tax = (templateData?.taxEnabled && taxRatePercent > 0) 
          ? (subtotal * taxRatePercent) / 100 
          : 0;

        return {
          description: item.description,
          quantity: item.quantity,
          unitId: unit.id,
          unitCost: item.unitPrice,
          subtotal,
          tax,
        };
      });

      // Create estimate
      const estimateResponse = await createEstimateMutation.mutateAsync({
        projectId: project.id,
        profitMarginPercent: templateData?.profitMarginPercent || 15,
        laborCost: 0,
        items: estimateItems,
      });
      
      // Extract estimate from response (API interceptor returns response.data)
      const estimate = estimateResponse?.data || estimateResponse;

      // Clear saved data from localStorage after successful creation
      localStorage.removeItem('guestProjectData');

      // Download PDF or DOCX
      if (format === 'pdf') {
        await downloadPdfMutation.mutateAsync({ 
          estimateId: estimate.id, 
          projectId: project.id 
        });
      } else if (format === 'docx') {
        await downloadDocxMutation.mutateAsync({ 
          estimateId: estimate.id, 
          projectId: project.id 
        });
      }

      toast.dismiss();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || t('guestProject.download.error'));
    }
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
                <p className="text-xs text-[#C05A2B]">
                  {isAuthenticated ? (user?.companyName || user?.email || '') : t('guestProject.header.tryMode')}
                </p>
              </div>
              <div className="sm:hidden">
                <p className="font-display text-sm text-[#8A3B12] truncate">{t('brand.name')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')}
                    className="hidden sm:flex items-center"
                  >
                    <Home className="w-4 h-4 sm:mr-2" />
                    <span className="hidden md:inline">Dashboard</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/projects')}
                    className="text-xs sm:text-base px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">My Projects</span>
                    <span className="sm:hidden">Projects</span>
                  </Button>
                </>
              ) : (
                <>
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
                </>
              )}
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
          <div className="flex justify-center w-full">
            <Card className="p-4 sm:p-8 bg-white border-2 border-[#F4C197] rounded-2xl sm:rounded-3xl w-full lg:max-w-[50%]">
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
          </div>
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
                {/* DOCX button disabled for now */}
                {/* <Button 
                  variant="outline" 
                  onClick={() => handleDownload('docx')} 
                  icon={<FileTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="w-full sm:w-auto"
                  disabled
                >
                  Download DOCX
                </Button> */}
              </div>
            </div>
            
            {templateData ? (() => {
              // Calculate totals for preview
              const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
              const taxRatePercent = templateData.taxRatePercent || templateData.profitMarginPercent || 0;
              const taxTotal = (templateData.taxEnabled && taxRatePercent > 0) 
                ? (subtotal * taxRatePercent) / 100 
                : 0;
              const total = subtotal + taxTotal;
              
              return (
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
                  theme={templateData.theme || 'black'}
                  taxEnabled={templateData.taxEnabled || false}
                  subtotal={subtotal}
                  taxTotal={taxTotal}
                  total={total}
                />
              );
            })() : (
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
              {isAuthenticated && (
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      await handleDownload('pdf');
                      // Navigation is handled in downloadPdfMutation.onSuccess
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                    }
                  }}
                  icon={<Download className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  {t('guestProject.finishAndDownload', { defaultValue: 'Finish and Download' })}
                </Button>
              )}
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

