export type TemplateSectionId =
  | 'header'
  | 'jobSummary'
  | 'projectInfo'
  | 'itemsTable'
  | 'paymentMethod'
  | 'contactInfo'
  /* | 'signature' */;

export interface TemplateSectionConfig {
  id: TemplateSectionId;
  label: string;
  enabled: boolean;
  order: number;
  layout?: 'one-column' | 'two-columns';
  required?: boolean; // For itemsTable
}

export interface EstimateHeader {
  companyName: string;
  companyTagline: string;
  estimateNumber: string;
  date: string;
  workDuration: string;
  logoUrl?: string;
}

export interface JobSummary {
  jobTitle: string;
  jobDescription: string;
}

export interface ProjectInfo {
  clientName?: string;
  projectAddress: string;
  city: string;
  state: string;
  country: string;
  estimateDate: string;
  workDuration: string;
}

export interface PaymentMethod {
  bankName: string;
  accountNumber: string;
  paymentMode: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  facebook: string;
  twitter: string;
}

export interface Signature {
  responsibleName: string;
  position: string;
  signatureDate: string;
  signatureUrl?: string;
}

export interface EstimateTemplate {
  header: EstimateHeader;
  jobSummary: JobSummary;
  projectInfo: ProjectInfo;
  paymentMethod: PaymentMethod;
  contactInfo: ContactInfo;
  signature: Signature;
  sections: TemplateSectionConfig[];
}
