import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { projectsService } from '../../../services/projectsService';
import { estimatesService } from '../../../services/estimatesService';

export function NewEstimatePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [estimateData, setEstimateData] = useState({
    profitMarginPercent: 15,
    laborCost: 0,
    notes: '',
  });

  const { data: project } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsService.getOne(projectId!),
    enabled: !!projectId,
  });

  const createEstimateMutation = useMutation({
    mutationFn: estimatesService.create,
    onSuccess: () => {
      toast.success('Presupuesto creado exitosamente');
      navigate(`/projects/${projectId}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      if (message?.includes('limit')) {
        toast.error('Has alcanzado el límite de presupuestos. Actualiza a Pro.');
      } else {
        toast.error('Error al crear presupuesto');
      }
    },
  });

  const handleSubmit = () => {
    createEstimateMutation.mutate({
      projectId,
      ...estimateData,
    });
  };

  const steps = [
    { id: 1, name: 'Configuración' },
    { id: 2, name: 'Materiales' },
    { id: 3, name: 'Revisión' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Nuevo Presupuesto
          </h1>
          <p className="text-secondary-600 mt-1">
            {project?.data?.name}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                currentStep >= step.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-200 text-secondary-600'
              }`}
            >
              {currentStep > step.id ? (
                <Check className="w-5 h-5" />
              ) : (
                step.id
              )}
            </div>
            <span className="ml-2 font-medium text-secondary-900">
              {step.name}
            </span>
            {index < steps.length - 1 && (
              <div className="w-16 h-0.5 bg-secondary-200 mx-4" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-secondary-900">
              Configuración del Presupuesto
            </h2>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Margen de Utilidad (%)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg border-2 border-secondary-200"
                value={estimateData.profitMarginPercent}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    profitMarginPercent: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Costo de Mano de Obra
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 rounded-lg border-2 border-secondary-200"
                value={estimateData.laborCost}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    laborCost: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-secondary-900">
              Seleccionar Materiales
            </h2>
            <p className="text-secondary-600">
              Aquí irían las plantillas y materiales...
            </p>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-secondary-900">
              Revisión Final
            </h2>
            <p className="text-secondary-600">
              Revisa los datos antes de crear el presupuesto.
            </p>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-5 h-5" />
          Anterior
        </Button>
        {currentStep < steps.length ? (
          <Button
            variant="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
          >
            Siguiente
            <ArrowRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={createEstimateMutation.isPending}
          >
            Crear Presupuesto
          </Button>
        )}
      </div>
    </div>
  );
}

