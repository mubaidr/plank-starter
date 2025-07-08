"use client";
import React, { useState } from 'react';
import { Home, X } from 'lucide-react';

interface WallProperties {
  thickness: number; // in pixels (will be converted to real units)
  material: string;
  height: number; // wall height in pixels
  insulation: boolean;
  structural: boolean;
}

interface WallToolProps {
  onWallPropertiesChange: (properties: WallProperties) => void;
  onClose: () => void;
  currentProperties: WallProperties;
}

const WallTool: React.FC<WallToolProps> = ({
  onWallPropertiesChange,
  onClose,
  currentProperties
}) => {
  const [thickness, setThickness] = useState(currentProperties.thickness);
  const [material, setMaterial] = useState(currentProperties.material);
  const [height, setHeight] = useState(currentProperties.height);
  const [insulation, setInsulation] = useState(currentProperties.insulation);
  const [structural, setStructural] = useState(currentProperties.structural);

  // Standard wall thicknesses in inches (converted to pixels at 20px = 1ft scale)
  const wallThicknesses = [
    { value: 6.67, label: '4"', inches: 4 },
    { value: 10, label: '6"', inches: 6 },
    { value: 13.33, label: '8"', inches: 8 },
    { value: 16.67, label: '10"', inches: 10 },
    { value: 20, label: '12"', inches: 12 },
    { value: 26.67, label: '16"', inches: 16 }
  ];

  const wallMaterials = [
    { id: 'drywall', name: 'Drywall', color: '#F5F5F5' },
    { id: 'brick', name: 'Brick', color: '#CD853F' },
    { id: 'concrete', name: 'Concrete', color: '#A0A0A0' },
    { id: 'wood-frame', name: 'Wood Frame', color: '#DEB887' },
    { id: 'steel-frame', name: 'Steel Frame', color: '#708090' },
    { id: 'stone', name: 'Stone', color: '#696969' },
    { id: 'glass', name: 'Glass', color: '#E0F6FF' }
  ];

  const handleApply = () => {
    const newProperties: WallProperties = {
      thickness,
      material,
      height,
      insulation,
      structural
    };
    onWallPropertiesChange(newProperties);
    onClose();
  };

  const selectedMaterial = wallMaterials.find(m => m.id === material);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Wall Properties</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Wall Thickness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Wall Thickness
            </label>
            <div className="grid grid-cols-3 gap-2">
              {wallThicknesses.map(option => (
                <button
                  key={option.value}
                  onClick={() => setThickness(option.value)}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    thickness === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.inches}&quot;</div>
                </button>
              ))}
            </div>
            
            {/* Custom thickness slider */}
            <div className="mt-4">
              <label className="block text-xs text-gray-600 mb-2">
                Custom Thickness: {(thickness * 12 / 20).toFixed(1)}&quot;
              </label>
              <input
                type="range"
                min="3.33"
                max="40"
                step="0.33"
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2&quot;</span>
                <span>24&quot;</span>
              </div>
            </div>
          </div>

          {/* Wall Material */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Wall Material
            </label>
            <div className="grid grid-cols-2 gap-2">
              {wallMaterials.map(mat => (
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
                  <span className="text-sm font-medium text-gray-900">{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wall Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wall Height: {(height / 20).toFixed(1)} ft
            </label>
            <input
              type="range"
              min="160"
              max="240"
              step="10"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8 ft</span>
              <span>12 ft</span>
            </div>
          </div>

          {/* Wall Properties */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Additional Properties
            </label>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Insulated</label>
              <button
                onClick={() => setInsulation(!insulation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  insulation ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    insulation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Load Bearing</label>
              <button
                onClick={() => setStructural(!structural)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  structural ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    structural ? 'translate-x-6' : 'translate-x-1'
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
                <div><strong>Thickness:</strong> {(thickness * 12 / 20).toFixed(1)}&quot;</div>
                <div><strong>Material:</strong> {selectedMaterial?.name}</div>
                <div><strong>Height:</strong> {(height / 20).toFixed(1)} ft</div>
                <div><strong>Insulated:</strong> {insulation ? 'Yes' : 'No'}</div>
                <div><strong>Load Bearing:</strong> {structural ? 'Yes' : 'No'}</div>
              </div>
              
              {/* Visual preview */}
              <div className="mt-3 flex items-center justify-center">
                <div className="text-xs text-gray-500 mb-1">Wall Cross-Section</div>
              </div>
              <div className="flex justify-center">
                <div
                  className="border-2 border-gray-400"
                  style={{
                    width: `${Math.max(thickness / 2, 8)}px`,
                    height: '40px',
                    backgroundColor: selectedMaterial?.color || '#F5F5F5'
                  }}
                />
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

export default WallTool;