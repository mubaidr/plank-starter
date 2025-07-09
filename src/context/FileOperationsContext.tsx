import React, { createContext, useContext, useCallback, useEffect, useRef, ReactNode } from 'react';
import { FileOperations, FileOperationsAPI, PDFExportOptions, ImageExportOptions, SVGExportOptions } from '@/utils/fileOperations';
import { useFloorPlanContext } from './FloorPlanContext';
import { ProjectData } from '@/types';

interface FileOperationsContextType extends FileOperationsAPI {
  isAutoSaveEnabled: boolean;
  autoSaveInterval: number;
}

const FileOperationsContext = createContext<FileOperationsContextType | undefined>(undefined);

export const FileOperationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const fileOperations = FileOperations.getInstance();
  const { state } = useFloorPlanContext();
  const autoSaveTimerRef = useRef<number | null>(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = React.useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = React.useState(5);

  const saveProject = useCallback(async (data: ProjectData, storageType: 'local' | 'indexedDB' = 'local') => {
    await fileOperations.saveProject(data, storageType);
  }, [fileOperations]);

  const loadProject = useCallback(async (storageKey: string) => {
    return fileOperations.loadProject(storageKey);
  }, [fileOperations]);

  const listSavedProjects = useCallback(async () => {
    return fileOperations.listSavedProjects();
  }, [fileOperations]);

  const exportPDF = useCallback(async (options: PDFExportOptions) => {
    return fileOperations.exportPDF(options);
  }, [fileOperations]);

  const exportImage = useCallback(async (options: ImageExportOptions) => {
    return fileOperations.exportImage(options);
  }, [fileOperations]);

  const exportSVG = useCallback(async (options: SVGExportOptions) => {
    return fileOperations.exportSVG(options);
  }, [fileOperations]);

  const getAutoSaveVersions = useCallback(() => {
    return fileOperations.getAutoSaveVersions();
  }, [fileOperations]);

  const restoreVersion = useCallback(async (versionId: string) => {
    return fileOperations.restoreVersion(versionId);
  }, [fileOperations]);

  const importProject = useCallback(async (file: File) => {
    return fileOperations.importProject(file);
  }, [fileOperations]);

  const importBackgroundImage = useCallback(async (file: File) => {
    return fileOperations.importBackgroundImage(file);
  }, [fileOperations]);

  const enableAutoSave = useCallback((interval: number = 5) => {
    setAutoSaveInterval(interval);
    setIsAutoSaveEnabled(true);

    if (autoSaveTimerRef.current) {
      window.clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = window.setInterval(() => {
      const { history: _, ...projectData } = state;
      saveProject(projectData, 'local');
    }, interval * 60 * 1000);
  }, [state, saveProject]);

  const disableAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(false);
    if (autoSaveTimerRef.current) {
      window.clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  const contextValue: FileOperationsContextType = {
    saveProject,
    loadProject,
    listSavedProjects,
    exportPDF,
    exportImage,
    exportSVG,
    enableAutoSave,
    disableAutoSave,
    getAutoSaveVersions,
    restoreVersion,
    importProject,
    importBackgroundImage,
    isAutoSaveEnabled,
    autoSaveInterval,
  };

  return (
    <FileOperationsContext.Provider value={contextValue}>
      {children}
    </FileOperationsContext.Provider>
  );
};

export const useFileOperations = (): FileOperationsContextType => {
  const context = useContext(FileOperationsContext);
  if (!context) {
    throw new Error('useFileOperations must be used within a FileOperationsProvider');
  }
  return context;
};
