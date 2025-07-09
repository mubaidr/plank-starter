export class ImageExporter {
  static async export(
    canvasElement: HTMLCanvasElement,
    options: ImageExportOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new canvas with the desired resolution
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Calculate dimensions based on DPI
        const scaleFactor = options.resolution / 96; // 96 DPI is default
        exportCanvas.width = canvasElement.width * scaleFactor;
        exportCanvas.height = canvasElement.height * scaleFactor;

        // Set background color if specified
        if (options.backgroundColor && options.backgroundColor !== 'transparent') {
          ctx.fillStyle = options.backgroundColor;
          ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        // Scale and draw the original canvas
        ctx.scale(scaleFactor, scaleFactor);
        ctx.drawImage(canvasElement, 0, 0);

        // Convert to blob
        exportCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create image blob'));
            }
          },
          options.format === 'jpg' ? 'image/jpeg' : 'image/png',
          options.format === 'jpg' ? 0.9 : undefined
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}

export interface ImageExportOptions {
  format: 'png' | 'jpg';
  resolution: number; // DPI
  backgroundColor: string;
}