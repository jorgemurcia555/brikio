import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsUUID()
  categoryId: string;

  @IsUUID()
  unitId: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;

  @IsNumber()
  @Min(0)
  performanceFactor: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  supplierUrl?: string;
}

