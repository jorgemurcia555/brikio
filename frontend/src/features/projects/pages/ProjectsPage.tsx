import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { estimatesService } from '../../../services/estimatesService';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: estimates, isLoading } = useQuery({
    queryKey: ['estimates'],
    queryFn: estimatesService.getAll,
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary-900">{t('estimates.title')}</h1>
          <p className="text-xs sm:text-sm text-secondary-600 mt-0.5 sm:mt-1">
            {t('estimates.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="w-full sm:w-auto"
          icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
          onClick={() => navigate('/projects/new?new=true')}
        >
          <span className="hidden sm:inline">{t('estimates.newEstimate')}</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-secondary-100" />
          ))}
        </div>
      ) : (estimates?.data && estimates.data.length > 0) || (Array.isArray(estimates) && estimates.length > 0) ? (
        <div className="space-y-4">
          {(estimates?.data || estimates || []).map((estimate: any) => (
            <Card
              key={estimate.id}
              hover
              className="cursor-pointer"
              onClick={() => navigate(`/estimates/${estimate.id}`)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
                  <div className="p-2 sm:p-3 bg-primary-100 rounded-lg flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base text-secondary-900 truncate">
                        {t('estimates.estimates.estimate')} #{estimate.version || 1}
                      </h3>
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-secondary-600 text-xs">{t('estimates.estimates.subtotal')}</p>
                        <p className="font-semibold text-secondary-900 text-xs sm:text-sm">
                          ${parseFloat(estimate.subtotal || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary-600 text-xs">{t('estimates.estimates.tax')}</p>
                        <p className="font-semibold text-secondary-900 text-xs sm:text-sm">
                          ${parseFloat(estimate.taxTotal || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-secondary-600 text-xs">{t('estimates.estimates.total')}</p>
                        <p className="font-semibold text-primary-600 text-sm sm:text-base md:text-lg">
                          ${parseFloat(estimate.total || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-secondary-600 text-xs">{t('estimates.estimates.created')}</p>
                        <p className="font-semibold text-secondary-900 text-xs sm:text-sm">
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto sm:ml-4" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                    icon={<Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    onClick={() => {
                      // Download will be handled in detail page
                      navigate(`/estimates/${estimate.id}`);
                    }}
                  >
                    PDF
                  </Button>
                  {/* DOCX button disabled for now */}
                  {/* <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText className="w-4 h-4" />}
                    onClick={() => {
                      // Download will be handled in detail page
                      navigate(`/estimates/${estimate.id}`);
                    }}
                    disabled
                  >
                    DOCX
                  </Button> */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-secondary-900 mb-2">
            {t('estimates.estimates.noEstimates')}
          </h3>
          <p className="text-secondary-600 mb-6">
            {t('estimates.estimates.noEstimatesDesc', { defaultValue: 'Create your first estimate to get started' })}
          </p>
          <Button onClick={() => navigate('/projects/new?new=true')}>
            <Plus className="w-5 h-5 mr-2" />
            {t('estimates.estimates.createFirst')}
          </Button>
        </Card>
      )}
    </div>
  );
}

