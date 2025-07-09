import jsPDF from 'jspdf';
import { ProjectData } from '../../types';

export class PDFExporter {
  static async export(
    canvasElement: HTMLCanvasElement,
    options: PDFExportOptions
  ): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize.toLowerCase()
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvasAspectRatio = canvasElement.width / canvasElement.height;
    const pageAspectRatio = pageWidth / pageHeight;

    let drawWidth, drawHeight;
    if (canvasAspectRatio > pageAspectRatio) {
      drawWidth = pageWidth;
      drawHeight = pageWidth / canvasAspectRatio;
    } else {
      drawHeight = pageHeight;
      drawWidth = pageHeight * canvasAspectRatio;
    }

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    const canvasDataUrl = canvasElement.toDataURL('image/png');
    pdf.addImage(canvasDataUrl, 'PNG', x, y, drawWidth, drawHeight);

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }
}

interface PDFExportOptions {
  paperSize: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  includeGrid: boolean;
  includeDimensions: boolean;
}
