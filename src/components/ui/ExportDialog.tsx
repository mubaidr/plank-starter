"use client";
import React, { useState, useRef } from 'react';
import { Download, X, FileText, Image, Code, Settings } from 'lucide-react';
import { FileOperations, PDFExportOptions, ImageExportOptions, SVGExportOptions, ProjectData } from '../../utils/fileOperations';

interface ExportDialogProps {
  onClose: () => void;
  projectData: ProjectData;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  layers: Array<{ id: string; name: string; visible: boolean; locked: boolean; color: string }>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  onClose,
  projectData,
  canvasRef,
  layers
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'pdf' | 'png' | 'jpg' | 'svg'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const fileOps = FileOperations.getInstance();

  // PDF Export Settings
  const [pdfOptions, setPdfOptions] = useState<PDFExportOptions>({
    paperSize: 'A4',
    orientation: 'landscape',
    scale: 'fit',
    customScale: 1,
    includeGrid: false,
    includeMeasurements: true,
    includeLayers: layers.map(l => l.id),
    margins: { top: 20, right: 20, bottom: 30, left: 20 },
    titleBlock: {
      show: true,
      title: projectData.metadata.name || 'Floor Plan',
      subtitle: projectData.metadata.description || '',
      author: projectData.metadata.author || 'Unknown',
      date: new Date().toLocaleDateString(),
      scale: '1:100'
    }
  });

  // Image Export Settings
  const [imageOptions, setImageOptions] = useState<ImageExportOptions>({
    format: 'png',
    width: 1920,
    height: 1080,
    quality: 0.9,
    backgroundColor: '#ffffff',
    includeGrid: false,
    includeMeasurements: true,
    includeLayers: layers.map(l => l.id),
    dpi: 300
  });

  // SVG Export Settings
  const [svgOptions, setSvgOptions] = useState<SVGExportOptions>({
    width: 800,
    height: 600,
    includeGrid: false,
    includeMeasurements: true,
    includeLayers: layers.map(l => l.id),
    embedFonts: true,
    precision: 2
  });

