import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, User } from 'lucide-react';
import { EditableField } from './EditableField';
import { ProjectInfo } from '../../types/template.types';
import { useAuthStore } from '../../../../stores/authStore';
import { clientsService, Client } from '../../../../services/clientsService';
import { useTranslation } from 'react-i18next';

interface ProjectInfoSectionProps {
  projectInfo: ProjectInfo;
  onChange: (field: keyof ProjectInfo, value: string) => void;
  layout: 'one-column' | 'two-columns';
  readOnly?: boolean;
}

export function ProjectInfoSection({ projectInfo, onChange, layout, readOnly = false }: ProjectInfoSectionProps) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const clientSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && !readOnly) {
      clientsService.getAll().then(setClients).catch(() => {});
    }
  }, [isAuthenticated, readOnly]);

  // Close client search modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target as Node)) {
        setShowClientSearch(false);
        setClientSearchTerm('');
      }
    };

    if (showClientSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showClientSearch]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const handleSelectClient = (client: Client) => {
    onChange('clientName', client.name);
    setShowClientSearch(false);
    setClientSearchTerm('');
  };

  if (readOnly) {
    const hasAnyField = projectInfo.clientName || projectInfo.projectAddress || projectInfo.city || projectInfo.state || 
                        projectInfo.country || projectInfo.estimateDate || projectInfo.workDuration;
    
    if (!hasAnyField) {
      return null;
    }
    
    return (
      <div className="text-sm text-[#6C4A32]">
        <div className={layout === 'two-columns' ? 'grid grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}>
          {projectInfo.clientName && (
            <div>
              <span className="font-semibold text-[#8A3B12]">{t('templateEditor.projectInfo.client')}: </span>
              <span>{projectInfo.clientName}</span>
            </div>
          )}
          {projectInfo.projectAddress && (
            <div>
              <span className="font-semibold text-[#8A3B12]">{t('templateEditor.projectInfo.address')}: </span>
              <span>{projectInfo.projectAddress}</span>
            </div>
          )}
          {projectInfo.city && (
            <div>
              <span className="font-semibold text-[#8A3B12]">{t('templateEditor.projectInfo.city')}: </span>
              <span>{projectInfo.city}</span>
            </div>
          )}
          {projectInfo.state && (
            <div>
              <span className="font-semibold text-[#8A3B12]">{t('templateEditor.projectInfo.state')}: </span>
              <span>{projectInfo.state}</span>
            </div>
          )}
          {projectInfo.country && (
            <div>
              <span className="font-semibold text-[#8A3B12]">{t('templateEditor.projectInfo.country')}: </span>
              <span>{projectInfo.country}</span>
            </div>
          )}
          {projectInfo.estimateDate && (
            <div>
              <span className="font-semibold text-[#8A3B12]">{t('templateEditor.projectInfo.date')}: </span>
              <span>{new Date(projectInfo.estimateDate).toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
          {projectInfo.workDuration && (
            <div>
              <span className="font-semibold text-[#8A3B12]">{t('templateEditor.projectInfo.duration')}: </span>
              <span>{projectInfo.workDuration}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 pb-4 border-b border-[#F4C197]">
      <div className="flex items-start gap-4">
        <div className={`flex-1 ${layout === 'two-columns' ? 'grid grid-cols-2 gap-x-4 gap-y-1' : 'space-y-1'}`}>
          {/* Client Name Field */}
          <div className="relative col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.projectInfo.client')}:</span>
              {isAuthenticated ? (
                <div className="flex-1 relative">
                  <div className="flex items-center gap-2">
                    <EditableField
                      value={projectInfo.clientName || ''}
                      onChange={(value) => onChange('clientName', value)}
                      placeholder={t('templateEditor.projectInfo.clientSearchPlaceholder')}
                      displayClassName="text-sm text-[#6C4A32] flex-1"
                      onEditStart={() => setShowClientSearch(true)}
                    />
                    <button
                      onClick={() => setShowClientSearch(!showClientSearch)}
                      className="p-1.5 rounded hover:bg-[#FFF7EA] transition-colors"
                      aria-label={t('templateEditor.projectInfo.searchClients')}
                    >
                      <Search className="w-4 h-4 text-[#C05A2B]" />
                    </button>
                  </div>
                  {showClientSearch && (
                    <div ref={clientSearchRef} className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#F4C197] rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-[#F4C197]">
                        <input
                          type="text"
                          value={clientSearchTerm}
                          onChange={(e) => setClientSearchTerm(e.target.value)}
                          placeholder={t('templateEditor.projectInfo.searchClientsPlaceholder')}
                          className="w-full px-3 py-2 border border-[#F4C197] rounded-lg focus:outline-none focus:border-[#F15A24] text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="p-1">
                        {filteredClients.length > 0 ? (
                          filteredClients.map((client) => (
                            <button
                              key={client.id}
                              onClick={() => handleSelectClient(client)}
                              className="w-full text-left px-3 py-2 hover:bg-[#FFF7EA] rounded transition-colors"
                            >
                              <div className="font-medium text-[#8A3B12]">{client.name}</div>
                              {client.email && (
                                <div className="text-xs text-[#6C4A32]">{client.email}</div>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-[#6C4A32] text-center">
                            {clientSearchTerm ? t('templateEditor.projectInfo.noClientsFound') : t('templateEditor.projectInfo.noClientsSaved')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EditableField
                  value={projectInfo.clientName || ''}
                  onChange={(value) => onChange('clientName', value)}
                  placeholder={t('templateEditor.projectInfo.clientPlaceholder')}
                  displayClassName="text-sm text-[#6C4A32] flex-1"
                />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.projectInfo.address')}:</span>
            <EditableField
              value={projectInfo.projectAddress}
              onChange={(value) => onChange('projectAddress', value)}
              placeholder={t('templateEditor.projectInfo.addressPlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.projectInfo.city')}:</span>
            <EditableField
              value={projectInfo.city}
              onChange={(value) => onChange('city', value)}
              placeholder={t('templateEditor.projectInfo.cityPlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.projectInfo.state')}:</span>
            <EditableField
              value={projectInfo.state}
              onChange={(value) => onChange('state', value)}
              placeholder={t('templateEditor.projectInfo.statePlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.projectInfo.country')}:</span>
            <EditableField
              value={projectInfo.country}
              onChange={(value) => onChange('country', value)}
              placeholder={t('templateEditor.projectInfo.countryPlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.projectInfo.date')}:</span>
            <EditableField
              value={projectInfo.estimateDate}
              onChange={(value) => onChange('estimateDate', value)}
              type="date"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">{t('templateEditor.projectInfo.duration')}:</span>
            <EditableField
              value={projectInfo.workDuration}
              onChange={(value) => onChange('workDuration', value)}
              placeholder={t('templateEditor.projectInfo.durationPlaceholder')}
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

