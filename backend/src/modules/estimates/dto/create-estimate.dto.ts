import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class EstimateItemDto {
  @IsUUID()
  @IsOptional()
  areaId?: string;

  @IsUUID()
  @IsOptional()
  templateItemId?: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsUUID()
  unitId: string;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  tax: number;

  @IsOptional()
  breakdown?: any;
}

export class CreateEstimateDto {
  @IsUUID()
  projectId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  profitMarginPercent: number;

  @IsNumber()
  @Min(0)
  laborCost: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstimateItemDto)
  items?: EstimateItemDto[];
}

