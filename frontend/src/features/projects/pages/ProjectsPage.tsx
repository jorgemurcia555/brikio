import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { projectsService } from '../../../services/projectsService';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getAll,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{t('projects.title')}</h1>
          <p className="text-secondary-600 mt-1">
            {t('projects.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => navigate('/projects/new')}
        >
          {t('projects.newProject')}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-secondary-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.data?.map((project: any) => (
            <Card
              key={project.id}
              hover
              className="cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FolderKanban className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-secondary-900">
                    {project.name}
                  </h3>
                  <p className="text-sm text-secondary-600 mt-1">
                    {project.description || t('projects.noDescription')}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-secondary-500">
                      {project.areas?.length || 0} {t('projects.areas')}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

