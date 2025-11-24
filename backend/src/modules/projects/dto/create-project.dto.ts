import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsNumber()
  totalArea?: number;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

