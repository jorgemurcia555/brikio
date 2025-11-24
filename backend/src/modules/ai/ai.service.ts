import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AI Service - ONLY FOR PRO USERS
 * 
 * This service integrates with AI providers (OpenAI/Anthropic) to provide:
 * - Project setup assistant (analyze natural language descriptions)
 * - Coherence checking (detect inconsistencies in measurements)
 * - Cost optimization suggestions (alternative materials)
 * - Commercial text generation (friendly budget descriptions)
 * 
 * NOTE: All endpoints using this service should be protected with @RequiresPro() decorator
 */
@Injectable()
export class AiService {
  private aiProvider: string;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.aiProvider = this.configService.get<string>('AI_PROVIDER') || 'openai';
    this.apiKey =
      this.aiProvider === 'openai'
        ? (this.configService.get<string>('OPENAI_API_KEY') || '')
        : (this.configService.get<string>('ANTHROPIC_API_KEY') || '');
  }

  /**
   * Analyzes a natural language project description and suggests areas and templates
   * Example: "casa de 2 niveles, 120 m2, 3 recámaras, 2 baños"
   */
  async analyzeProjectDescription(description: string) {
    // TODO: Integrate with AI provider
    // This would call OpenAI/Anthropic API to parse the description
    // and return structured data about suggested areas and templates

    return {
      suggestedAreas: [
        { name: 'Recámara 1', areaM2: 12, floorLevel: 2 },
        { name: 'Recámara 2', areaM2: 10, floorLevel: 2 },
        { name: 'Recámara 3', areaM2: 10, floorLevel: 2 },
        { name: 'Baño 1', areaM2: 4, floorLevel: 1 },
        { name: 'Baño 2', areaM2: 4, floorLevel: 2 },
      ],
      suggestedTemplates: [
        'Muro de block',
        'Piso cerámico',
        'Techo de concreto',
      ],
      totalArea: 120,
    };
  }

  /**
   * Checks estimate for coherence issues
   */
  async checkCoherence(estimate: any) {
    // TODO: AI analysis of measurements and materials
    return {
      issues: [],
      warnings: [],
      suggestions: [],
    };
  }

  /**
   * Suggests cost optimizations
   */
  async optimizeCosts(estimate: any) {
    // TODO: AI suggestions for alternative materials
    return {
      alternatives: [],
      potentialSavings: 0,
    };
  }

  /**
   * Generates commercial-friendly description
   */
  async generateDescription(estimate: any) {
    // TODO: AI text generation
    return {
      description: 'Presupuesto generado por IA...',
    };
  }
}

