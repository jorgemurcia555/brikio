import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FileText, User, Calendar, Trash2, Eye } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import api from '../../../services/api';
import { toast } from 'sonner';
import { useState } from 'react';

export function AdminTemplatesPage() {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'templates'],
    queryFn: () => api.get('/estimate-templates/admin/all'),
  });

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await api.delete(`/estimate-templates/${templateId}`);
      toast.success('Template deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete template');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-secondary-200 rounded animate-pulse w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-secondary-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            {t('admin.templates.title', { defaultValue: 'Saved Templates' })}
          </h1>
          <p className="text-secondary-600 mt-1">
            {t('admin.templates.subtitle', { defaultValue: 'Manage all saved estimate templates' })}
          </p>
        </div>
      </div>

      {templates?.data?.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            {t('admin.templates.noTemplates', { defaultValue: 'No templates found' })}
          </h3>
          <p className="text-secondary-600">
            {t('admin.templates.noTemplatesDescription', {
              defaultValue: 'Templates saved by users will appear here',
            })}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates?.data?.map((template: any) => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-secondary-900 mb-1">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-secondary-600 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <User className="w-4 h-4" />
                  <span>
                    {template.user?.firstName} {template.user?.lastName} ({template.user?.email})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600">
                  <FileText className="w-4 h-4" />
                  <span>
                    Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-secondary-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTemplate(template)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('admin.templates.view', { defaultValue: 'View' })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-accent-600 hover:text-accent-700 hover:bg-accent-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-secondary-900">
                {selectedTemplate.name}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              {selectedTemplate.description && (
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Description</h3>
                  <p className="text-secondary-600">{selectedTemplate.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-secondary-900 mb-2">User Information</h3>
                <p className="text-secondary-600">
                  {selectedTemplate.user?.firstName} {selectedTemplate.user?.lastName}
                </p>
                <p className="text-secondary-600">{selectedTemplate.user?.email}</p>
              </div>

              <div>
                <h3 className="font-semibold text-secondary-900 mb-2">Template Data</h3>
                <pre className="bg-secondary-50 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedTemplate.templateData, null, 2)}
                </pre>
              </div>

              <div className="flex items-center gap-4 text-sm text-secondary-600">
                <span>
                  Created: {new Date(selectedTemplate.createdAt).toLocaleString()}
                </span>
                <span>
                  Used: {selectedTemplate.usageCount} {selectedTemplate.usageCount === 1 ? 'time' : 'times'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

