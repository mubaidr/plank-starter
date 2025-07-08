"use client";
import React, { useState } from 'react';
import { RectangleHorizontal, X } from 'lucide-react';

interface WindowProperties {
  type: 'standard' | 'bay' | 'casement' | 'sliding' | 'awning' | 'picture';
  width: number; // in pixels
  height: number; // in pixels
  openingDirection: 'left' | 'right' | 'top' | 'bottom' | 'none';
  frameType: 'vinyl' | 'wood' | 'aluminum' | 'fiberglass';
  glassType: 'single' | 'double' | 'triple' | 'low-e';
  grilles: boolean;
  sill: boolean;
  trim: boolean;
}

interface WindowToolProps {
  onWindowPropertiesChange: (properties: WindowProperties) => void;
  onClose: () => void;
  currentProperties: WindowProperties;
}

const WindowTool: React.FC<WindowToolProps> = ({
  onWindowPropertiesChange,
  onClose,
  currentProperties
}) => {
  const [type, setType] = useState(currentProperties.type);
  const [width, setWidth] = useState(currentProperties.width);
  const [height, setHeight] = useState(currentProperties.height);
  const [openingDirection, setOpeningDirection] = useState(currentProperties.openingDirection);
  const [frameType, setFrameType] = useState(currentProperties.frameType);
  const [glassType, setGlassType] = useState(currentProperties.glassType);
  const [grilles, setGrilles] = useState(currentProperties.grilles);
  const [sill, setSill] = useState(currentProperties.sill);
  const [trim, setTrim] = useState(currentProperties.trim);

  // Standard window sizes (width x height in inches, converted to pixels at 20px = 1ft scale)
  const windowSizes = [
    { value: { width: 40, height: 60 }, label: '24" x 36"', inches: '24" x 36"' },
    { value: { width: 53.33, height: 80 }, label: '32" x 48"', inches: '32" x 48"' },
    { value: { width: 60, height: 80 }, label: '36" x 48"', inches: '36" x 48"' },
    { value: { width: 66.67, height: 100 }, label: '40" x 60"', inches: '40" x 60"' },
    { value: { width: 80, height: 100 }, label: '48" x 60"', inches: '48" x 60"' },
    { value: { width: 100, height: 120 }, label: '60" x 72"', inches: '60" x 72"' }
  ];

  const windowTypes = [
    { 
      id: 'standard', 
      name: 'Standard Window', 
      description: 'Fixed or single/double hung window',
      icon: '🪟'
    },
    { 
      id: 'bay', 
      name: 'Bay Window', 
      description: 'Protruding window with angled sides',
      icon: '🏠'
    },
    { 
      id: 'casement', 
      name: 'Casement Window', 
      description: 'Side-hinged window that opens outward',
      icon: '↗️'
    },
    { 
      id: 'sliding', 
      name: 'Sliding Window', 
      description: 'Window that slides horizontally',
      icon: '↔️'
    },
    { 
      id: 'awning', 
      name: 'Awning Window', 
      description: 'Top-hinged window that opens outward',
      icon: '⬆️'
    },
    { 
      id: 'picture', 
      name: 'Picture Window', 
      description: 'Large fixed window for views',
      icon: '🖼️'
    }
  ];

  const frameTypes = [
    { id: 'vinyl', name: 'Vinyl', color: '#F5F5F5', description: 'Low maintenance, energy efficient' },
    { id: 'wood', name: 'Wood', color: '#8B4513', description: 'Traditional, customizable' },
    { id: 'aluminum', name: 'Aluminum', color: '#C0C0C0', description: 'Durable, modern' },
    { id: 'fiberglass', name: 'Fiberglass', color: '#F5F5DC', description: 'Strong, low maintenance' }
  ];

  const glassTypes = [
    { id: 'single', name: 'Single Pane', description: 'Basic glass' },
    { id: 'double', name: 'Double Pane', description: 'Insulated glass unit' },
    { id: 'triple', name: 'Triple Pane', description: 'Maximum insulation' },
    { id: 'low-e', name: 'Low-E Glass', description: 'Energy efficient coating' }
  ];

  const handleApply = () => {
    const newProperties: WindowProperties = {
      type,
      width,
      height,
      openingDirection,
      frameType,
      glassType,
      grilles,
      sill,
      trim
    };
    onWindowPropertiesChange(newProperties);
    onClose();
  };

  const selectedFrame = frameTypes.find(f => f.id === frameType);
  const selectedGlass = glassTypes.find(g => g.id === glassType);
  const currentSize = windowSizes.find(s => s.value.width === width && s.value.height === height);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <RectangleHorizontal className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Window Properties</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Window Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Window Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {windowTypes.map(windowType => (
                <button
                  key={windowType.id}
                  onClick={() => setType(windowType.id as typeof type)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    type === windowType.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{windowType.icon}</span>
                    <span className="font-medium text-gray-900">{windowType.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{windowType.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Window Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Window Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {windowSizes.map((size, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setWidth(size.value.width);
                    setHeight(size.value.height);
                  }}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    currentSize?.label === size.label
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-xs">{size.label}</div>
                  <div className="text-xs text-gray-500">{size.inches}</div>
                </button>
              ))}
            </div>
            
            {/* Custom size sliders */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Width: {(width * 12 / 20).toFixed(1)}&quot;
                </label>
                <input
                  type="range"
                  min="20"
                  max="160"
                  step="6.67"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-2">
                  Height: {(height * 12 / 20).toFixed(1)}&quot;
                </label>
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Opening Direction (for operable windows) */}
          {(type === 'casement' || type === 'sliding' || type === 'awning') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Opening Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {type === 'casement' && [
                  { id: 'left', name: 'Left Hinge', icon: '↰' },
                  { id: 'right', name: 'Right Hinge', icon: '↱' }
                ].map(direction => (
                  <button
                    key={direction.id}
                    onClick={() => setOpeningDirection(direction.id as typeof openingDirection)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      openingDirection === direction.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{direction.icon}</div>
                    <div className="text-xs font-medium">{direction.name}</div>
                  </button>
                ))}
                
                {type === 'sliding' && [
                  { id: 'left', name: 'Slide Left', icon: '⬅️' },
                  { id: 'right', name: 'Slide Right', icon: '➡️' }
                ].map(direction => (
                  <button
                    key={direction.id}
                    onClick={() => setOpeningDirection(direction.id as typeof openingDirection)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      openingDirection === direction.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{direction.icon}</div>
                    <div className="text-xs font-medium">{direction.name}</div>
                  </button>
                ))}

                {type === 'awning' && [
                  { id: 'top', name: 'Top Hinge', icon: '⬆️' },
                  { id: 'bottom', name: 'Bottom Hinge', icon: '⬇️' }
                ].map(direction => (
                  <button
                    key={direction.id}
                    onClick={() => setOpeningDirection(direction.id as typeof openingDirection)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      openingDirection === direction.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{direction.icon}</div>
                    <div className="text-xs font-medium">{direction.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frame Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Frame Material
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frameTypes.map(frame => (
                <button
                  key={frame.id}
                  onClick={() => setFrameType(frame.id)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    frameType === frame.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-full h-4 rounded mb-2"
                    style={{ backgroundColor: frame.color }}
                  />
                  <div className="font-medium text-sm">{frame.name}</div>
                  <div className="text-xs text-gray-600">{frame.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Glass Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Glass Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {glassTypes.map(glass => (
                <button
                  key={glass.id}
                  onClick={() => setGlassType(glass.id)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    glassType === glass.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{glass.name}</div>
                  <div className="text-xs text-gray-600">{glass.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Features */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Additional Features
            </label>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Window Grilles</label>
              <button
                onClick={() => setGrilles(!grilles)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  grilles ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    grilles ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Window Sill</label>
              <button
                onClick={() => setSill(!sill)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sill ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    sill ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Window Trim</label>
              <button
                onClick={() => setTrim(!trim)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  trim ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    trim ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Type:</strong> {windowTypes.find(t => t.id === type)?.name}</div>
                <div><strong>Size:</strong> {(width * 12 / 20).toFixed(1)}&quot; x {(height * 12 / 20).toFixed(1)}&quot;</div>
                <div><strong>Frame:</strong> {selectedFrame?.name}</div>
                <div><strong>Glass:</strong> {selectedGlass?.name}</div>
                {(type === 'casement' || type === 'sliding' || type === 'awning') && (
                  <div><strong>Opening:</strong> {openingDirection}</div>
                )}
                <div><strong>Features:</strong> {[
                  grilles && 'Grilles',
                  sill && 'Sill', 
                  trim && 'Trim'
                ].filter(Boolean).join(', ') || 'None'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="btn-primary"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default WindowTool;