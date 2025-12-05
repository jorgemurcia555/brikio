import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FileText, Plus, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n/config';
import axios from 'axios';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { projectsService } from '../../../services/projectsService';
import { estimatesService } from '../../../services/estimatesService';
import { useAuthStore } from '../../../stores/authStore';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { accessToken } = useAuthStore();

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.getOne(id!),
    enabled: !!id,
  });

  const downloadPdfMutation = useMutation({
    mutationFn: async (estimateId: string) => {
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
      
      return { blob, estimateId };
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

  const handleDownloadPdf = (estimateId: string) => {
    downloadPdfMutation.mutate(estimateId);
  };

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

  const handleDownloadDocx = (estimateId: string) => {
    downloadDocxMutation.mutate(estimateId);
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-secondary-900">
            {project?.data?.name}
          </h1>
          <p className="text-secondary-600 mt-1">
            {project?.data?.description || 'Sin descripción'}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => navigate(`/estimates/new/${id}`)}
        >
          Nuevo Presupuesto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Info */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-secondary-900 mb-4">
            Información del Proyecto
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-600">Cliente</p>
              <p className="font-semibold text-secondary-900">
                {project?.data?.client?.name || 'Sin cliente'}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Ubicación</p>
              <p className="font-semibold text-secondary-900">
                {project?.data?.location || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Tipo</p>
              <p className="font-semibold text-secondary-900">
                {project?.data?.projectType || 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">Área Total</p>
              <p className="font-semibold text-secondary-900">
                {project?.data?.totalArea} m²
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">
            Estadísticas
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-secondary-600">Áreas</span>
              <span className="font-bold text-secondary-900">
                {project?.data?.areas?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-600">Presupuestos</span>
              <span className="font-bold text-secondary-900">
                {project?.data?.estimates?.length || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Estimates */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          {t('estimates.estimates.title')}
        </h2>
        {project?.data?.estimates && project.data.estimates.length > 0 ? (
          <div className="space-y-4">
            {project.data.estimates.map((estimate: any) => (
              <div
                key={estimate.id}
                className="p-4 bg-secondary-50 rounded-lg border border-secondary-200 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-secondary-900">
                        {t('estimates.estimates.estimate')} #{estimate.version || 1}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          estimate.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : estimate.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : estimate.status === 'sent'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {estimate.status || 'draft'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-secondary-600">
                          {t('projects.estimates.subtotal', { defaultValue: 'Subtotal' })}
                        </p>
                        <p className="font-semibold text-secondary-900">
                          ${parseFloat(estimate.subtotal || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary-600">
                          {t('projects.estimates.tax', { defaultValue: 'Tax' })}
                        </p>
                        <p className="font-semibold text-secondary-900">
                          ${parseFloat(estimate.taxTotal || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary-600">
                          {t('estimates.estimates.total')}
                        </p>
                        <p className="font-semibold text-primary-600 text-lg">
                          ${parseFloat(estimate.total || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary-600">
                          {t('estimates.estimates.created')}
                        </p>
                        <p className="font-semibold text-secondary-900">
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                      onClick={() => handleDownloadPdf(estimate.id)}
                      loading={downloadPdfMutation.isPending && downloadPdfMutation.variables === estimate.id}
                    >
                      PDF
                    </Button>
                    {/* DOCX button disabled for now */}
                    {/* <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-4 h-4" />}
                      onClick={() => handleDownloadDocx(estimate.id)}
                      loading={downloadDocxMutation.isPending && downloadDocxMutation.variables === estimate.id}
                      disabled
                    >
                      DOCX
                    </Button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-600">
            <FileText className="w-12 h-12 mx-auto mb-4 text-secondary-400" />
            <p>{t('estimates.estimates.noEstimates')}</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => navigate(`/estimates/new/${id}`)}
            >
              {t('estimates.estimates.createFirst')}
            </Button>
          </div>
        )}
      </Card>

      {/* Areas */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          {t('estimates.areas.title')}
        </h2>
        {project?.data?.areas && project.data.areas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.data.areas.map((area: any) => (
              <div
                key={area.id}
                className="p-4 bg-secondary-50 rounded-lg"
              >
                <h3 className="font-semibold text-secondary-900">{area.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-secondary-600">
                  <p>Área: {area.areaM2} m²</p>
                  {area.perimeterMl && <p>Perímetro: {area.perimeterMl} ml</p>}
                  {area.heightM && <p>Altura: {area.heightM} m</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary-600">
            <p>{t('estimates.areas.noAreas')}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

