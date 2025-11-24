import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  areaM2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perimeterMl?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heightM?: number;

  @IsOptional()
  @IsNumber()
  floorLevel?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

