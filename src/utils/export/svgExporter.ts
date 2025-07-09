export class SVGExporter {
  static async export(
    canvasElement: HTMLCanvasElement,
    options: SVGExportOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', canvasElement.width.toString());
        svg.setAttribute('height', canvasElement.height.toString());
        svg.setAttribute('viewBox', `0 0 ${canvasElement.width} ${canvasElement.height}`);

        // Convert canvas to data URL and embed as image
        const dataUrl = canvasElement.toDataURL('image/png');
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('href', dataUrl);
        image.setAttribute('width', canvasElement.width.toString());
        image.setAttribute('height', canvasElement.height.toString());
        
        svg.appendChild(image);

        // Convert SVG to string
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svg);

        // Add XML declaration and DOCTYPE if needed
        svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

        // Create blob
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export interface SVGExportOptions {
  precision: number;
  embedFonts: boolean;
}