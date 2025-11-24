import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Search } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import api from '../../../services/api';

export function MaterialsPage() {
  const [search, setSearch] = useState('');
  const { t } = useTranslation();

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', search],
    queryFn: () => api.get(`/materials?search=${search}`),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{t('materials.title')}</h1>
          <p className="text-secondary-600 mt-1">
            {t('materials.subtitle')}
          </p>
        </div>
        <Button variant="primary" size="lg" icon={<Plus className="w-5 h-5" />}>
          {t('materials.newMaterial')}
        </Button>
      </div>

      <Card>
        <Input
          placeholder={t('materials.search')}
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
          {materials?.data?.map((material: any) => (
            <Card key={material.id} hover>
              <h3 className="font-bold text-secondary-900">{material.name}</h3>
              <p className="text-sm text-secondary-600 mt-1">{material.category?.name}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-primary-600 font-semibold">
                  ${material.price} / {material.unit?.name}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
