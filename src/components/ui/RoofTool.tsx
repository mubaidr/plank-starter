"use client";
import React, { useState } from 'react';
import { Home, Triangle, Square, X } from 'lucide-react';

interface RoofData {
  type: 'gable' | 'hip' | 'flat' | 'shed';
  pitch: number; // degrees
  overhang: number; // in pixels
  material: string;
  height: number; // ridge height
}

interface RoofToolProps {
  wallOutline: Array<{ x: number; y: number }>;
  onRoofComplete: (roofData: RoofData & { points: number[] }) => void;
  onCancel: () => void;
}

const RoofTool: React.FC<RoofToolProps> = ({ wallOutline, onRoofComplete, onCancel }) => {
  const [roofType, setRoofType] = useState<'gable' | 'hip' | 'flat' | 'shed'>('gable');
  const [pitch, setPitch] = useState(30); // degrees
  const [overhang, setOverhang] = useState(24); // pixels
  const [material, setMaterial] = useState('asphalt-shingle');
  const [height, setHeight] = useState(120); // pixels

  const roofTypes = [
    { id: 'gable', name: 'Gable Roof', icon: Triangle, description: 'Two sloping sides that meet at a ridge' },
    { id: 'hip', name: 'Hip Roof', icon: Home, description: 'Four sloping sides that meet at a point or ridge' },
    { id: 'flat', name: 'Flat Roof', icon: Square, description: 'Minimal slope, appears flat' },
    { id: 'shed', name: 'Shed Roof', icon: Triangle, description: 'Single sloping surface' },
  ];

  const materials = [
    { id: 'asphalt-shingle', name: 'Asphalt Shingle', color: '#2F4F4F' },
    { id: 'clay-tile', name: 'Clay Tile', color: '#CD853F' },
    { id: 'metal-roof', name: 'Metal Roofing', color: '#708090' },
    { id: 'slate', name: 'Slate', color: '#2F2F2F' },
    { id: 'wood-shake', name: 'Wood Shake', color: '#8B4513' },
    { id: 'concrete-tile', name: 'Concrete Tile', color: '#A0A0A0' },
  ];

  const generateRoofPoints = (): number[] => {
    if (wallOutline.length < 3) return [];

    // Calculate bounding box of wall outline
    const minX = Math.min(...wallOutline.map(p => p.x));
    const maxX = Math.max(...wallOutline.map(p => p.x));
    const minY = Math.min(...wallOutline.map(p => p.y));
    const maxY = Math.max(...wallOutline.map(p => p.y));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Generate roof outline based on type
    let roofPoints: number[] = [];

    switch (roofType) {
      case 'flat':
        // Flat roof - just the wall outline with overhang
        wallOutline.forEach(point => {
          const dx = point.x - centerX;
          const dy = point.y - centerY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const normalizedX = dx / length;
          const normalizedY = dy / length;
          
          roofPoints.push(
            point.x + normalizedX * overhang,
            point.y + normalizedY * overhang
          );
        });
        break;

      case 'gable':
        // Gable roof - ridge line parallel to longest wall
        const width = maxX - minX;
        const depth = maxY - minY;
        const isWideBuilding = width > depth;
        
        if (isWideBuilding) {
          // Ridge runs east-west
          roofPoints = [
            minX - overhang, minY - overhang,
            maxX + overhang, minY - overhang,
            maxX + overhang, maxY + overhang,
            minX - overhang, maxY + overhang
          ];
        } else {
          // Ridge runs north-south
          roofPoints = [
            minX - overhang, minY - overhang,
            maxX + overhang, minY - overhang,
            maxX + overhang, maxY + overhang,
            minX - overhang, maxY + overhang
          ];
        }
        break;

      case 'hip':
        // Hip roof - slopes on all sides
        roofPoints = [
          minX - overhang, minY - overhang,
          maxX + overhang, minY - overhang,
          maxX + overhang, maxY + overhang,
          minX - overhang, maxY + overhang
        ];
        break;

      case 'shed':
        // Shed roof - single slope
        roofPoints = [
          minX - overhang, minY - overhang,
          maxX + overhang, minY - overhang,
          maxX + overhang, maxY + overhang,
          minX - overhang, maxY + overhang
        ];
        break;
    }

    return roofPoints;
  };

  const handleCreateRoof = () => {
    const roofPoints = generateRoofPoints();
    
    onRoofComplete({
      type: roofType,
      pitch,
      overhang,
      material,
      height,
      points: roofPoints
    });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Create Roof</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Roof Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Roof Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roofTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setRoofType(type.id as 'gable' | 'hip' | 'flat' | 'shed')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      roofType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon size={20} className={roofType === type.id ? 'text-blue-500' : 'text-gray-400'} />
                      <span className="font-medium text-gray-900">{type.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Roof Parameters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pitch: {pitch}°
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full"
                disabled={roofType === 'flat'}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Flat (0°)</span>
                <span>Steep (60°)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overhang: {overhang}&quot;
              </label>
              <input
                type="range"
                min="0"
                max="48"
                value={overhang}
                onChange={(e) => setOverhang(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>None (0&quot;)</span>
                <span>Large (48&quot;)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ridge Height: {height}px
            </label>
            <input
              type="range"
              min="60"
              max="300"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full"
              disabled={roofType === 'flat'}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (60px)</span>
              <span>High (300px)</span>
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Roofing Material
            </label>
            <div className="grid grid-cols-3 gap-2">
              {materials.map(mat => (
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
                    className="w-full h-8 rounded mb-2"
                    style={{ backgroundColor: mat.color }}
                  />
                  <span className="text-xs font-medium text-gray-900">{mat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
            <div className="bg-white border rounded p-4 text-center">
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Type:</strong> {roofTypes.find(t => t.id === roofType)?.name}</div>
                <div><strong>Pitch:</strong> {pitch}°</div>
                <div><strong>Overhang:</strong> {overhang}&quot;</div>
                <div><strong>Material:</strong> {selectedMaterial?.name}</div>
                {roofType !== 'flat' && <div><strong>Height:</strong> {height}px</div>}
              </div>
            </div>
          </div>

          {/* Building Outline Info */}
          {wallOutline.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Building Outline:</strong> {wallOutline.length} points detected
              </p>
              <p className="text-xs text-blue-600 mt-1">
                The roof will be automatically generated based on your building&apos;s outline.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRoof}
            disabled={wallOutline.length < 3}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Roof
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoofTool;