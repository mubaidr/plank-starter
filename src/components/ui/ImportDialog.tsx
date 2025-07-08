"use client";
import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, Clock, Trash2, Download } from 'lucide-react';
import { FileOperations, ProjectData } from '../../utils/fileOperations';

interface ImportDialogProps {
  onClose: () => void;
  onProjectLoad: (data: ProjectData) => void;
  onBackgroundImageLoad: (imageData: string) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  onClose,
  onProjectLoad,
  onBackgroundImageLoad
}) => {
  const [activeTab, setActiveTab] = useState<'project' | 'image' | 'autosave'>('project');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileOps = FileOperations.getInstance();

  const autoSaveVersions = fileOps.getAutoSaveVersions();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    
    try {
      if (activeTab === 'project') {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const projectData = await fileOps.loadProject(file);
          onProjectLoad(projectData);
          onClose();
        } else {
          alert('Please select a valid JSON project file.');
        }
      } else if (activeTab === 'image') {
        if (file.type.startsWith('image/')) {
          const imageData = await fileOps.importBackgroundImage(file);
          onBackgroundImageLoad(imageData);
          onClose();
        } else {
          alert('Please select a valid image file.');
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import file. Please check the file format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleAutoSaveRestore = (version: { key: string; timestamp: string; data: ProjectData }) => {
    onProjectLoad(version.data);
    onClose();
  };

  const handleAutoSaveDelete = (key: string) => {
    localStorage.removeItem(key);
    window.location.reload(); // Simple way to refresh the auto-save list
  };

  const handleAutoSaveExport = (version: { key: string; timestamp: string; data: ProjectData }) => {
    fileOps.saveProject(version.data, `autosave-${version.timestamp}.json`);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getFileSize = (data: ProjectData) => {
    const jsonString = JSON.stringify(data);
    const bytes = new Blob([jsonString]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderProjectImport = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Import Project File
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop a JSON project file here, or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Choose File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Supported Formats</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• JSON project files (.json)</li>
          <li>• Complete project data including objects, layers, and measurements</li>
          <li>• Settings and configuration data</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Import Warning</h4>
        <p className="text-sm text-yellow-800">
          Importing a project will replace your current work. Make sure to save your current project before importing.
        </p>
      </div>
    </div>
  );

  const renderImageImport = () => (
    <div className="space-y-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Import Background Image
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add a background image to trace over or use as reference
        </p>
        <button
          onClick={() => imageInputRef.current?.click()}
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Choose Image'}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Supported Image Formats</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• PNG, JPEG, GIF, WebP</li>
          <li>• SVG vector images</li>
          <li>• Maximum recommended size: 10MB</li>
          <li>• Images will be converted to base64 for storage</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">💡 Tips for Background Images</h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Use floor plans, blueprints, or site maps</li>
          <li>• Ensure images are high resolution for better tracing</li>
          <li>• You can adjust opacity and scale after import</li>
          <li>• Background images are saved with your project</li>
        </ul>
      </div>
    </div>
  );

  const renderAutoSaveManager = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Auto-Save Versions</h3>
          <p className="text-sm text-gray-600">
            Automatically saved versions of your project
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {autoSaveVersions.length} version{autoSaveVersions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {autoSaveVersions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-600">No auto-save versions found</p>
          <p className="text-xs text-gray-500 mt-1">
            Auto-save versions will appear here as you work
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {autoSaveVersions.map((version, index) => (
            <div
              key={version.key}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      Auto-save #{autoSaveVersions.length - index}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getFileSize(version.data)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {formatTimestamp(version.timestamp)}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {version.data.objects?.length || 0} objects • 
                    {version.data.layers?.length || 0} layers • 
                    {version.data.measurements?.length || 0} measurements
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAutoSaveExport(version)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Export this version"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleAutoSaveDelete(version.key)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete this version"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => handleAutoSaveRestore(version)}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Auto-Save Settings</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Auto-save interval: 5 minutes</p>
          <p>• Maximum versions kept: 10</p>
          <p>• Storage: Browser local storage</p>
          <p>• Versions are automatically cleaned up when limit is reached</p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'project', name: 'Project File', icon: FileText },
    { id: 'image', name: 'Background Image', icon: Image },
    { id: 'autosave', name: 'Auto-Save', icon: Clock }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Import & Recovery</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Tab Navigation */}
          <div className="w-64 border-r border-gray-200 p-4">
            <div className="space-y-1">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'project' && renderProjectImport()}
            {activeTab === 'image' && renderImageImport()}
            {activeTab === 'autosave' && renderAutoSaveManager()}
          </div>
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

export default ImportDialog;