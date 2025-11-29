import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Button } from '../../../components/ui/Button';
import { estimatesService } from '../../../services/estimatesService';
import { useAuthStore } from '../../../stores/authStore';
import { EstimatePreview } from '../../projects/components/TemplateEditor/EstimatePreview';
import { LineItem } from '../../projects/components/TemplateEditor/TemplateEditor';
import { TemplateData } from '../../projects/components/TemplateEditor/TemplateEditor';

export function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { accessToken } = useAuthStore();

  const { data: estimate, isLoading } = useQuery({
    queryKey: ['estimates', id],
    queryFn: () => estimatesService.getOne(id!),
    enabled: !!id,
  });

  const downloadPdfMutation = useMutation({
    mutationFn: async (estimateId: string) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await axios.get(`${API_URL}/pdf/estimate/${estimateId}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { blob: response.data as Blob, estimateId };
    },
    onSuccess: ({ blob, estimateId }: { blob: Blob; estimateId: string }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${estimateId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t('estimates.estimates.downloadSuccess'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('estimates.estimates.downloadError'));
    },
  });

  const downloadDocxMutation = useMutation({
    mutationFn: async (estimateId: string) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await axios.get(`${API_URL}/pdf/estimate/${estimateId}/docx`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { blob: response.data as Blob, estimateId };
    },
    onSuccess: ({ blob, estimateId }: { blob: Blob; estimateId: string }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${estimateId.substring(0, 8)}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t('estimates.estimates.downloadSuccess'));
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('estimates.estimates.downloadError'));
    },
  });

  const handleDownloadPdf = () => {
    if (id) {
      downloadPdfMutation.mutate(id);
    }
  };

  const handleDownloadDocx = () => {
    if (id) {
      downloadDocxMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-secondary-600">Cargando...</div>
      </div>
    );
  }

  if (!estimate?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-secondary-600">Estimate no encontrado</div>
      </div>
    );
  }

  const estimateData = estimate.data || estimate;
  const project = estimateData.project || {};
  const templateData: TemplateData | null = project.metadata?.templateData || null;
  const items = estimateData.items || [];

  // Convert estimate items to LineItems for preview
  const lineItems: LineItem[] = items.map((item: any) => ({
    id: item.id,
    description: item.description || '',
    quantity: parseFloat(item.quantity || 0),
    unit: item.unit?.abbreviation || item.unit?.name || '',
    unitPrice: parseFloat(item.unitCost || 0),
  }));

  if (!templateData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/estimates')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-secondary-900">
              {t('estimates.estimates.estimate')} #{estimateData.version || 1}
            </h1>
          </div>
        </div>
        <div className="text-center py-12 text-secondary-600">
          <p>No hay datos de template disponibles para este estimate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7EA]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FFF7EA]/90 backdrop-blur border-b-2 border-[#F1D7C4]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/estimates')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                  {t('estimates.estimates.estimate')} #{estimateData.version || 1}
                </h1>
                <p className="text-sm text-secondary-600">
                  {new Date(estimateData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownloadPdf}
                loading={downloadPdfMutation.isPending}
              >
                PDF
              </Button>
              {/* DOCX button disabled for now */}
              {/* <Button
                variant="outline"
                icon={<FileText className="w-4 h-4" />}
                onClick={handleDownloadDocx}
                loading={downloadDocxMutation.isPending}
                disabled
              >
                DOCX
              </Button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <EstimatePreview
            projectName={project.name}
            lineItems={lineItems}
            sections={templateData.sections || []}
            header={templateData.header || {
              companyName: '',
              companyTagline: '',
              estimateNumber: '',
              date: '',
              workDuration: '',
            }}
            jobSummary={templateData.jobSummary || {
              jobTitle: '',
              jobDescription: '',
            }}
            projectInfo={templateData.projectInfo || {
              clientName: '',
              projectAddress: '',
              city: '',
              state: '',
              country: '',
              estimateDate: '',
              workDuration: '',
            }}
            paymentMethod={templateData.paymentMethod || {
              bankName: '',
              accountNumber: '',
              paymentMode: '',
            }}
            contactInfo={templateData.contactInfo || {
              email: '',
              phone: '',
              website: '',
              linkedin: '',
              facebook: '',
              twitter: '',
            }}
            signature={templateData.signature || {
              responsibleName: '',
              position: '',
              signatureDate: '',
            }}
            theme={templateData.theme || 'black'}
            subtotal={parseFloat(estimateData.subtotal || 0)}
            taxTotal={parseFloat(estimateData.taxTotal || 0)}
            total={parseFloat(estimateData.total || 0)}
            taxEnabled={templateData.taxEnabled || false}
            providedSubtotal={parseFloat(estimateData.subtotal || 0)}
            providedTaxTotal={parseFloat(estimateData.taxTotal || 0)}
            providedTotal={parseFloat(estimateData.total || 0)}
          />
        </div>
      </div>
    </div>
  );
}

