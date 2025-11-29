import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Building2,
  Users,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { toast } from 'sonner';
import { clientsService } from '../../../services/clientsService';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  companyName?: string;
  notes?: string;
  projectsCount?: number;
  createdAt: string;
}

export function ClientsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    notes: '',
  });

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: clientsService.getAll,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editingClient
        ? clientsService.update(editingClient.id, data)
        : clientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(
        editingClient ? t('clients.updated') : t('clients.created')
      );
      handleCloseModal();
    },
    onError: () => {
      toast.error(t('clients.saveError'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: clientsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(t('clients.deleted'));
    },
    onError: () => {
      toast.error(t('clients.deleteError'));
    },
  });

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        companyName: (client as any).company || client.companyName || '',
        notes: client.notes || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        companyName: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      companyName: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only name and phone are required
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error(t('clients.requiredFields'));
      return;
    }
    // Map companyName to company for backend
    const { companyName, ...restFormData } = formData;
    const dataToSend = {
      ...restFormData,
      company: companyName || undefined,
    };
    saveMutation.mutate(dataToSend);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('clients.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            {t('clients.title')}
          </h1>
          <p className="text-secondary-600 mt-1">{t('clients.subtitle')}</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          {t('clients.addNew')}
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder={t('clients.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
      </Card>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-secondary-200 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-secondary-200 rounded" />
                <div className="h-4 bg-secondary-200 rounded w-3/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-secondary-900 mb-2">
            {t('clients.noClients')}
          </h3>
          <p className="text-secondary-600 mb-6">{t('clients.noClientsDesc')}</p>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5 mr-2" />
            {t('clients.addFirst')}
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client: Client, index: number) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary-900">
                        {client.name}
                      </h3>
                      {client.companyName && (
                        <p className="text-sm text-secondary-500">
                          {client.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(client)}
                      className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-secondary-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-secondary-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {client.projectsCount !== undefined && (
                  <div className="mt-4 pt-4 border-t border-secondary-200">
                    <p className="text-sm text-secondary-600">
                      {t('clients.projectCount', { count: client.projectsCount })}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? t('clients.editClient') : t('clients.addNew')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('clients.form.name')}
            placeholder={t('clients.form.namePlaceholder')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label={t('clients.form.phone')}
            placeholder={t('clients.form.phonePlaceholder')}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <Input
            label={t('clients.form.companyName')}
            placeholder={t('clients.form.companyNamePlaceholder')}
            value={formData.companyName}
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
          />

          <Input
            type="email"
            label={t('clients.form.email')}
            placeholder={t('clients.form.emailPlaceholder')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label={t('clients.form.address')}
            placeholder={t('clients.form.addressPlaceholder')}
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {t('clients.form.notes')}
            </label>
            <textarea
              placeholder={t('clients.form.notesPlaceholder')}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border-2 border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseModal}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={saveMutation.isPending}
              className="flex-1"
            >
              {editingClient ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

