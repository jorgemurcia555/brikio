import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { EstimatesModule } from '../estimates/estimates.module';

@Module({
  imports: [EstimatesModule],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}

