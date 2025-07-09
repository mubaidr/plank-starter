import { LocalStorageAdapter } from './storage/localStorage';
import { IndexedDBAdapter } from './storage/indexedDB';
import { PDFExporter } from './export/pdfExporter';
import { ImageExporter } from './export/imageExporter';
import { SVGExporter } from './export/svgExporter';
import { ProjectData, ProjectDataSchema } from '../types';

// File operations interface
export interface FileOperationsAPI {
  saveProject(data: ProjectData, storageType: 'local' | 'indexedDB'): Promise<void>;
  loadProject(storageKey: string): Promise<ProjectData>;
  listSavedProjects(): Promise<Array<{key: string, name: string, date: Date}>>;
  exportPDF(options: PDFExportOptions): Promise<Blob>;
  exportImage(options: ImageExportOptions): Promise<Blob>;
  exportSVG(options: SVGExportOptions): Promise<Blob>;
  enableAutoSave(interval: number): void;
  disableAutoSave(): void;
  getAutoSaveVersions(): Array<AutoSaveVersion>;
  restoreVersion(versionId: string): Promise<ProjectData>;
  importProject(file: File): Promise<ProjectData>;
  importBackgroundImage(file: File): Promise<string>;
}

// PDF export options
export interface PDFExportOptions {
  paperSize: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  includeGrid: boolean;
  includeDimensions: boolean;
}

// Image export options
export interface ImageExportOptions {
  format: 'png' | 'jpg';
  resolution: number; // DPI
  backgroundColor: string;
}

// SVG export options
export interface SVGExportOptions {
  precision: number;
  embedFonts: boolean;
}

// Auto-save version
export interface AutoSaveVersion {
  id: string;
  timestamp: Date;
  preview: string; // Base64 thumbnail
}

// File operations implementation
export class FileOperations implements FileOperationsAPI {
  private static instance: FileOperations;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private autoSaveInterval: number = 5; // minutes
  private maxAutoSaveVersions: number = 10;

  private localStorageAdapter = new LocalStorageAdapter();
  private indexedDBAdapter = new IndexedDBAdapter('floorPlannerDB', 1);

  private constructor() {}

  static getInstance(): FileOperations {
    if (!FileOperations.instance) {
      FileOperations.instance = new FileOperations();
    }
    return FileOperations.instance;
  }

  // Save project to storage
  async saveProject(data: ProjectData, storageType: 'local' | 'indexedDB' = 'local'): Promise<void> {
    const key = `project-${Date.now()}`;
    if (storageType === 'local') {
      await this.localStorageAdapter.save(key, data);
    } else {
      await this.indexedDBAdapter.save(key, data);
    }
  }

  // Load project from storage
  async loadProject(storageKey: string): Promise<ProjectData> {
    if (storageKey.startsWith('local:')) {
      return this.localStorageAdapter.load(storageKey.replace('local:', ''));
    } else if (storageKey.startsWith('indexedDB:')) {
      return this.indexedDBAdapter.load(storageKey.replace('indexedDB:', ''));
    }
    throw new Error('Invalid storage key format');
  }

  // List saved projects
  async listSavedProjects(): Promise<Array<{key: string, name: string, date: Date}>> {
    const localProjects = await this.localStorageAdapter.list();
    const dbProjects = await this.indexedDBAdapter.list();

    return [
      ...localProjects.map(p => ({ ...p, key: `local:${p.key}` })),
      ...dbProjects.map(p => ({ ...p, key: `indexedDB:${p.key}` }))
    ];
  }

  // Export to PDF
  async exportPDF(options: PDFExportOptions): Promise<Blob> {
    return PDFExporter.export(options);
  }

  // Export to image
  async exportImage(options: ImageExportOptions): Promise<Blob> {
    return ImageExporter.export(options);
  }

  // Export to SVG
  async exportSVG(options: SVGExportOptions): Promise<Blob> {
    return SVGExporter.export(options);
  }

  // Enable auto-save
  enableAutoSave(interval: number = 5): void {
    this.autoSaveInterval = interval;
    this.autoSaveTimer = setInterval(() => {
      this.performAutoSave();
    }, this.autoSaveInterval * 60 * 1000);
  }

  // Disable auto-save
  disableAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  // Get auto-save versions
  getAutoSaveVersions(): AutoSaveVersion[] {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave-'));
    return keys.map(key => ({
      id: key,
      timestamp: new Date(key.replace('autosave-', '')),
      preview: '' // Placeholder - would generate thumbnail in real implementation
    }));
  }

  // Restore auto-save version
  async restoreVersion(versionId: string): Promise<ProjectData> {
    const data = localStorage.getItem(versionId);
    if (!data) throw new Error('Version not found');
    return JSON.parse(data);
  }

  // Import project file
  async importProject(file: File): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const { error } = ProjectDataSchema.validate(data);
          if (error) {
            reject(new Error(`Invalid project file: ${error.message}`));
          } else {
            resolve(data);
          }
        } catch (err) {
          reject(new Error('Failed to parse project file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
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

  // Internal auto-save implementation
  private async performAutoSave(): Promise<void> {
    try {
      const projectData = {} as ProjectData; // Would get from state in real implementation
      const timestamp = new Date().toISOString();
      const autoSaveKey = `autosave-${timestamp}`;
      localStorage.setItem(autoSaveKey, JSON.stringify(projectData));
      this.cleanupOldAutoSaves();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  // Clean up old auto-saves
  private cleanupOldAutoSaves(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('autosave-'));
    if (keys.length > this.maxAutoSaveVersions) {
      keys.sort()
        .slice(0, keys.length - this.maxAutoSaveVersions)
        .forEach(key => localStorage.removeItem(key));
    }
  }
}
