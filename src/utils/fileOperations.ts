import jsPDF from 'jspdf';

// Project data interface
export interface ProjectData {
  version: string;
  metadata: {
    name: string;
    description: string;
    author: string;
    created: string;
    modified: string;
    scale: number;
    units: string;
  };
  objects: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    [key: string]: any;
  }>;
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    color: string;
  }>;
  measurements: Array<{
    id: string;
    type: 'linear' | 'angular' | 'area' | 'radius';
    startPoint: { x: number; y: number };
    endPoint?: { x: number; y: number };
    centerPoint?: { x: number; y: number };
    points?: Array<{ x: number; y: number }>;
    value: number;
    label: string;
    units: string;
    style: Record<string, any>;
  }>;
  settings: {
    gridSize: number;
    gridVisible: boolean;
    snapToGrid: boolean;
    snapToObjects: boolean;
    backgroundImage?: {
      src: string;
      opacity: number;
      scale: number;
      position: { x: number; y: number };
    };
  };
}

// Export formats
export type ExportFormat = 'json' | 'pdf' | 'png' | 'jpg' | 'svg';

// PDF export options
export interface PDFExportOptions {
  paperSize: 'A4' | 'A3' | 'A2' | 'A1' | 'Letter' | 'Legal' | 'Tabloid';
  orientation: 'portrait' | 'landscape';
  scale: 'fit' | 'custom';
  customScale?: number;
  includeGrid: boolean;
  includeMeasurements: boolean;
  includeLayers: string[];
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  titleBlock: {
    show: boolean;
    title: string;
    subtitle: string;
    author: string;
    date: string;
    scale: string;
  };
}

// Image export options
export interface ImageExportOptions {
  format: 'png' | 'jpg';
  width: number;
  height: number;
  quality: number; // 0-1 for JPG
  backgroundColor: string;
  includeGrid: boolean;
  includeMeasurements: boolean;
  includeLayers: string[];
  dpi: number;
}

// SVG export options
export interface SVGExportOptions {
  width: number;
  height: number;
  includeGrid: boolean;
  includeMeasurements: boolean;
  includeLayers: string[];
  embedFonts: boolean;
  precision: number;
}

// Auto-save configuration
export interface AutoSaveConfig {
  enabled: boolean;
  interval: number; // minutes
  maxVersions: number;
  storageType: 'localStorage' | 'indexedDB';
}

// File operations class
export class FileOperations {
  private static instance: FileOperations;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private autoSaveConfig: AutoSaveConfig = {
    enabled: true,
    interval: 5,
    maxVersions: 10,
    storageType: 'localStorage'
  };

  static getInstance(): FileOperations {
    if (!FileOperations.instance) {
      FileOperations.instance = new FileOperations();
    }
    return FileOperations.instance;
  }

  // Save project to JSON
  saveProject(data: ProjectData, filename?: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `floor-plan-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Load project from JSON file
  async loadProject(file: File): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Validate project data structure
          if (this.validateProjectData(data)) {
            resolve(data);
          } else {
            reject(new Error('Invalid project file format'));
          }
        } catch (error) {
          reject(new Error('Failed to parse project file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Export to PDF
  async exportToPDF(
    canvasElement: HTMLCanvasElement,
    data: ProjectData,
    options: PDFExportOptions
  ): Promise<void> {
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.paperSize.toLowerCase()
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - options.margins.left - options.margins.right;
    const contentHeight = pageHeight - options.margins.top - options.margins.bottom;

    // Add title block if enabled
    if (options.titleBlock.show) {
      this.addTitleBlock(pdf, options.titleBlock, pageWidth, pageHeight);
    }

    // Calculate canvas scaling
    const canvasAspectRatio = canvasElement.width / canvasElement.height;
    const contentAspectRatio = contentWidth / contentHeight;
    
    let drawWidth, drawHeight;
    if (canvasAspectRatio > contentAspectRatio) {
      drawWidth = contentWidth;
      drawHeight = contentWidth / canvasAspectRatio;
    } else {
      drawHeight = contentHeight;
      drawWidth = contentHeight * canvasAspectRatio;
    }

    // Add canvas image
    const canvasDataUrl = canvasElement.toDataURL('image/png');
    const x = options.margins.left + (contentWidth - drawWidth) / 2;
    const y = options.margins.top + (contentHeight - drawHeight) / 2;
    
    pdf.addImage(canvasDataUrl, 'PNG', x, y, drawWidth, drawHeight);

    // Save PDF
    pdf.save(`floor-plan-${Date.now()}.pdf`);
  }

  // Export to high-resolution image
  async exportToImage(
    canvasElement: HTMLCanvasElement,
    options: ImageExportOptions
  ): Promise<void> {
    // Create high-resolution canvas
    const highResCanvas = document.createElement('canvas');
    const ctx = highResCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Set high-resolution dimensions
    const scaleFactor = options.dpi / 96; // 96 DPI is standard screen resolution
    highResCanvas.width = options.width * scaleFactor;
    highResCanvas.height = options.height * scaleFactor;

    // Scale context for high DPI
    ctx.scale(scaleFactor, scaleFactor);

    // Set background
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, options.width, options.height);

    // Draw original canvas scaled to fit
    const aspectRatio = canvasElement.width / canvasElement.height;
    const targetAspectRatio = options.width / options.height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (aspectRatio > targetAspectRatio) {
      drawWidth = options.width;
      drawHeight = options.width / aspectRatio;
      offsetY = (options.height - drawHeight) / 2;
    } else {
      drawHeight = options.height;
      drawWidth = options.height * aspectRatio;
      offsetX = (options.width - drawWidth) / 2;
    }

    ctx.drawImage(canvasElement, offsetX, offsetY, drawWidth, drawHeight);

    // Convert to blob and download
    highResCanvas.toBlob((blob) => {
      if (!blob) throw new Error('Failed to create image blob');
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `floor-plan-${Date.now()}.${options.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, `image/${options.format}`, options.format === 'jpg' ? options.quality : undefined);
  }

