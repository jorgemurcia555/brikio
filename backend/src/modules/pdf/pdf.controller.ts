import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';
import { EstimatesService } from '../estimates/estimates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly estimatesService: EstimatesService,
  ) {}

  @Get('estimate/:id')
  async generateEstimatePdf(
    @Param('id') estimateId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const estimate = await this.estimatesService.findOne(estimateId, userId);
    const pdfBuffer = await this.pdfService.generateEstimatePdf(estimate);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=estimate-${estimate.id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}

