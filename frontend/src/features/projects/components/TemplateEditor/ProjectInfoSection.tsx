import { MapPin } from 'lucide-react';
import { EditableField } from './EditableField';
import { ProjectInfo } from '../../types/template.types';

interface ProjectInfoSectionProps {
  projectInfo: ProjectInfo;
  onChange: (field: keyof ProjectInfo, value: string) => void;
  layout: 'one-column' | 'two-columns';
  readOnly?: boolean;
}

export function ProjectInfoSection({ projectInfo, onChange, layout, readOnly = false }: ProjectInfoSectionProps) {
  if (readOnly) {
    const hasAnyField = projectInfo.projectAddress || projectInfo.city || projectInfo.state || 
                        projectInfo.country || projectInfo.estimateDate || projectInfo.workDuration;
    
    if (!hasAnyField) {
      return null;
    }
    
    return (
      <div className="text-sm text-[#6C4A32]">
        <div className={layout === 'two-columns' ? 'grid grid-cols-2 gap-x-6 gap-y-2' : 'space-y-2'}>
          {projectInfo.projectAddress && (
            <div>
              <span className="font-semibold text-[#8A3B12]">Address: </span>
              <span>{projectInfo.projectAddress}</span>
            </div>
          )}
          {projectInfo.city && (
            <div>
              <span className="font-semibold text-[#8A3B12]">City: </span>
              <span>{projectInfo.city}</span>
            </div>
          )}
          {projectInfo.state && (
            <div>
              <span className="font-semibold text-[#8A3B12]">State: </span>
              <span>{projectInfo.state}</span>
            </div>
          )}
          {projectInfo.country && (
            <div>
              <span className="font-semibold text-[#8A3B12]">Country: </span>
              <span>{projectInfo.country}</span>
            </div>
          )}
          {projectInfo.estimateDate && (
            <div>
              <span className="font-semibold text-[#8A3B12]">Date: </span>
              <span>{new Date(projectInfo.estimateDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
          {projectInfo.workDuration && (
            <div>
              <span className="font-semibold text-[#8A3B12]">Duration: </span>
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">Address:</span>
            <EditableField
              value={projectInfo.projectAddress}
              onChange={(value) => onChange('projectAddress', value)}
              placeholder="123 Main Street"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">City:</span>
            <EditableField
              value={projectInfo.city}
              onChange={(value) => onChange('city', value)}
              placeholder="City"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">State:</span>
            <EditableField
              value={projectInfo.state}
              onChange={(value) => onChange('state', value)}
              placeholder="State"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">Country:</span>
            <EditableField
              value={projectInfo.country}
              onChange={(value) => onChange('country', value)}
              placeholder="Country"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">Date:</span>
            <EditableField
              value={projectInfo.estimateDate}
              onChange={(value) => onChange('estimateDate', value)}
              type="date"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6C4A32] whitespace-nowrap">Duration:</span>
            <EditableField
              value={projectInfo.workDuration}
              onChange={(value) => onChange('workDuration', value)}
              placeholder="3 months"
              displayClassName="text-sm text-[#6C4A32] flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

