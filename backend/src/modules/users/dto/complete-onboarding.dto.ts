import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  currency: string; // USD, MXN, etc.

  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;

  @IsString()
  defaultUnit: string; // m2, ml, etc.

  @IsOptional()
  @IsString()
  language?: string;
}

