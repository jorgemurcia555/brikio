import { useState } from 'react';
import { FileText } from 'lucide-react';
import { InteractiveTooltip } from '../../../../components/ui/InteractiveTooltip';
import { EditableField } from './EditableField';
import { JobSummary } from '../../types/template.types';

interface JobSummarySectionProps {
  jobSummary: JobSummary;
  onChange: (field: keyof JobSummary, value: string) => void;
  projectName?: string;
}

export function JobSummarySection({ jobSummary, onChange, projectName }: JobSummarySectionProps) {
  const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);

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
            placeholder={projectName || "Job Title (e.g., Kitchen Renovation)"}
            displayClassName="text-2xl font-display font-bold text-[#8A3B12]"
            className="text-2xl font-display font-bold"
          />
        </div>
        <EditableField
          value={jobSummary.jobDescription}
          onChange={(value) => onChange('jobDescription', value)}
          placeholder="Job Description / Work Slogan"
          type="textarea"
          rows={2}
          displayClassName="text-sm text-[#6C4A32] leading-relaxed"
          className="text-sm text-[#6C4A32]"
        />
      </div>
    </div>
  );
}

