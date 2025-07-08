"use client";
import React, { useState } from 'react';
import { DoorOpen, X } from 'lucide-react';

interface DoorProperties {
  type: 'single' | 'double' | 'sliding' | 'bi-fold';
  width: number; // in pixels
  height: number; // in pixels
  swingDirection: 'left' | 'right' | 'inward' | 'outward';
  openingAngle: number; // degrees (0-90)
  material: string;
  handleType: 'lever' | 'knob' | 'push-pull';
  threshold: boolean;
}

interface DoorToolProps {
  onDoorPropertiesChange: (properties: DoorProperties) => void;
  onClose: () => void;
  currentProperties: DoorProperties;
}

const DoorTool: React.FC<DoorToolProps> = ({
  onDoorPropertiesChange,
  onClose,
  currentProperties
}) => {
  const [type, setType] = useState(currentProperties.type);
  const [width, setWidth] = useState(currentProperties.width);
  const [height, setHeight] = useState(currentProperties.height);
  const [swingDirection, setSwingDirection] = useState(currentProperties.swingDirection);
  const [openingAngle, setOpeningAngle] = useState(currentProperties.openingAngle);
  const [material, setMaterial] = useState(currentProperties.material);
  const [handleType, setHandleType] = useState(currentProperties.handleType);
  const [threshold, setThreshold] = useState(currentProperties.threshold);

  // Standard door sizes (width x height in inches, converted to pixels at 20px = 1ft scale)
  const doorSizes = [
    { value: { width: 53.33, height: 140 }, label: '32" x 84"', inches: '32" x 84"' },
    { value: { width: 60, height: 140 }, label: '36" x 84"', inches: '36" x 84"' },
    { value: { width: 66.67, height: 140 }, label: '40" x 84"', inches: '40" x 84"' },
    { value: { width: 120, height: 140 }, label: '72" x 84" (Double)', inches: '72" x 84"' },
    { value: { width: 160, height: 140 }, label: '96" x 84" (Double)', inches: '96" x 84"' }
  ];

  const doorTypes = [
    { 
      id: 'single', 
      name: 'Single Door', 
      description: 'Standard hinged door with single panel',
      icon: '🚪'
    },
    { 
      id: 'double', 
      name: 'Double Door', 
      description: 'Two door panels that open together',
      icon: '🚪🚪'
    },
    { 
      id: 'sliding', 
      name: 'Sliding Door', 
      description: 'Door that slides horizontally',
      icon: '↔️'
    },
    { 
      id: 'bi-fold', 
      name: 'Bi-fold Door', 
      description: 'Door that folds in the middle',
      icon: '🪗'
    }
  ];

  const doorMaterials = [
    { id: 'wood', name: 'Wood', color: '#8B4513' },
    { id: 'steel', name: 'Steel', color: '#708090' },
    { id: 'fiberglass', name: 'Fiberglass', color: '#F5F5DC' },
    { id: 'glass', name: 'Glass', color: '#E0F6FF' },
    { id: 'composite', name: 'Composite', color: '#DEB887' }
  ];

  const handleApply = () => {
    const newProperties: DoorProperties = {
      type,
      width,
      height,
      swingDirection,
      openingAngle,
      material,
      handleType,
      threshold
    };
    onDoorPropertiesChange(newProperties);
    onClose();
  };

  const selectedMaterial = doorMaterials.find(m => m.id === material);
  const currentSize = doorSizes.find(s => s.value.width === width && s.value.height === height);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <DoorOpen className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Door Properties</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Door Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Door Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {doorTypes.map(doorType => (
                <button
                  key={doorType.id}
                  onClick={() => setType(doorType.id as typeof type)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    type === doorType.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{doorType.icon}</span>
                    <span className="font-medium text-gray-900">{doorType.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{doorType.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Door Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Door Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {doorSizes.map((size, index) => (
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
                  <div className="font-medium">{size.label}</div>
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
                  min="40"
                  max="200"
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
                  min="120"
                  max="180"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Swing Direction (for hinged doors) */}
          {(type === 'single' || type === 'double') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Swing Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'left', name: 'Left Swing', icon: '↰' },
                  { id: 'right', name: 'Right Swing', icon: '↱' },
                  { id: 'inward', name: 'Inward', icon: '⬅️' },
                  { id: 'outward', name: 'Outward', icon: '➡️' }
                ].map(direction => (
                  <button
                    key={direction.id}
                    onClick={() => setSwingDirection(direction.id as typeof swingDirection)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      swingDirection === direction.id
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

          {/* Opening Angle (for hinged doors) */}
          {(type === 'single' || type === 'double') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Angle: {openingAngle}°
              </label>
              <input
                type="range"
                min="45"
                max="180"
                step="15"
                value={openingAngle}
                onChange={(e) => setOpeningAngle(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>45°</span>
                <span>90°</span>
                <span>180°</span>
              </div>
            </div>
          )}

          {/* Door Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Door Material
            </label>
            <div className="grid grid-cols-3 gap-2">
              {doorMaterials.map(mat => (
                <button
                  key={mat.id}
                  onClick={() => setMaterial(mat.id)}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    material === mat.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-full h-6 rounded mb-2"
                    style={{ backgroundColor: mat.color }}
                  />
                  <span className="text-xs font-medium text-gray-900">{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Handle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Handle Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lever', name: 'Lever Handle' },
                { id: 'knob', name: 'Door Knob' },
                { id: 'push-pull', name: 'Push/Pull' }
              ].map(handle => (
                <button
                  key={handle.id}
                  onClick={() => setHandleType(handle.id as typeof handleType)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    handleType === handle.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xs font-medium">{handle.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Properties */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Additional Properties
            </label>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Threshold</label>
              <button
                onClick={() => setThreshold(!threshold)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  threshold ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    threshold ? 'translate-x-6' : 'translate-x-1'
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
                <div><strong>Type:</strong> {doorTypes.find(t => t.id === type)?.name}</div>
                <div><strong>Size:</strong> {(width * 12 / 20).toFixed(1)}&quot; x {(height * 12 / 20).toFixed(1)}&quot;</div>
                <div><strong>Material:</strong> {selectedMaterial?.name}</div>
                {(type === 'single' || type === 'double') && (
                  <>
                    <div><strong>Swing:</strong> {swingDirection}</div>
                    <div><strong>Opening:</strong> {openingAngle}°</div>
                  </>
                )}
                <div><strong>Handle:</strong> {handleType}</div>
                <div><strong>Threshold:</strong> {threshold ? 'Yes' : 'No'}</div>
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

export default DoorTool;