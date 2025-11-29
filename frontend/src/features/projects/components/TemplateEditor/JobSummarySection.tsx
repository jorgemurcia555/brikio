import { useState } from 'react';
import { FileText } from 'lucide-react';
import { InteractiveTooltip } from '../../../../components/ui/InteractiveTooltip';
import { EditableField } from './EditableField';
import { JobSummary } from '../../types/template.types';
import { useTranslation } from 'react-i18next';

interface JobSummarySectionProps {
  jobSummary: JobSummary;
  onChange: (field: keyof JobSummary, value: string) => void;
  projectName?: string;
  readOnly?: boolean;
}

export function JobSummarySection({ jobSummary, onChange, projectName, readOnly }: JobSummarySectionProps) {
  const { t } = useTranslation();
  const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);

  if (readOnly) {
    const hasContent = projectName || jobSummary.jobTitle || jobSummary.jobDescription;
    
    if (!hasContent) {
      return null;
    }
    
    return (
      <div>
        {/* Always prioritize projectName from first step */}
        {(projectName || jobSummary.jobTitle) && (
          <h2 className="text-xl font-bold text-[#8A3B12] mb-3">
            {projectName || jobSummary.jobTitle}
          </h2>
        )}
        {jobSummary.jobDescription && (
          <p className="text-sm text-[#6C4A32] leading-relaxed">{jobSummary.jobDescription}</p>
        )}
      </div>
    );
  }

  // Show projectName only if it exists AND jobTitle is empty AND not currently editing
  const shouldShowProjectName = projectName && !jobSummary.jobTitle && !isEditingJobTitle;

  return (
    <div className="mb-4">
      <div className="space-y-2">
        <div>
          <EditableField
            value={jobSummary.jobTitle}
            onChange={(value) => {
              onChange('jobTitle', value);
              setIsEditingJobTitle(false);
            }}
            onEditStart={() => setIsEditingJobTitle(true)}
            onEditEnd={() => setIsEditingJobTitle(false)}
            placeholder={projectName || t('templateEditor.jobSummary.jobTitlePlaceholder')}
            displayClassName="text-2xl font-display font-bold text-[#8A3B12]"
            className="text-2xl font-display font-bold"
          />
        </div>
        <EditableField
          value={jobSummary.jobDescription}
          onChange={(value) => onChange('jobDescription', value)}
          placeholder={t('templateEditor.jobSummary.jobDescriptionPlaceholder')}
          type="textarea"
          rows={2}
          displayClassName="text-sm text-[#6C4A32] leading-relaxed"
          className="text-sm text-[#6C4A32]"
        />
      </div>
    </div>
  );
}

