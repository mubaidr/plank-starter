"use client";
import React, { useState } from 'react';
import { Ruler, X, Settings } from 'lucide-react';

interface DimensionLine {
  id: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  label: string;
  offset: number; // Distance from the measured line
  style: 'horizontal' | 'vertical' | 'aligned';
  units: 'px' | 'ft' | 'in' | 'm' | 'cm';
}

interface DimensionToolProps {
  dimensions: DimensionLine[];
  onDimensionsChange: (dimensions: DimensionLine[]) => void;
  pixelsPerUnit: number;
  defaultUnit: string;
}

const DimensionTool: React.FC<DimensionToolProps> = ({
  dimensions,
  onDimensionsChange,
  pixelsPerUnit = 20, // eslint-disable-line @typescript-eslint/no-unused-vars
  defaultUnit = 'ft'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [dimensionStyle, setDimensionStyle] = useState<'horizontal' | 'vertical' | 'aligned'>('aligned');
  const [dimensionOffset, setDimensionOffset] = useState(30);
  const [dimensionUnits, setDimensionUnits] = useState(defaultUnit);

  // const convertPixelsToUnits = (pixels: number, targetUnit: string): number => {
  //   const baseValue = pixels / pixelsPerUnit; // Convert to base units (feet)
  //   
  //   switch (targetUnit) {
  //     case 'in':
  //       return baseValue * 12;
  //     case 'm':
  //       return baseValue * 0.3048;
  //     case 'cm':
  //       return baseValue * 30.48;
  //     case 'px':
  //       return pixels;
  //     default: // 'ft'
  //       return baseValue;
  //   }
  // };

  // const formatDimension = (pixels: number, unit: string): string => {
  //   const value = convertPixelsToUnits(pixels, unit);
  //   
  //   if (unit === 'px') {
  //     return `${Math.round(value)}px`;
  //   } else if (unit === 'ft') {
  //     const feet = Math.floor(value);
  //     const inches = Math.round((value - feet) * 12);
  //     return inches > 0 ? `${feet}'-${inches}"` : `${feet}'`;
  //   } else if (unit === 'in') {
  //     return `${value.toFixed(1)}"`;
  //   } else if (unit === 'm') {
  //     return `${value.toFixed(2)}m`;
  //   } else if (unit === 'cm') {
  //     return `${value.toFixed(1)}cm`;
  //   }
  //   
  //   return `${value.toFixed(2)}${unit}`;
  // };

  // const createDimensionLine = (startPoint: { x: number; y: number }, endPoint: { x: number; y: number }): DimensionLine => {
  //   const distance = Math.sqrt(
  //     Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
  //   );
    
  //   return {
  //     id: `dim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  //     startPoint,
  //     endPoint,
  //     label: formatDimension(distance, dimensionUnits),
  //     offset: dimensionOffset,
  //     style: dimensionStyle,
  //     units: dimensionUnits as 'px' | 'ft' | 'in' | 'm' | 'cm'
  //   };
  // };

  const deleteDimension = (id: string) => {
    onDimensionsChange(dimensions.filter(dim => dim.id !== id));
  };

  const clearAllDimensions = () => {
    onDimensionsChange([]);
  };

  return (
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40 w-64">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Ruler className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900">Dimensions</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Style
            </label>
            <select
              value={dimensionStyle}
              onChange={(e) => setDimensionStyle(e.target.value as 'horizontal' | 'vertical' | 'aligned')}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="aligned">Aligned</option>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Units
            </label>
            <select
              value={dimensionUnits}
              onChange={(e) => setDimensionUnits(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ft">Feet</option>
              <option value="in">Inches</option>
              <option value="m">Meters</option>
              <option value="cm">Centimeters</option>
              <option value="px">Pixels</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Offset: {dimensionOffset}px
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={dimensionOffset}
              onChange={(e) => setDimensionOffset(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          Click two points to create a dimension line. Use the measurement tool to add dimensions.
        </p>
      </div>

      {/* Dimensions List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {dimensions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Ruler className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No dimensions created</p>
          </div>
        ) : (
          <>
            {dimensions.map((dimension) => (
              <div
                key={dimension.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {dimension.label}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {dimension.style} • {dimension.units}
                  </div>
                </div>
                <button
                  onClick={() => deleteDimension(dimension.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <button
              onClick={clearAllDimensions}
              className="w-full mt-2 px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          </>
        )}
      </div>

      {/* Current Settings Display */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Style: <span className="font-medium capitalize">{dimensionStyle}</span></div>
          <div>Units: <span className="font-medium">{dimensionUnits}</span></div>
          <div>Offset: <span className="font-medium">{dimensionOffset}px</span></div>
        </div>
      </div>
    </div>
  );
};

export default DimensionTool;