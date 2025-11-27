export class CreateEstimateTemplateDto {
  name: string;
  description?: string;
  templateData: {
    sections: any[];
    header: any;
    jobSummary: any;
    projectInfo: any;
    paymentMethod: any;
    contactInfo: any;
    signature: any;
    theme?: string;
  };
  isDefault?: boolean;
}

