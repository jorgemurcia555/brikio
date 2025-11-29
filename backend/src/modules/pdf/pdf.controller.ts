import { Controller, Get, Param, UseGuards, Res, Logger, Query } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { EstimatesService } from '../estimates/estimates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(
    private readonly pdfService: PdfService,
    private readonly estimatesService: EstimatesService,
  ) {}

  @Get('estimate/:id')
  async generateEstimatePdf(
    @Param('id') estimateId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
    @Query('lang') lang?: string,
  ) {
    try {
      const estimate = await this.estimatesService.findOne(estimateId, userId);
      const pdfBuffer = await this.pdfService.generateEstimatePdf(estimate, lang || 'en');

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=estimate-${estimate.id}.pdf`,
        'Content-Length': pdfBuffer.length.toString(),
      });

      res.end(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error generating PDF for estimate ${estimateId}:`, error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate PDF',
      });
    }
  }

  @Get('estimate/:id/docx')
  async generateEstimateDocx(
    @Param('id') estimateId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    try {
      const estimate = await this.estimatesService.findOne(estimateId, userId);
      const docxBuffer = await this.pdfService.generateEstimateDocx(estimate);

      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=estimate-${estimate.id}.docx`,
        'Content-Length': docxBuffer.length.toString(),
      });

      res.end(docxBuffer);
    } catch (error) {
      this.logger.error(`Error generating DOCX for estimate ${estimateId}:`, error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate DOCX',
      });
    }
  }
}

