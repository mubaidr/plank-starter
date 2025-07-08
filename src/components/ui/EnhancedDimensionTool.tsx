"use client";
import React, { useState, useCallback } from 'react';
import { Ruler, X, Angle, Square, Circle } from 'lucide-react';

interface Dimension {
  id: string;
  type: 'linear' | 'angular' | 'area' | 'radius';
  startPoint: { x: number; y: number };
  endPoint?: { x: number; y: number };
  centerPoint?: { x: number; y: number };
  points?: Array<{ x: number; y: number }>;
  value: number;
  label: string;
  units: 'px' | 'ft' | 'in' | 'm' | 'cm';
  style: {
    showExtensionLines: boolean;
    extensionLineLength: number;
    textPosition: 'above' | 'below' | 'center';
    arrowStyle: 'arrow' | 'dot' | 'slash';
    color: string;
  };
}

interface EnhancedDimensionToolProps {
  onClose: () => void;
  onDimensionAdd: (dimension: Dimension) => void;
  onStartMeasuring: (type: 'linear' | 'angular' | 'area' | 'radius') => void;
  isActive: boolean;
  currentMeasurementType?: 'linear' | 'angular' | 'area' | 'radius';
  pixelsPerUnit?: number;
}

const EnhancedDimensionTool: React.FC<EnhancedDimensionToolProps> = ({ 
  onClose, 
  // onDimensionAdd, 
  onStartMeasuring, 
  isActive,
  currentMeasurementType,
  pixelsPerUnit = 20
}) => {
  const [dimensionUnits, setDimensionUnits] = useState<'px' | 'ft' | 'in' | 'm' | 'cm'>('ft');
  const [showExtensionLines, setShowExtensionLines] = useState(true);
  const [extensionLineLength, setExtensionLineLength] = useState(15);
  const [textPosition, setTextPosition] = useState<'above' | 'below' | 'center'>('above');
  const [arrowStyle, setArrowStyle] = useState<'arrow' | 'dot' | 'slash'>('arrow');
  const [dimensionColor, setDimensionColor] = useState('#EF4444');
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<'linear' | 'angular' | 'area' | 'radius'>('linear');
  const [precision, setPrecision] = useState(2);

  const measurementTypes = [
    {
      id: 'linear',
      name: 'Linear Dimension',
      icon: Ruler,
      description: 'Measure distance between two points',
      instructions: 'Click two points to measure distance'
    },
    {
      id: 'angular',
      name: 'Angular Dimension',
      icon: Angle,
      description: 'Measure angle between three points',
      instructions: 'Click center point, then two end points'
    },
    {
      id: 'area',
      name: 'Area Calculation',
      icon: Square,
      description: 'Calculate area of a polygon',
      instructions: 'Click points to define polygon, double-click to finish'
    },
    {
      id: 'radius',
      name: 'Radius Dimension',
      icon: Circle,
      description: 'Measure radius of a circle',
      instructions: 'Click center point, then edge point'
    }
  ];

  const handleStartMeasuring = useCallback((type: 'linear' | 'angular' | 'area' | 'radius') => {
    setSelectedMeasurementType(type);
    onStartMeasuring(type);
  }, [onStartMeasuring]);

  const formatDimensionValue = (value: number, units: string): string => {
    const unitConversions = {
      px: 1,
      ft: pixelsPerUnit,
      in: pixelsPerUnit / 12,
      m: pixelsPerUnit * 3.28084,
      cm: pixelsPerUnit * 3.28084 / 100
    };

    const conversion = unitConversions[units as keyof typeof unitConversions] || 1;
    const convertedValue = value / conversion;

    if (units === 'ft') {
      const feet = Math.floor(convertedValue);
      const inches = Math.round((convertedValue - feet) * 12);
      if (inches === 0) {
        return `${feet}'`;
      } else if (feet === 0) {
        return `${inches}"`;
      } else {
        return `${feet}'-${inches}"`;
      }
    } else if (units === 'in') {
      return `${convertedValue.toFixed(precision)}"`;
    } else if (units === 'm') {
      return `${convertedValue.toFixed(precision)}m`;
    } else if (units === 'cm') {
      return `${convertedValue.toFixed(precision)}cm`;
    } else {
      return `${convertedValue.toFixed(precision)}px`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Dimension Tools</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Measurement Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Measurement Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {measurementTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleStartMeasuring(type.id as typeof selectedMeasurementType)}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedMeasurementType === type.id || currentMeasurementType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <IconComponent className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">{type.name}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{type.description}</p>
                    <p className="text-xs text-blue-600 font-medium">{type.instructions}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Measurement Status */}
          {isActive && currentMeasurementType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-900">
                  {measurementTypes.find(t => t.id === currentMeasurementType)?.name} Active
                </span>
              </div>
              <p className="text-xs text-blue-700">
                {measurementTypes.find(t => t.id === currentMeasurementType)?.instructions}
              </p>
            </div>
          )}

          {/* Dimension Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dimension Settings
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Units
                </label>
                <select
                  value={dimensionUnits}
                  onChange={(e) => setDimensionUnits(e.target.value as typeof dimensionUnits)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="ft">Feet (ft)</option>
                  <option value="in">Inches (in)</option>
                  <option value="m">Meters (m)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="px">Pixels (px)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Precision
                </label>
                <select
                  value={precision}
                  onChange={(e) => setPrecision(Number(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="0">0 decimals</option>
                  <option value="1">1 decimal</option>
                  <option value="2">2 decimals</option>
                  <option value="3">3 decimals</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Text Position
                </label>
                <select
                  value={textPosition}
                  onChange={(e) => setTextPosition(e.target.value as typeof textPosition)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="above">Above</option>
                  <option value="center">Center</option>
                  <option value="below">Below</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Arrow Style
                </label>
                <select
                  value={arrowStyle}
                  onChange={(e) => setArrowStyle(e.target.value as typeof arrowStyle)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="arrow">Arrow</option>
                  <option value="dot">Dot</option>
                  <option value="slash">Slash</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Dimension Color
                </label>
                <input
                  type="color"
                  value={dimensionColor}
                  onChange={(e) => setDimensionColor(e.target.value)}
                  className="w-full h-8 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Extension Length: {extensionLineLength}px
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={extensionLineLength}
                  onChange={(e) => setExtensionLineLength(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showExtensionLines}
                  onChange={(e) => setShowExtensionLines(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Show Extension Lines</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Preview Settings</h4>
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Units:</strong> {dimensionUnits}</div>
                <div><strong>Precision:</strong> {precision} decimal places</div>
                <div><strong>Text Position:</strong> {textPosition}</div>
                <div><strong>Arrow Style:</strong> {arrowStyle}</div>
                <div><strong>Extension Lines:</strong> {showExtensionLines ? 'Enabled' : 'Disabled'}</div>
                <div className="flex items-center space-x-2">
                  <strong>Color:</strong>
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: dimensionColor }}
                  />
                  <span>{dimensionColor}</span>
                </div>
              </div>
              
              {/* Sample dimension preview */}
              <div className="mt-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Sample: 10 ft dimension</div>
                <div className="relative inline-block">
                  <div
                    className="h-0.5 w-20"
                    style={{ backgroundColor: dimensionColor }}
                  />
                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 text-xs font-medium ${
                      textPosition === 'above' ? '-top-4' : 
                      textPosition === 'below' ? 'top-1' : 
                      '-top-1.5'
                    }`}
                    style={{ color: dimensionColor }}
                  >
                    {formatDimensionValue(200, dimensionUnits)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">How to Use</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p>• <strong>Linear:</strong> Click two points to measure distance</p>
              <p>• <strong>Angular:</strong> Click center point, then two end points for angle</p>
              <p>• <strong>Area:</strong> Click multiple points to define polygon, double-click to finish</p>
              <p>• <strong>Radius:</strong> Click center point, then edge point for radius</p>
              <p>• Press <strong>Escape</strong> to cancel current measurement</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
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

export default EnhancedDimensionTool;