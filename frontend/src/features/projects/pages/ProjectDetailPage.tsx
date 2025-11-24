import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Plus, ArrowLeft } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { projectsService } from '../../../services/projectsService';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.getOne(id!),
    enabled: !!id,
  });

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

      {/* Areas */}
      <Card>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">
          Áreas del Proyecto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project?.data?.areas?.map((area: any) => (
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
      </Card>
    </div>
  );
}

