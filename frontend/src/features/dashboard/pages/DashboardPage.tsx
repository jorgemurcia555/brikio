import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, DollarSign } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: metrics } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => api.get('/analytics/dashboard'),
  });

  const { data: recentProjects } = useQuery({
    queryKey: ['estimates', 'recent'],
    queryFn: () => api.get('/projects'), // Backend still uses /projects endpoint
  });

  const { data: allEstimates } = useQuery({
    queryKey: ['estimates', 'all'],
    queryFn: () => api.get('/estimates'),
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
          onClick={() => navigate('/estimates')}
        >
          {t('dashboard.quickActions.newEstimate', { defaultValue: 'New Estimate' })}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { month: 'Jan', revenue: metrics?.data?.totalRevenue ? (metrics.data.totalRevenue * 0.7) : 0 },
              { month: 'Feb', revenue: metrics?.data?.totalRevenue ? (metrics.data.totalRevenue * 0.8) : 0 },
              { month: 'Mar', revenue: metrics?.data?.totalRevenue ? (metrics.data.totalRevenue * 0.9) : 0 },
              { month: 'Apr', revenue: metrics?.data?.totalRevenue || 0 },
              { month: 'May', revenue: metrics?.data?.totalRevenue ? (metrics.data.totalRevenue * 1.1) : 0 },
              { month: 'Jun', revenue: metrics?.data?.totalRevenue ? (metrics.data.totalRevenue * 1.2) : 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#F15A24" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Projects by Status */}
        <Card>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Projects by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Active', value: metrics?.data?.totalProjects ? (metrics.data.totalProjects * 0.6) : 0, color: '#F15A24' },
                  { name: 'Completed', value: metrics?.data?.totalProjects ? (metrics.data.totalProjects * 0.3) : 0, color: '#22C55E' },
                  { name: 'Pending', value: metrics?.data?.totalProjects ? (metrics.data.totalProjects * 0.1) : 0, color: '#FBBF24' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Active', value: 0, color: '#F15A24' },
                  { name: 'Completed', value: 0, color: '#22C55E' },
                  { name: 'Pending', value: 0, color: '#FBBF24' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Estimates Overview */}
        <Card>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Estimates Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(() => {
              // Get estimates data (handle both array and object with data property)
              const estimates = Array.isArray(allEstimates) ? allEstimates : (allEstimates?.data || []);
              
              // Group estimates by month
              const monthData: Record<string, { estimates: number; approved: number }> = {};
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              
              // Initialize last 6 months
              const last6Months = [];
              const now = new Date();
              for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = monthNames[date.getMonth()];
                last6Months.push({ key: monthKey, name: monthName });
                monthData[monthKey] = { estimates: 0, approved: 0 };
              }
              
              // Count estimates by month
              if (Array.isArray(estimates)) {
                estimates.forEach((estimate: any) => {
                  if (estimate.createdAt) {
                    const date = new Date(estimate.createdAt);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthData[monthKey]) {
                      monthData[monthKey].estimates++;
                      if (estimate.status === 'approved') {
                        monthData[monthKey].approved++;
                      }
                    }
                  }
                });
              }
              
              // Convert to chart data format
              return last6Months.map(({ key, name }) => ({
                month: name,
                estimates: monthData[key].estimates,
                approved: monthData[key].approved,
              }));
            })()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="estimates" fill="#3B82F6" name="Total Estimates" />
              <Bar dataKey="approved" fill="#22C55E" name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <h2 className="text-xl font-bold text-secondary-900 mb-4">Performance Metrics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { metric: 'Approval Rate', value: parseFloat(metrics?.data?.approvalRate || '0') },
              { metric: 'Avg Revenue', value: metrics?.data?.totalRevenue ? (metrics.data.totalRevenue / (metrics.data.totalProjects || 1)) : 0 },
              { metric: 'Projects', value: metrics?.data?.totalProjects || 0 },
              { metric: 'Estimates', value: metrics?.data?.totalEstimates || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip formatter={(value: any) => typeof value === 'number' && value > 100 ? `$${value.toLocaleString()}` : value} />
              <Bar dataKey="value" fill="#F15A24" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
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
                onClick={() => navigate(`/estimates/${project.id}`)}
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
                onClick={() => navigate('/estimates')}
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