  const exportFormats = [
    {
      id: 'json',
      name: 'Project File',
      description: 'Save complete project with all data',
      icon: FileText,
      extension: '.json'
    },
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Professional document with title block',
      icon: FileText,
      extension: '.pdf'
    },
    {
      id: 'png',
      name: 'PNG Image',
      description: 'High-quality raster image',
      icon: Image,
      extension: '.png'
    },
    {
      id: 'jpg',
      name: 'JPEG Image',
      description: 'Compressed raster image',
      icon: Image,
      extension: '.jpg'
    },
    {
      id: 'svg',
      name: 'SVG Vector',
      description: 'Scalable vector graphics',
      icon: Code,
      extension: '.svg'
    }
  ];

  const handleExport = async () => {
    if (!canvasRef.current) {
      alert('Canvas not available for export');
      return;
    }

    setIsExporting(true);
    
    try {
      switch (selectedFormat) {
        case 'json':
          fileOps.saveProject(projectData);
          break;
          
        case 'pdf':
          await fileOps.exportToPDF(canvasRef.current, projectData, pdfOptions);
          break;
          
        case 'png':
        case 'jpg':
          await fileOps.exportToImage(canvasRef.current, {
            ...imageOptions,
            format: selectedFormat
          });
          break;
          
        case 'svg':
          await fileOps.exportToSVG(projectData, svgOptions);
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderPDFSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paper Size
          </label>
          <select
            value={pdfOptions.paperSize}
            onChange={(e) => setPdfOptions(prev => ({ 
              ...prev, 
              paperSize: e.target.value as PDFExportOptions['paperSize'] 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="A3">A3 (297 × 420 mm)</option>
            <option value="A2">A2 (420 × 594 mm)</option>
            <option value="A1">A1 (594 × 841 mm)</option>
            <option value="Letter">Letter (8.5 × 11 in)</option>
            <option value="Legal">Legal (8.5 × 14 in)</option>
            <option value="Tabloid">Tabloid (11 × 17 in)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Orientation
          </label>
          <select
            value={pdfOptions.orientation}
            onChange={(e) => setPdfOptions(prev => ({ 
              ...prev, 
              orientation: e.target.value as 'portrait' | 'landscape' 
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="landscape">Landscape</option>
            <option value="portrait">Portrait</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title Block
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={pdfOptions.titleBlock.show}
              onChange={(e) => setPdfOptions(prev => ({
                ...prev,
                titleBlock: { ...prev.titleBlock, show: e.target.checked }
              }))}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Include title block</span>
          </label>
          
          {pdfOptions.titleBlock.show && (
            <div className="grid grid-cols-2 gap-2 ml-6">
              <input
                type="text"
                placeholder="Title"
                value={pdfOptions.titleBlock.title}
                onChange={(e) => setPdfOptions(prev => ({
                  ...prev,
                  titleBlock: { ...prev.titleBlock, title: e.target.value }
                }))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Scale (e.g., 1:100)"
                value={pdfOptions.titleBlock.scale}
                onChange={(e) => setPdfOptions(prev => ({
                  ...prev,
                  titleBlock: { ...prev.titleBlock, scale: e.target.value }
                }))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={pdfOptions.includeGrid}
            onChange={(e) => setPdfOptions(prev => ({ ...prev, includeGrid: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Include grid</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={pdfOptions.includeMeasurements}
            onChange={(e) => setPdfOptions(prev => ({ ...prev, includeMeasurements: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Include measurements</span>
        </label>
      </div>
    </div>
  );

  const renderImageSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width (pixels)
          </label>
          <input
            type="number"
            value={imageOptions.width}
            onChange={(e) => setImageOptions(prev => ({ ...prev, width: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min="100"
            max="8192"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (pixels)
          </label>
          <input
            type="number"
            value={imageOptions.height}
            onChange={(e) => setImageOptions(prev => ({ ...prev, height: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min="100"
            max="8192"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DPI
          </label>
          <select
            value={imageOptions.dpi}
            onChange={(e) => setImageOptions(prev => ({ ...prev, dpi: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="72">72 DPI (Screen)</option>
            <option value="150">150 DPI (Draft Print)</option>
            <option value="300">300 DPI (High Quality)</option>
            <option value="600">600 DPI (Professional)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={imageOptions.backgroundColor}
            onChange={(e) => setImageOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
            className="w-full h-10 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {selectedFormat === 'jpg' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quality: {Math.round(imageOptions.quality * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={imageOptions.quality}
            onChange={(e) => setImageOptions(prev => ({ ...prev, quality: Number(e.target.value) }))}
            className="w-full"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={imageOptions.includeGrid}
            onChange={(e) => setImageOptions(prev => ({ ...prev, includeGrid: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Include grid</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={imageOptions.includeMeasurements}
            onChange={(e) => setImageOptions(prev => ({ ...prev, includeMeasurements: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Include measurements</span>
        </label>
      </div>
    </div>
  );

  const renderSVGSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <input
            type="number"
            value={svgOptions.width}
            onChange={(e) => setSvgOptions(prev => ({ ...prev, width: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <input
            type="number"
            value={svgOptions.height}
            onChange={(e) => setSvgOptions(prev => ({ ...prev, height: Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min="100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Precision (decimal places)
        </label>
        <select
          value={svgOptions.precision}
          onChange={(e) => setSvgOptions(prev => ({ ...prev, precision: Number(e.target.value) }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="0">0 (Integer)</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={svgOptions.includeGrid}
            onChange={(e) => setSvgOptions(prev => ({ ...prev, includeGrid: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Include grid</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={svgOptions.includeMeasurements}
            onChange={(e) => setSvgOptions(prev => ({ ...prev, includeMeasurements: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Include measurements</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={svgOptions.embedFonts}
            onChange={(e) => setSvgOptions(prev => ({ ...prev, embedFonts: e.target.checked }))}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Embed fonts</span>
        </label>
      </div>
    </div>
  );

  const renderLayerSelection = () => {
    const currentOptions = selectedFormat === 'pdf' ? pdfOptions : 
                          selectedFormat === 'svg' ? svgOptions : imageOptions;
    
    const updateLayers = (layerIds: string[]) => {
      if (selectedFormat === 'pdf') {
        setPdfOptions(prev => ({ ...prev, includeLayers: layerIds }));
      } else if (selectedFormat === 'svg') {
        setSvgOptions(prev => ({ ...prev, includeLayers: layerIds }));
      } else {
        setImageOptions(prev => ({ ...prev, includeLayers: layerIds }));
      }
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Include Layers
        </label>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {layers.map(layer => (
            <label key={layer.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={currentOptions.includeLayers.includes(layer.id)}
                onChange={(e) => {
                  const newLayers = e.target.checked
                    ? [...currentOptions.includeLayers, layer.id]
                    : currentOptions.includeLayers.filter(id => id !== layer.id);
                  updateLayers(newLayers);
                }}
                className="rounded"
              />
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: layer.color }}
              />
              <span className="text-sm text-gray-700">{layer.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Export Floor Plan</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* Format Selection */}
          <div className="w-64 border-r border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Export Format</h4>
            <div className="space-y-2">
              {exportFormats.map(format => {
                const IconComponent = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as typeof selectedFormat)}
                    className={`w-full p-3 border rounded-lg text-left transition-colors ${
                      selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComponent className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">{format.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{format.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{format.extension}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-medium text-gray-700">Export Settings</h4>
            </div>

            {selectedFormat === 'json' && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-600">
                  Project file will include all objects, layers, measurements, and settings.
                </p>
              </div>
            )}

            {selectedFormat === 'pdf' && renderPDFSettings()}
            {(selectedFormat === 'png' || selectedFormat === 'jpg') && renderImageSettings()}
            {selectedFormat === 'svg' && renderSVGSettings()}

            {selectedFormat !== 'json' && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                {renderLayerSelection()}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedFormat === 'json' ? 'Complete project data' : 
             selectedFormat === 'pdf' ? `${pdfOptions.paperSize} ${pdfOptions.orientation}` :
             selectedFormat === 'svg' ? `${svgOptions.width}×${svgOptions.height}` :
             `${imageOptions.width}×${imageOptions.height} @ ${imageOptions.dpi}DPI`}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="btn-primary"
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : `Export ${selectedFormat.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;