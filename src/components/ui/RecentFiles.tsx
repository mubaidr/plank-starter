"use client";
import React, { useState, useEffect } from 'react';
import { Clock, FileText, Trash2, X, FolderOpen } from 'lucide-react';

interface ProjectData {
  objects: unknown[];
  settings: Record<string, unknown>;
}

interface RecentFile {
  id: string;
  name: string;
  lastModified: string;
  size: number;
  preview?: string;
  data: ProjectData;
}

interface RecentFilesProps {
  onFileSelect: (fileData: ProjectData) => void;
  onClose: () => void;
}

const RecentFiles: React.FC<RecentFilesProps> = ({ onFileSelect, onClose }) => {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  useEffect(() => {
    // Load recent files from localStorage
    const loadRecentFiles = () => {
      const files: RecentFile[] = [];
      
      // Check for auto-save
      const autoSave = localStorage.getItem('floor-plan-autosave');
      if (autoSave) {
        try {
          const data = JSON.parse(autoSave);
          files.push({
            id: 'autosave',
            name: 'Auto-saved Project',
            lastModified: data.timestamp || new Date().toISOString(),
            size: JSON.stringify(data).length,
            data
          });
        } catch (e) {
          console.error('Error parsing auto-save:', e);
        }
      }

      // Check for manually saved files
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('floor-plan-save-')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            files.push({
              id: key,
              name: data.name || key.replace('floor-plan-save-', ''),
              lastModified: data.timestamp || new Date().toISOString(),
              size: JSON.stringify(data).length,
              data
            });
          } catch (e) {
            console.error('Error parsing saved file:', e);
          }
        }
      }

      // Sort by last modified (newest first)
      files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
      
      setRecentFiles(files.slice(0, 10)); // Keep only 10 most recent
    };

    loadRecentFiles();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const deleteFile = (fileId: string) => {
    if (fileId === 'autosave') {
      localStorage.removeItem('floor-plan-autosave');
    } else {
      localStorage.removeItem(fileId);
    }
    setRecentFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    recentFiles.forEach(file => {
      if (file.id === 'autosave') {
        localStorage.removeItem('floor-plan-autosave');
      } else {
        localStorage.removeItem(file.id);
      }
    });
    setRecentFiles([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Files</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {recentFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No recent files</p>
              <p className="text-sm">Your recently opened projects will appear here</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div
                      className="flex items-center space-x-3 flex-1 cursor-pointer"
                      onClick={() => onFileSelect(file.data)}
                    >
                      <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </h4>
                          {file.id === 'autosave' && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              Auto-saved
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(file.lastModified)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                          {file.data.objects && (
                            <span className="text-xs text-gray-500">
                              {file.data.objects.length} objects
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1"
                      title="Delete file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
                <div className="text-sm text-gray-600">
                  {recentFiles.length} recent file{recentFiles.length !== 1 ? 's' : ''}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentFiles;