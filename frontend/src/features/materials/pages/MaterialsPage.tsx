import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Package, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { toast } from 'sonner';
import { resourcesService, Resource, CreateResourceData } from '../../../services/resourcesService';

export function MaterialsPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<CreateResourceData>({
    name: '',
    description: '',
    sku: '',
    basePrice: 0,
    taxRate: 0,
    performanceFactor: 1,
    supplier: '',
    supplierUrl: '',
  });
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', search],
    queryFn: () => resourcesService.getAll(search),
  });


  const saveMutation = useMutation({
    mutationFn: (data: CreateResourceData) =>
      editingResource
        ? resourcesService.update(editingResource.id, data)
        : resourcesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success(
        editingResource ? t('resources.updated', { defaultValue: 'Resource updated' }) : t('resources.created', { defaultValue: 'Resource created' })
      );
      handleCloseModal();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message;
      toast.error(message || t('resources.saveError', { defaultValue: 'Error saving resource' }));
    },
  });

  const handleOpenModal = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name,
        description: resource.description || '',
        sku: resource.sku || '',
        basePrice: parseFloat(resource.basePrice?.toString() || '0') || 0,
        taxRate: resource.taxRate,
        performanceFactor: resource.performanceFactor,
        supplier: resource.supplier || '',
        supplierUrl: resource.supplierUrl || '',
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        description: '',
        sku: '',
        basePrice: 0,
        taxRate: 0,
        performanceFactor: 1,
        supplier: '',
        supplierUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      basePrice: 0,
      taxRate: 0,
      performanceFactor: 1,
      supplier: '',
      supplierUrl: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error(t('resources.requiredFields', { defaultValue: 'Please fill in all required fields' }));
      return;
    }
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{t('resources.title', { defaultValue: 'Resources' })}</h1>
          <p className="text-secondary-600 mt-1">
            {t('resources.subtitle', { defaultValue: 'Manage resources to use in your estimates' })}
          </p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          icon={<Plus className="w-5 h-5" />}
          onClick={() => handleOpenModal()}
        >
          {t('resources.newResource', { defaultValue: 'New Resource' })}
        </Button>
      </div>

      <Card>
        <Input
          placeholder={t('resources.search', { defaultValue: 'Search resources...' })}
          icon={<Search className="w-5 h-5" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-secondary-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources?.map((resource: Resource) => (
            <Card key={resource.id} hover onClick={() => handleOpenModal(resource)}>
              <h3 className="font-bold text-secondary-900">{resource.name}</h3>
              {resource.description && (
                <p className="text-sm text-secondary-600 mt-1">{resource.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-primary-600 font-semibold">
                  ${(parseFloat(resource.basePrice?.toString() || '0') || 0).toFixed(2)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingResource ? t('resources.editResource', { defaultValue: 'Edit Resource' }) : t('resources.newResource', { defaultValue: 'New Resource' })}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('resources.form.name', { defaultValue: 'Name' })}
            placeholder={t('resources.form.namePlaceholder', { defaultValue: 'Resource name' })}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label={t('resources.form.description', { defaultValue: 'Description' })}
            placeholder={t('resources.form.descriptionPlaceholder', { defaultValue: 'Optional description' })}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />


          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              label={t('resources.form.basePrice', { defaultValue: 'Base Price' })}
              placeholder="0.00"
              icon={<DollarSign className="w-4 h-4" />}
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              step="0.01"
            />

            <Input
              type="number"
              label={t('resources.form.taxRate', { defaultValue: 'Tax Rate (%)' })}
              placeholder="0"
              icon={<Percent className="w-4 h-4" />}
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              required
              min="0"
              max="100"
              step="0.01"
            />

            <Input
              type="number"
              label={t('resources.form.performanceFactor', { defaultValue: 'Performance Factor' })}
              placeholder="1"
              icon={<TrendingUp className="w-4 h-4" />}
              value={formData.performanceFactor}
              onChange={(e) => setFormData({ ...formData, performanceFactor: parseFloat(e.target.value) || 1 })}
              min="0"
              step="0.01"
            />
          </div>

          <Input
            label={t('resources.form.sku', { defaultValue: 'SKU' })}
            placeholder={t('resources.form.skuPlaceholder', { defaultValue: 'Optional SKU code' })}
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />

          <Input
            label={t('resources.form.supplier', { defaultValue: 'Supplier' })}
            placeholder={t('resources.form.supplierPlaceholder', { defaultValue: 'Optional supplier name' })}
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />

          <Input
            type="url"
            label={t('resources.form.supplierUrl', { defaultValue: 'Supplier URL' })}
            placeholder={t('resources.form.supplierUrlPlaceholder', { defaultValue: 'Optional supplier website' })}
            value={formData.supplierUrl}
            onChange={(e) => setFormData({ ...formData, supplierUrl: e.target.value })}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              className="flex-1"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveMutation.isPending}
              className="flex-1"
            >
              {editingResource ? t('common.save', { defaultValue: 'Save' }) : t('common.create', { defaultValue: 'Create' })}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
