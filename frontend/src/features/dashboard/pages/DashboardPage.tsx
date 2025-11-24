import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, DollarSign } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

export function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: metrics } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard'),
  });

  const { data: recentProjects } = useQuery({
    queryKey: ['projects', 'recent'],
    queryFn: () => api.get('/projects'),
  });

  const stats = [
    {
      name: t('dashboard.stats.totalProjects'),
      value: metrics?.data?.totalProjects || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: t('dashboard.stats.activeEstimates'),
      value: metrics?.data?.totalEstimates || 0,
      icon: FileText,
      color: 'bg-primary-500',
    },
    {
      name: t('dashboard.stats.approvalRate'),
      value: `${metrics?.data?.approvalRate || 0}%`,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: t('dashboard.stats.revenue'),
      value: `$${(metrics?.data?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-accent-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{t('dashboard.welcome')}</h1>
          <p className="text-secondary-600 mt-1">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/projects')}
        >
          {t('dashboard.quickActions.newProject')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} variant="elevated" hover>
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">{stat.name}</p>
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          {t('dashboard.recentProjects.title')}
        </h2>
        <div className="space-y-3">
          {recentProjects?.data && recentProjects.data.length > 0 ? (
            recentProjects.data.slice(0, 5).map((project: any) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div>
                  <h3 className="font-semibold text-secondary-900">{project.name}</h3>
                  <p className="text-sm text-secondary-600">
                    {project.client?.name || t('dashboard.recentProjects.noClient', { defaultValue: 'No client' })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {project.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary-600">{t('dashboard.recentProjects.noProjects')}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/projects')}
              >
                {t('dashboard.recentProjects.createFirst')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

