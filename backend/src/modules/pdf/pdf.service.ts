import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, ImageRun, ExternalHyperlink, TextWrappingType, TextWrappingSide } from 'docx';
import axios from 'axios';

/**
 * PDF Generation Service
 * Generates professional PDFs for estimates using PDFKit
 */
@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateEstimatePdf(estimate: any, lang: string = 'en'): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });
        doc.on('error', (error) => {
          this.logger.error('PDF generation error:', error);
          reject(error);
        });

        const project = estimate.project || {};
        const items = estimate.items || [];
        const subtotal = parseFloat(estimate.subtotal) || 0;
        const taxTotal = parseFloat(estimate.taxTotal) || 0;
        const total = parseFloat(estimate.total) || 0;
        const profitMarginPercent = parseFloat(estimate.profitMarginPercent) || 0;
        const laborCost = parseFloat(estimate.laborCost) || 0;

        // Get templateData from project metadata
        const templateData = project.metadata?.templateData || {};
        const theme = templateData.theme || 'company';
        const header = templateData.header || {};
        const jobSummary = templateData.jobSummary || {};
        const projectInfo = templateData.projectInfo || {};
        const paymentMethod = templateData.paymentMethod || {};
        const contactInfo = templateData.contactInfo || {};
        const signature = templateData.signature || {};
        const sections = templateData.sections || [];
        // Get profit margin from templateData or use estimate value
        const templateProfitMargin = templateData.profitMarginPercent;
        const finalProfitMarginPercent = templateProfitMargin !== undefined ? templateProfitMargin : profitMarginPercent;
        // Get tax enabled from templateData
        const templateTaxEnabled = templateData.taxEnabled || false;
        // Check if any item has tax
        const hasItemTax = items.some((item: any) => parseFloat(item.tax || 0) > 0);
        const shouldShowTax = templateTaxEnabled || hasItemTax || taxTotal > 0;

        // Get theme colors
        const themeColors = this.getThemeColors(theme);
        const primaryColor = themeColors.primary;
        const secondaryColor = themeColors.secondary;
        const textColor = themeColors.text;
        const borderColor = themeColors.border;

        // Helper to load image from URL (base64 or http)
        const loadImage = async (url: string): Promise<Buffer | null> => {
          try {
            if (url.startsWith('data:')) {
              // Base64 image
              const base64Data = url.split(',')[1];
              return Buffer.from(base64Data, 'base64');
            } else if (url.startsWith('http')) {
              // HTTP URL
              const response = await axios.get(url, { responseType: 'arraybuffer' });
              return Buffer.from(response.data);
            }
            return null;
          } catch (error) {
            this.logger.warn(`Failed to load image from ${url}:`, error);
            return null;
          }
        };

        // Header section with logo
        const headerStartY = doc.y;
        let headerY = headerStartY;

        // Logo (right aligned)
        if (header.logoUrl) {
          const logoBuffer = await loadImage(header.logoUrl);
          if (logoBuffer) {
            try {
              doc.image(logoBuffer, doc.page.width - 120, headerY, {
                width: 80,
                height: 80,
                fit: [80, 80],
                align: 'right',
              });
            } catch (error) {
              this.logger.warn('Failed to add logo to PDF:', error);
            }
          }
        }

        // Company name (reduced size to prevent wrapping)
        if (header.companyName) {
          doc.fontSize(20)
            .fillColor(secondaryColor)
            .font('Helvetica-Bold')
            .text(header.companyName, 40, headerY, {
              width: header.logoUrl ? doc.page.width - 250 : doc.page.width - 80,
              align: 'left',
            });
          headerY += 25;
        }

        // Company tagline
        if (header.companyTagline) {
          doc.fontSize(12)
            .fillColor(textColor)
            .font('Helvetica')
            .text(header.companyTagline, 40, headerY, {
              width: header.logoUrl ? doc.page.width - 250 : doc.page.width - 80,
              align: 'left',
            });
          headerY += 20;
        }

        // Estimate details in header (only Estimate #, no date)
        if (header.estimateNumber) {
          doc.fontSize(11)
            .fillColor(textColor)
            .text(`Estimate #: ${header.estimateNumber}`, 40, headerY, {
              width: header.logoUrl ? doc.page.width - 250 : doc.page.width - 80,
              align: 'left',
            });
          headerY += 20;
        }

        // Draw border line under header
        doc.moveTo(40, headerY + 10)
          .lineTo(doc.page.width - 40, headerY + 10)
          .strokeColor(borderColor)
          .lineWidth(2)
          .stroke();

        doc.y = headerY + 30;

        // Sort sections by order
        const sortedSections = [...sections]
          .filter((s) => s.enabled)
          .sort((a, b) => a.order - b.order);

        // Calculate subtotal from items
        const calculatedSubtotal = items.reduce((sum: number, item: any) => {
          return sum + (parseFloat(item.subtotal || 0));
        }, 0);
        const actualSubtotal = subtotal > 0 ? subtotal : calculatedSubtotal;
        
        // Recalculate taxTotal if taxEnabled is true but taxTotal is 0
        let actualTaxTotal = taxTotal;
        if (templateTaxEnabled && actualTaxTotal === 0 && actualSubtotal > 0) {
          // Calculate tax from taxRatePercent if available
          const taxRatePercent = templateData.taxRatePercent || templateData.profitMarginPercent || 0;
          if (taxRatePercent > 0) {
            actualTaxTotal = (actualSubtotal * taxRatePercent) / 100;
          }
        }

        // Process sections in order
        for (let i = 0; i < sortedSections.length; i++) {
          const section = sortedSections[i];
          
          if (section.id === 'jobSummary') {
            // Use projectName as fallback if jobTitle is empty
            const jobTitle = jobSummary.jobTitle || project.name || '';
            const hasContent = jobTitle || jobSummary.jobDescription;
            
            if (hasContent) {
              if (jobTitle) {
                doc.fontSize(18)
                  .fillColor(secondaryColor)
                  .font('Helvetica-Bold')
                  .text(jobTitle);
                doc.moveDown(0.5);
              }
              
              if (jobSummary.jobDescription) {
                doc.fontSize(11)
                  .fillColor(textColor)
                  .font('Helvetica')
                  .text(jobSummary.jobDescription);
              }
              doc.moveDown(1);
            }
          } else if (section.id === 'projectInfo') {
            // Check if projectInfo has any fields
            const hasProjectInfo = projectInfo.clientName || projectInfo.projectAddress || 
                                  projectInfo.city || projectInfo.state || projectInfo.country ||
                                  projectInfo.estimateDate || projectInfo.workDuration;
            
            if (hasProjectInfo) {
              doc.fontSize(11)
                .fillColor(textColor)
                .font('Helvetica');
              
              // Use simple text flow to avoid overlapping
              if (projectInfo.clientName) {
                doc.font('Helvetica-Bold')
                  .fillColor(secondaryColor)
                  .text('Client: ', { continued: true })
                  .font('Helvetica')
                  .fillColor(textColor)
                  .text(projectInfo.clientName);
                doc.moveDown(0.3);
              }
              if (projectInfo.projectAddress) {
                doc.font('Helvetica-Bold')
                  .fillColor(secondaryColor)
                  .text('Address: ', { continued: true })
                  .font('Helvetica')
                  .fillColor(textColor)
                  .text(projectInfo.projectAddress);
                doc.moveDown(0.3);
              }
              if (projectInfo.city || projectInfo.state || projectInfo.country) {
                const location = [projectInfo.city, projectInfo.state, projectInfo.country]
                  .filter(Boolean)
                  .join(', ');
                if (location) {
                  doc.font('Helvetica-Bold')
                    .fillColor(secondaryColor)
                    .text('Location: ', { continued: true })
                    .font('Helvetica')
                    .fillColor(textColor)
                    .text(location);
                  doc.moveDown(0.3);
                }
              }
              if (projectInfo.estimateDate) {
                doc.font('Helvetica-Bold')
                  .fillColor(secondaryColor)
                  .text('Date: ', { continued: true })
                  .font('Helvetica')
                  .fillColor(textColor)
                  .text(new Date(projectInfo.estimateDate).toLocaleDateString());
                doc.moveDown(0.3);
              }
              if (projectInfo.workDuration) {
                doc.font('Helvetica-Bold')
                  .fillColor(secondaryColor)
                  .text('Work Duration: ', { continued: true })
                  .font('Helvetica')
                  .fillColor(textColor)
                  .text(projectInfo.workDuration);
                doc.moveDown(0.3);
              }
              
              doc.moveDown(0.5);
            }
          } else if (section.id === 'itemsTable') {
            // Table Header
            const tableTop = doc.y;
            const itemHeight = 20;
            const tableWidth = doc.page.width - 80; // 40 left + 40 right
            const colWidths = [
              (tableWidth * 0.45), // Description
              (tableWidth * 0.15), // Quantity
              (tableWidth * 0.20), // Unit Price
              (tableWidth * 0.20), // Total
            ];
            const startX = 40;

            // Header row with theme color
            doc.rect(startX, tableTop, tableWidth, itemHeight)
              .fill(primaryColor);
            
            doc.fontSize(11)
              .fillColor('#FFFFFF')
              .font('Helvetica-Bold')
              .text('Description', startX + 5, tableTop + 5, { width: colWidths[0] - 10 })
              .text('Qty', startX + colWidths[0] + 5, tableTop + 5, { width: colWidths[1] - 10, align: 'right' })
              .text('Price', startX + colWidths[0] + colWidths[1] + 5, tableTop + 5, { width: colWidths[2] - 10, align: 'right' })
              .text('Total', startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 5, { width: colWidths[3] - 10, align: 'right' });

            // Items rows with alternating colors
            let currentY = tableTop + itemHeight;
            items.forEach((item: any, index: number) => {
              const isEven = index % 2 === 0;
              const rowColor = isEven ? '#FFF7EA' : '#FFFFFF';
              
              doc.rect(startX, currentY, tableWidth, itemHeight)
                .fill(rowColor);
              
              doc.fontSize(10)
                .fillColor('#333333')
                .font('Helvetica')
                .text(item.description || 'N/A', startX + 5, currentY + 5, { width: colWidths[0] - 10 })
                .text(String(item.quantity || 0), startX + colWidths[0] + 5, currentY + 5, { width: colWidths[1] - 10, align: 'right' })
                .text(`$${parseFloat(item.unitCost || 0).toFixed(2)}`, startX + colWidths[0] + colWidths[1] + 5, currentY + 5, { width: colWidths[2] - 10, align: 'right' })
                .text(`$${parseFloat(item.subtotal || 0).toFixed(2)}`, startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, currentY + 5, { width: colWidths[3] - 10, align: 'right' });
              
              currentY += itemHeight;
            });

            // Totals section right after table (with proper spacing to avoid overlap)
            const totalsStartY = currentY + 20;
            doc.y = totalsStartY;
            const totalsWidth = 250;
            const totalsX = doc.page.width - 40 - totalsWidth;

            // Translations based on language
            const labels = {
              subtotal: lang === 'es' ? 'Subtotal:' : 'Subtotal:',
              tax: lang === 'es' ? 'Impuesto:' : 'Tax:',
              laborCost: lang === 'es' ? 'Costo de Mano de Obra:' : 'Labor Cost:',
              total: lang === 'es' ? 'TOTAL:' : 'TOTAL:',
            };

            doc.fontSize(11)
              .fillColor(textColor)
              .font('Helvetica')
              .text(labels.subtotal, totalsX, totalsStartY, { width: 150 })
              .text(`$${actualSubtotal.toFixed(2)}`, totalsX + 150, totalsStartY, { width: 100, align: 'right' });

            let totalsY = totalsStartY + 18;
            
            if (shouldShowTax && actualTaxTotal > 0) {
              doc.fontSize(11)
                .fillColor(textColor)
                .font('Helvetica')
                .text(labels.tax, totalsX, totalsY, { width: 150 })
                .text(`$${actualTaxTotal.toFixed(2)}`, totalsX + 150, totalsY, { width: 100, align: 'right' });
              totalsY += 18;
            }

            if (laborCost > 0) {
              doc.fontSize(11)
                .fillColor(textColor)
                .font('Helvetica')
                .text(labels.laborCost, totalsX, totalsY, { width: 150 })
                .text(`$${laborCost.toFixed(2)}`, totalsX + 150, totalsY, { width: 100, align: 'right' });
              totalsY += 18;
            }

            // Total row with theme color - aligned with "TOTAL:" text
            totalsY += 8;
            const calculatedTotal = actualSubtotal + actualTaxTotal + laborCost;
            const actualTotal = total > 0 ? total : calculatedTotal;
            
            // Set font first to calculate text width
            doc.fontSize(16)
              .fillColor(primaryColor)
              .font('Helvetica-Bold');
            
            // Calculate text width for "TOTAL:" to align the value properly
            const totalLabelWidth = doc.widthOfString(labels.total);
            const spacingAfterLabel = 15; // Spacing between label and value
            const totalValueX = totalsX + totalLabelWidth + spacingAfterLabel;
            const totalValueWidth = totalsWidth - totalLabelWidth - spacingAfterLabel;
            
            // Draw "TOTAL:" label
            doc.text(labels.total, totalsX, totalsY, { width: totalLabelWidth });
            // Draw value aligned to the right, starting after the label
            doc.text(`$${actualTotal.toFixed(2)}`, totalValueX, totalsY, { width: totalValueWidth, align: 'right' });

            // Move down after totals to avoid overlap with next section
            doc.y = totalsY + 30;
          } else if (section.id === 'paymentMethod' || section.id === 'contactInfo') {
            // Check if both paymentMethod and contactInfo should be shown side by side
            const paymentMethodSection = sortedSections.find(s => s.id === 'paymentMethod' && s.enabled);
            const contactInfoSection = sortedSections.find(s => s.id === 'contactInfo' && s.enabled);
            const hasPaymentInfo = paymentMethod.bankName || paymentMethod.accountNumber || paymentMethod.paymentMode;
            const hasContactInfo = contactInfo.email || contactInfo.phone || contactInfo.website;
            
            // If both sections exist and enabled, show them side by side (even if only one has data)
            if (paymentMethodSection && contactInfoSection && section.id === 'paymentMethod') {
              // Draw border line above
              const sectionStartY = doc.y;
              doc.moveTo(40, sectionStartY)
                .lineTo(doc.page.width - 40, sectionStartY)
                .strokeColor(borderColor)
                .lineWidth(2)
                .stroke();
              
              doc.y = sectionStartY + 20;
              const startY = doc.y;
              const leftColX = 40;
              const rightColX = doc.page.width / 2 + 30; // Gap between columns
              const colWidth = (doc.page.width - 80) / 2 - 40;
              
              doc.fontSize(9)
                .fillColor(textColor)
                .font('Helvetica');
              
              // Build arrays for both columns
              const leftLines: Array<{label: string, value: string}> = [];
              if (paymentMethod.bankName) leftLines.push({ label: 'Bank', value: paymentMethod.bankName });
              if (paymentMethod.accountNumber) leftLines.push({ label: 'Account', value: paymentMethod.accountNumber });
              if (paymentMethod.paymentMode) leftLines.push({ label: 'Payment Mode', value: paymentMethod.paymentMode });
              
              const rightLines: string[] = [];
              if (contactInfo.email) rightLines.push(contactInfo.email);
              if (contactInfo.phone) rightLines.push(contactInfo.phone);
              if (contactInfo.website) rightLines.push(contactInfo.website);
              
              const maxLines = Math.max(leftLines.length || 0, rightLines.length || 0, 1);
              let currentY = startY;
              
              // Draw left column first (only if has data)
              if (leftLines.length > 0) {
                for (let i = 0; i < leftLines.length; i++) {
                  const item = leftLines[i];
                  doc.font('Helvetica-Bold')
                    .fillColor(secondaryColor)
                    .text(`${item.label}: `, leftColX, currentY, { width: 100 })
                    .font('Helvetica')
                    .fillColor(textColor)
                    .text(item.value, leftColX + 100, currentY, { width: colWidth - 100, ellipsis: true });
                  currentY += 16;
                }
              }
              
              // Draw right column (reset Y and draw aligned right, no labels, only if has data)
              if (rightLines.length > 0) {
                currentY = startY;
                for (let i = 0; i < rightLines.length; i++) {
                  const valueText = rightLines[i];
                  doc.font('Helvetica')
                    .fillColor(textColor)
                    .text(valueText, rightColX, currentY, { width: colWidth, align: 'right', ellipsis: true });
                  currentY += 16;
                }
              }
              
              // Move down by max lines
              doc.x = leftColX;
              doc.y = startY + (maxLines * 16) + 10;
              
              // Skip the next section (contactInfo) since we already processed it
              i++;
            } else if (section.id === 'paymentMethod' && hasPaymentInfo && (!contactInfoSection || !hasContactInfo)) {
              // Show payment method alone
              doc.fontSize(11)
                .fillColor(textColor)
                .font('Helvetica');
              
              if (paymentMethod.bankName) {
                doc.font('Helvetica-Bold')
                  .fillColor(secondaryColor)
                  .text('Bank: ')
                  .font('Helvetica')
                  .fillColor(textColor)
                  .text(paymentMethod.bankName);
                doc.moveDown(0.5);
              }
              if (paymentMethod.accountNumber) {
                doc.font('Helvetica-Bold')
                  .fillColor(secondaryColor)
                  .text('Account: ')
                  .font('Helvetica')
                  .fillColor(textColor)
                  .text(paymentMethod.accountNumber);
                doc.moveDown(0.5);
              }
              if (paymentMethod.paymentMode) {
                doc.font('Helvetica-Bold')
                  .fillColor(secondaryColor)
                  .text('Payment Mode: ')
                  .font('Helvetica')
                  .fillColor(textColor)
                  .text(paymentMethod.paymentMode);
                doc.moveDown(0.5);
              }
              doc.moveDown(1);
            } else if (section.id === 'contactInfo' && hasContactInfo && (!paymentMethodSection || !hasPaymentInfo)) {
              // Show contact info alone (only if paymentMethod wasn't shown with it)
              // Draw border line above
              const sectionStartY = doc.y;
              doc.moveTo(54, sectionStartY)
                .lineTo(doc.page.width - 54, sectionStartY)
                .strokeColor(borderColor)
                .lineWidth(2)
                .stroke();
              
              doc.y = sectionStartY + 20;
              const contactStartY = doc.y;
              const contactRightX = doc.page.width - 40;
              const contactWidth = 200;
              const contactX = contactRightX - contactWidth;
              
              doc.fontSize(9)
                .fillColor(textColor)
                .font('Helvetica');
              
              let contactY = contactStartY;
              if (contactInfo.email) {
                doc.text(contactInfo.email, contactX, contactY, { width: contactWidth, align: 'right', ellipsis: true });
                contactY += 16;
              }
              if (contactInfo.phone) {
                doc.text(contactInfo.phone, contactX, contactY, { width: contactWidth, align: 'right', ellipsis: true });
                contactY += 16;
              }
              if (contactInfo.website) {
                doc.text(contactInfo.website, contactX, contactY, { width: contactWidth, align: 'right', ellipsis: true });
                contactY += 16;
              }
              
              doc.y = contactY + 10;
            }
          }
        }

        // Totals are now shown right after the items table, so we don't need to show them again here

        // Signature section
        if (signature.responsibleName) {
          doc.moveDown(2);
          doc.fontSize(18)
            .fillColor(secondaryColor)
            .font('Helvetica-Bold')
            .text('Signature', { underline: true });
          
          doc.moveDown(0.5);
          doc.fontSize(11)
            .fillColor('#333333')
            .font('Helvetica');
          
          if (signature.responsibleName) {
            doc.text(`Responsible: ${signature.responsibleName}`);
          }
          if (signature.position) {
            doc.text(`Position: ${signature.position}`);
          }
          if (signature.signatureDate) {
            doc.text(`Date: ${new Date(signature.signatureDate).toLocaleDateString()}`);
          }
          if (signature.signatureUrl) {
            const signatureBuffer = await loadImage(signature.signatureUrl);
            if (signatureBuffer) {
              try {
                doc.image(signatureBuffer, 40, doc.y + 10, {
                  width: 150,
                  height: 60,
                  fit: [150, 60],
                });
                doc.y += 80;
              } catch (error) {
                this.logger.warn('Failed to add signature to PDF:', error);
              }
            }
          }
        }

        // Notes
        if (estimate.notes) {
          doc.moveDown(2);
          doc.fontSize(18)
            .fillColor(secondaryColor)
            .font('Helvetica-Bold')
            .text('Notes', { underline: true });
          
          doc.moveDown(0.5);
          doc.fontSize(11)
            .fillColor('#333333')
            .font('Helvetica')
            .text(estimate.notes);
        }

        // No footer needed - removed as per user request

        doc.end();
      } catch (error) {
        this.logger.error('Error generating PDF:', error);
        if (error instanceof Error) {
          reject(new Error(`Failed to generate PDF: ${error.message}`));
        } else {
          reject(error);
        }
      }
    });
  }

  async generateEstimateDocx(estimate: any): Promise<Buffer> {
    try {
      const project = estimate.project || {};
      const items = estimate.items || [];
      const subtotal = parseFloat(estimate.subtotal) || 0;
      const taxTotal = parseFloat(estimate.taxTotal) || 0;
      const total = parseFloat(estimate.total) || 0;
      const profitMarginPercent = parseFloat(estimate.profitMarginPercent) || 0;
      const laborCost = parseFloat(estimate.laborCost) || 0;

      // Get templateData from project metadata
      const templateData = project.metadata?.templateData || {};
      const theme = templateData.theme || 'company';
      const header = templateData.header || {};
      const jobSummary = templateData.jobSummary || {};
      const projectInfo = templateData.projectInfo || {};
      const paymentMethod = templateData.paymentMethod || {};
      const contactInfo = templateData.contactInfo || {};
      const signature = templateData.signature || {};
      const sections = templateData.sections || [];

      // Get theme colors
      const themeColors = this.getThemeColors(theme);
      const primaryColor = themeColors.primary;
      const secondaryColor = themeColors.secondary;
      const textColor = themeColors.text;

      // Helper to convert hex to DOCX color format (RRGGBB without #)
      const hexToDocxColor = (hex: string): string => {
        return hex.replace('#', '').toUpperCase();
      };

      const primaryDocxColor = hexToDocxColor(primaryColor);
      const secondaryDocxColor = hexToDocxColor(secondaryColor);
      const textDocxColor = hexToDocxColor(textColor);

      const children: any[] = [];

      // Helper to load image from URL (base64 or http)
      const loadImage = async (url: string): Promise<Buffer | null> => {
        try {
          if (url.startsWith('data:')) {
            // Base64 image
            const base64Data = url.split(',')[1];
            return Buffer.from(base64Data, 'base64');
          } else if (url.startsWith('http')) {
            // HTTP URL
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
          }
          return null;
        } catch (error) {
          this.logger.warn(`Failed to load image from ${url}:`, error);
          return null;
        }
      };

      // Header section
      const headerChildren: any[] = [];
      
      // Logo and company name row
      if (header.logoUrl) {
        const logoBuffer = await loadImage(header.logoUrl);
        if (logoBuffer) {
          headerChildren.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: {
                    width: 100,
                    height: 100,
                  },
                  type: 'png',
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          );
        }
      }

      if (header.companyName) {
        headerChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: header.companyName,
                bold: true,
                size: 36,
                color: secondaryDocxColor,
              }),
            ],
          }),
        );
      }

      if (header.companyTagline) {
        headerChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: header.companyTagline,
                size: 22,
                color: textDocxColor,
              }),
            ],
          }),
        );
      }

      // Estimate details in header
      const estimateDetails: string[] = [];
      if (header.estimateNumber) {
        estimateDetails.push(`Estimate #: ${header.estimateNumber}`);
      }
      if (header.date) {
        estimateDetails.push(`Date: ${new Date(header.date).toLocaleDateString()}`);
      }
      if (header.workDuration) {
        estimateDetails.push(`Duration: ${header.workDuration}`);
      }

      if (estimateDetails.length > 0) {
        headerChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: estimateDetails.join(' | '),
                size: 20,
                color: textDocxColor,
              }),
            ],
          }),
        );
      }

      headerChildren.push(new Paragraph({ text: '' })); // Empty line
      children.push(...headerChildren);

      // Sort sections by order
      const sortedSections = [...sections]
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order);

      // Calculate subtotal from items
      const calculatedSubtotal = items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.subtotal || 0));
      }, 0);
      const actualSubtotal = subtotal > 0 ? subtotal : calculatedSubtotal;
      
      // Recalculate taxTotal if taxEnabled is true but taxTotal is 0
      const templateTaxEnabled = templateData.taxEnabled || false;
      let actualTaxTotal = taxTotal;
      if (templateTaxEnabled && actualTaxTotal === 0 && actualSubtotal > 0) {
        // Calculate tax from taxRatePercent if available
        const taxRatePercent = templateData.taxRatePercent || templateData.profitMarginPercent || 0;
        if (taxRatePercent > 0) {
          actualTaxTotal = (actualSubtotal * taxRatePercent) / 100;
        }
      }

      // Process sections in order
      for (let i = 0; i < sortedSections.length; i++) {
        const section = sortedSections[i];
        
        if (section.id === 'jobSummary') {
          // Use projectName as fallback if jobTitle is empty
          const jobTitle = jobSummary.jobTitle || project.name || '';
          const hasContent = jobTitle || jobSummary.jobDescription;
          
          if (hasContent) {
            if (jobTitle) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: jobTitle,
                      bold: true,
                      size: 36,
                      color: secondaryDocxColor,
                    }),
                  ],
                }),
              );
            }
            if (jobSummary.jobDescription) {
              children.push(new Paragraph({
                children: [
                  new TextRun({
                    text: jobSummary.jobDescription,
                    size: 22,
                    color: textDocxColor,
                  }),
                ],
              }));
            }
            children.push(new Paragraph({ text: '' }));
          }
        } else if (section.id === 'projectInfo') {
          // Check if projectInfo has any fields
          const hasProjectInfo = projectInfo.clientName || projectInfo.projectAddress || 
                                projectInfo.city || projectInfo.state || projectInfo.country ||
                                projectInfo.estimateDate || projectInfo.workDuration;
          
          if (hasProjectInfo) {
            if (projectInfo.clientName) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Client: ', bold: true, color: secondaryDocxColor }),
                    new TextRun({ text: projectInfo.clientName, color: textDocxColor }),
                  ],
                }),
              );
            }
            if (projectInfo.projectAddress) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Address: ', bold: true, color: secondaryDocxColor }),
                    new TextRun({ text: projectInfo.projectAddress, color: textDocxColor }),
                  ],
                }),
              );
            }
            if (projectInfo.city || projectInfo.state || projectInfo.country) {
              const location = [projectInfo.city, projectInfo.state, projectInfo.country]
                .filter(Boolean)
                .join(', ');
              if (location) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Location: ', bold: true, color: secondaryDocxColor }),
                      new TextRun({ text: location, color: textDocxColor }),
                    ],
                  }),
                );
              }
            }
            if (projectInfo.estimateDate) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Estimate Date: ', bold: true, color: secondaryDocxColor }),
                    new TextRun({ text: new Date(projectInfo.estimateDate).toLocaleDateString(), color: textDocxColor }),
                  ],
                }),
              );
            }
            if (projectInfo.workDuration) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Work Duration: ', bold: true, color: secondaryDocxColor }),
                    new TextRun({ text: projectInfo.workDuration, color: textDocxColor }),
                  ],
                }),
              );
            }
            children.push(new Paragraph({ text: '' }));
          }
        } else if (section.id === 'itemsTable') {
          // Items Table - no title

          const tableRows = [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'Description',
                          bold: true,
                          color: 'FFFFFF',
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill: primaryDocxColor,
                    type: 'solid',
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'Quantity',
                          bold: true,
                          color: 'FFFFFF',
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill: primaryDocxColor,
                    type: 'solid',
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'Unit',
                          bold: true,
                          color: 'FFFFFF',
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill: primaryDocxColor,
                    type: 'solid',
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'Unit Price',
                          bold: true,
                          color: 'FFFFFF',
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill: primaryDocxColor,
                    type: 'solid',
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: 'Subtotal',
                          bold: true,
                          color: 'FFFFFF',
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill: primaryDocxColor,
                    type: 'solid',
                  },
                }),
              ],
            }),
            ...items.map((item: any) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(item.description || 'N/A')] }),
                  new TableCell({ children: [new Paragraph(String(item.quantity || 0))] }),
                  new TableCell({ children: [new Paragraph(item.unit?.name || item.unit?.symbol || 'N/A')] }),
                  new TableCell({ children: [new Paragraph(`$${parseFloat(item.unitCost || 0).toFixed(2)}`)] }),
                  new TableCell({ children: [new Paragraph(`$${parseFloat(item.subtotal || 0).toFixed(2)}`)] }),
                ],
              }),
            ),
          ];

          children.push(
            new Table({
              rows: tableRows,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
          );

          // Totals section right after table
          children.push(new Paragraph({ text: '' }));
          
          // Subtotal
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Subtotal: ', bold: true, color: textDocxColor }),
                new TextRun({ text: `$${actualSubtotal.toFixed(2)}`, color: textDocxColor }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          );

          if (templateTaxEnabled && actualTaxTotal > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Tax: ', bold: true, color: textDocxColor }),
                  new TextRun({ text: `$${actualTaxTotal.toFixed(2)}`, color: textDocxColor }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            );
          }

          if (laborCost > 0) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: 'Labor Cost: ', bold: true, color: textDocxColor }),
                  new TextRun({ text: `$${laborCost.toFixed(2)}`, color: textDocxColor }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            );
          }

          if (profitMarginPercent > 0) {
            const profitMargin = ((actualSubtotal + actualTaxTotal + laborCost) * profitMarginPercent) / 100;
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `Profit Margin (${profitMarginPercent}%): `, bold: true, color: textDocxColor }),
                  new TextRun({ text: `$${profitMargin.toFixed(2)}`, color: textDocxColor }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            );
          }

          // Total
          const calculatedTotal = actualSubtotal + actualTaxTotal + laborCost + 
            (profitMarginPercent > 0 ? ((actualSubtotal + actualTaxTotal + laborCost) * profitMarginPercent) / 100 : 0);
          const actualTotal = total > 0 ? total : calculatedTotal;
          
          children.push(
            new Paragraph({
              children: [
                new TextRun({ 
                  text: 'TOTAL: ', 
                  bold: true, 
                  size: 32,
                  color: primaryDocxColor,
                }),
                new TextRun({ 
                  text: `$${actualTotal.toFixed(2)}`, 
                  bold: true,
                  size: 32,
                  color: primaryDocxColor,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          );
          
          children.push(new Paragraph({ text: '' }));
        } else if (section.id === 'paymentMethod' || section.id === 'contactInfo') {
          // Check if both paymentMethod and contactInfo should be shown side by side
          const paymentMethodSection = sortedSections.find(s => s.id === 'paymentMethod' && s.enabled);
          const contactInfoSection = sortedSections.find(s => s.id === 'contactInfo' && s.enabled);
          const hasPaymentInfo = paymentMethod.bankName || paymentMethod.accountNumber || paymentMethod.paymentMode;
          const hasContactInfo = contactInfo.email || contactInfo.phone || contactInfo.website;
          
          // If both sections exist and enabled, show them side by side (even if only one has data)
          if (paymentMethodSection && contactInfoSection && section.id === 'paymentMethod') {
            // Create a two-column table with one row per field to avoid overlapping
            const twoColumnRows: TableRow[] = [];
            
            // Get max number of fields to create enough rows
            const paymentFields = [
              paymentMethod.bankName ? 'Bank: ' + paymentMethod.bankName : null,
              paymentMethod.accountNumber ? 'Account: ' + paymentMethod.accountNumber : null,
              paymentMethod.paymentMode ? 'Payment Mode: ' + paymentMethod.paymentMode : null,
            ].filter(Boolean);
            
            const contactFields = [
              contactInfo.email ? 'Email: ' + contactInfo.email : null,
              contactInfo.phone ? 'Phone: ' + contactInfo.phone : null,
              contactInfo.website ? 'Website: ' + contactInfo.website : null,
            ].filter(Boolean);
            
            const maxRows = Math.max(paymentFields.length, contactFields.length);
            
            for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
              const leftCellContent = rowIdx < paymentFields.length 
                ? new Paragraph({
                    children: [
                      new TextRun({ 
                        text: paymentFields[rowIdx]!.split(': ')[0] + ': ', 
                        bold: true, 
                        color: secondaryDocxColor 
                      }),
                      new TextRun({ 
                        text: paymentFields[rowIdx]!.split(': ').slice(1).join(': '), 
                        color: textDocxColor 
                      }),
                    ],
                  })
                : new Paragraph({ text: '' });
              
              const rightCellContent = rowIdx < contactFields.length
                ? new Paragraph({
                    children: [
                      new TextRun({ 
                        text: contactFields[rowIdx]!.split(': ')[0] + ': ', 
                        bold: true, 
                        color: secondaryDocxColor 
                      }),
                      new TextRun({ 
                        text: contactFields[rowIdx]!.split(': ').slice(1).join(': '), 
                        color: textDocxColor 
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  })
                : new Paragraph({ text: '' });
              
              twoColumnRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [leftCellContent],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                      children: [rightCellContent],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                  ],
                }),
              );
            }
            
            children.push(
              new Table({
                rows: twoColumnRows,
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
              }),
            );
            
            children.push(new Paragraph({ text: '' }));
            
            // Skip the next section (contactInfo) since we already processed it
            i++;
          } else if (section.id === 'paymentMethod' && hasPaymentInfo) {
            // Show payment method alone - no title
            if (paymentMethod.bankName) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Bank: ', bold: true, color: secondaryDocxColor }),
                    new TextRun({ text: paymentMethod.bankName, color: textDocxColor }),
                  ],
                }),
              );
            }
            if (paymentMethod.accountNumber) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Account: ', bold: true, color: secondaryDocxColor }),
                    new TextRun({ text: paymentMethod.accountNumber, color: textDocxColor }),
                  ],
                }),
              );
            }
            if (paymentMethod.paymentMode) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Payment Mode: ', bold: true, color: secondaryDocxColor }),
                    new TextRun({ text: paymentMethod.paymentMode, color: textDocxColor }),
                  ],
                }),
              );
            }
            children.push(new Paragraph({ text: '' }));
          } else if (section.id === 'contactInfo' && hasContactInfo) {
            // Show contact info alone (only if paymentMethod wasn't shown with it) - no title
            const paymentMethodSection = sortedSections.find(s => s.id === 'paymentMethod' && s.enabled);
            const hasPaymentInfo = paymentMethod.bankName || paymentMethod.accountNumber || paymentMethod.paymentMode;
            
            if (!paymentMethodSection || !hasPaymentInfo) {
              if (contactInfo.email) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Email: ', bold: true, color: secondaryDocxColor }),
                      new TextRun({ text: contactInfo.email, color: textDocxColor }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                );
              }
              if (contactInfo.phone) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Phone: ', bold: true, color: secondaryDocxColor }),
                      new TextRun({ text: contactInfo.phone, color: textDocxColor }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                );
              }
              if (contactInfo.website) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Website: ', bold: true, color: secondaryDocxColor }),
                      new TextRun({ text: contactInfo.website, color: textDocxColor }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                );
              }
              children.push(new Paragraph({ text: '' }));
            }
          }
        }
      }

      // Signature section
      if (signature.responsibleName) {
        children.push(
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Signature',
            heading: HeadingLevel.HEADING_2,
          }),
        );
        if (signature.responsibleName) {
          children.push(new Paragraph(`Responsible: ${signature.responsibleName}`));
        }
        if (signature.position) {
          children.push(new Paragraph(`Position: ${signature.position}`));
        }
        if (signature.signatureDate) {
          children.push(new Paragraph(`Date: ${new Date(signature.signatureDate).toLocaleDateString()}`));
        }
        if (signature.signatureUrl) {
          const signatureBuffer = await loadImage(signature.signatureUrl);
          if (signatureBuffer) {
            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: signatureBuffer,
                    transformation: {
                      width: 150,
                      height: 60,
                    },
                    type: 'png',
                  }),
                ],
              }),
            );
          }
        }
      }

      if (estimate.notes) {
        children.push(
          new Paragraph({ text: '' }),
          new Paragraph({
            text: 'Notes',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph(estimate.notes),
        );
      }

      // Create document
      const doc = new Document({
        sections: [
          {
            children,
          },
        ],
      });

      // Generate buffer
      const buffer = await Packer.toBuffer(doc);
      return buffer;
    } catch (error) {
      this.logger.error('Error generating DOCX:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate DOCX: ${error.message}`);
      }
      throw error;
    }
  }

  private getThemeColors(theme: string) {
    const themes: Record<string, { primary: string; secondary: string; text: string; border: string }> = {
      black: { primary: '#000000', secondary: '#1F2937', text: '#111827', border: '#E5E7EB' },
      company: { primary: '#F15A24', secondary: '#8A3B12', text: '#8A3B12', border: '#F4C197' },
      orange: { primary: '#F15A24', secondary: '#FF8C42', text: '#8A3B12', border: '#F4C197' },
      green: { primary: '#22C55E', secondary: '#16A34A', text: '#166534', border: '#86EFAC' },
      blue: { primary: '#3B82F6', secondary: '#2563EB', text: '#1E40AF', border: '#93C5FD' },
      red: { primary: '#EF4444', secondary: '#DC2626', text: '#991B1B', border: '#FCA5A5' },
    };
    return themes[theme] || themes.company;
  }

}