  // Export to SVG
  async exportToSVG(
    data: ProjectData,
    options: SVGExportOptions
  ): Promise<void> {
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${options.width}" height="${options.height}" 
     viewBox="0 0 ${options.width} ${options.height}"
     xmlns="http://www.w3.org/2000/svg">
`;

    // Add styles
    svg += `<defs>
  <style>
    .dimension-text { font-family: Arial, sans-serif; font-size: 12px; }
    .grid-line { stroke: #e5e5e5; stroke-width: 0.5; }
  </style>
</defs>
`;

    // Add grid if enabled
    if (options.includeGrid) {
      svg += this.generateSVGGrid(data.settings.gridSize, options.width, options.height);
    }

    // Add objects
    for (const obj of data.objects) {
      if (options.includeLayers.includes(obj.layerId || 'default')) {
        svg += this.objectToSVG(obj, options.precision);
      }
    }

    // Add measurements if enabled
    if (options.includeMeasurements) {
      for (const measurement of data.measurements) {
        svg += this.measurementToSVG(measurement, options.precision);
      }
    }

    svg += '</svg>';

    // Download SVG
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floor-plan-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Auto-save functionality
  startAutoSave(getData: () => ProjectData): void {
    if (!this.autoSaveConfig.enabled) return;

    this.stopAutoSave();
    this.autoSaveTimer = setInterval(() => {
      this.performAutoSave(getData());
    }, this.autoSaveConfig.interval * 60 * 1000);
  }

  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private performAutoSave(data: ProjectData): void {
    const timestamp = new Date().toISOString();
    const autoSaveKey = `autosave-${timestamp}`;
    
    try {
      if (this.autoSaveConfig.storageType === 'localStorage') {
        localStorage.setItem(autoSaveKey, JSON.stringify(data));
        this.cleanupOldAutoSaves();
      }
      console.log('Auto-save completed:', timestamp);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  private cleanupOldAutoSaves(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave-'));
    if (keys.length > this.autoSaveConfig.maxVersions) {
      keys.sort().slice(0, keys.length - this.autoSaveConfig.maxVersions).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }

  getAutoSaveVersions(): Array<{ key: string; timestamp: string; data: ProjectData }> {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave-'));
    return keys.sort().reverse().map(key => ({
      key,
      timestamp: key.replace('autosave-', ''),
      data: JSON.parse(localStorage.getItem(key) || '{}')
    }));
  }

  // Import background image
  async importBackgroundImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  // Helper methods
  private validateProjectData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.version &&
      data.metadata &&
      Array.isArray(data.objects) &&
      Array.isArray(data.layers) &&
      Array.isArray(data.measurements) &&
      data.settings
    );
  }

  private addTitleBlock(
    pdf: jsPDF,
    titleBlock: PDFExportOptions['titleBlock'],
    pageWidth: number,
    pageHeight: number
  ): void {
    const blockHeight = 30;
    const blockY = pageHeight - blockHeight - 10;
    
    // Draw title block border
    pdf.rect(10, blockY, pageWidth - 20, blockHeight);
    
    // Add title block content
    pdf.setFontSize(16);
    pdf.text(titleBlock.title, 15, blockY + 8);
    
    pdf.setFontSize(12);
    pdf.text(titleBlock.subtitle, 15, blockY + 16);
    
    pdf.setFontSize(10);
    pdf.text(`Author: ${titleBlock.author}`, 15, blockY + 24);
    pdf.text(`Date: ${titleBlock.date}`, pageWidth / 2, blockY + 24);
    pdf.text(`Scale: ${titleBlock.scale}`, pageWidth - 50, blockY + 24);
  }

  private generateSVGGrid(gridSize: number, width: number, height: number): string {
    let grid = '<g class="grid">\n';
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      grid += `  <line x1="${x}" y1="0" x2="${x}" y2="${height}" class="grid-line"/>\n`;
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      grid += `  <line x1="0" y1="${y}" x2="${width}" y2="${y}" class="grid-line"/>\n`;
    }
    
    grid += '</g>\n';
    return grid;
  }

  private objectToSVG(obj: any, precision: number): string {
    const x = Number(obj.x.toFixed(precision));
    const y = Number(obj.y.toFixed(precision));
    
    switch (obj.type) {
      case 'rectangle':
        return `<rect x="${x}" y="${y}" width="${obj.width}" height="${obj.height}" 
                fill="${obj.fill}" stroke="${obj.stroke}" stroke-width="${obj.strokeWidth}"/>\n`;
      
      case 'circle':
        return `<circle cx="${x}" cy="${y}" r="${obj.radius}" 
                fill="${obj.fill}" stroke="${obj.stroke}" stroke-width="${obj.strokeWidth}"/>\n`;
      
      case 'line':
      case 'wall':
        const points = obj.points || [0, 0, 0, 0];
        return `<line x1="${x + points[0]}" y1="${y + points[1]}" 
                x2="${x + points[2]}" y2="${y + points[3]}" 
                stroke="${obj.stroke}" stroke-width="${obj.strokeWidth}"/>\n`;
      
      default:
        return '';
    }
  }

  private measurementToSVG(measurement: any, precision: number): string {
    // Simplified measurement rendering for SVG
    if (measurement.type === 'linear' && measurement.startPoint && measurement.endPoint) {
      const x1 = Number(measurement.startPoint.x.toFixed(precision));
      const y1 = Number(measurement.startPoint.y.toFixed(precision));
      const x2 = Number(measurement.endPoint.x.toFixed(precision));
      const y2 = Number(measurement.endPoint.y.toFixed(precision));
      
      return `<g class="measurement">
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
              stroke="${measurement.style.color}" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 5}" class="dimension-text" 
              fill="${measurement.style.color}">${measurement.label}</text>
      </g>\n`;
    }
    return '';
  }

  // Configuration methods
  setAutoSaveConfig(config: Partial<AutoSaveConfig>): void {
    this.autoSaveConfig = { ...this.autoSaveConfig, ...config };
  }

  getAutoSaveConfig(): AutoSaveConfig {
    return { ...this.autoSaveConfig };
  }
}