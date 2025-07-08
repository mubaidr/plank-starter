"use client";
import React, { useState } from 'react';
import { Ruler, X, Settings, Calculator } from 'lucide-react';

interface Measurement {
  id: string;
  type: 'linear' | 'angular' | 'area' | 'radius';
  startPoint: { x: number; y: number };
  endPoint?: { x: number; y: number };
  centerPoint?: { x: number; y: number };
  points?: Array<{ x: number; y: number }>;
  value: number;
  label: string;
  units: 'px' | 'ft' | 'in' | 'm' | 'cm';
  precision: number;
  style: {
    showExtensionLines: boolean;
    extensionLineLength: number;
    textPosition: 'above' | 'below' | 'center';
    arrowStyle: 'arrow' | 'dot' | 'slash';
    color: string;
  };
}

interface MeasurementToolProps {
  measurements: Measurement[];
  onMeasurementsChange: (measurements: Measurement[]) => void;
  onClose: () => void;
  pixelsPerUnit: number;
  defaultUnit: string;
}

const MeasurementTool: React.FC<MeasurementToolProps> = ({
  measurements,
  onMeasurementsChange,
  onClose,
  pixelsPerUnit = 20,
  defaultUnit = 'ft'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);
  const [measurementSettings, setMeasurementSettings] = useState({
    units: defaultUnit as 'px' | 'ft' | 'in' | 'm' | 'cm',
    precision: 2,
    showExtensionLines: true,
    extensionLineLength: 20,
    textPosition: 'above' as 'above' | 'below' | 'center',
    arrowStyle: 'arrow' as 'arrow' | 'dot' | 'slash',
    color: '#EF4444',
    autoLabel: true
  });

  const unitConversions = {
    px: 1,
    ft: pixelsPerUnit,
    in: pixelsPerUnit / 12,
    m: pixelsPerUnit * 3.28084,
    cm: pixelsPerUnit * 3.28084 / 100
  };

  const convertPixelsToUnits = (pixels: number, targetUnit: string): number => {
    const conversion = unitConversions[targetUnit as keyof typeof unitConversions] || 1;
    return pixels / conversion;
  };

  // const formatMeasurement = (value: number, units: string, precision: number): string => {
    const convertedValue = convertPixelsToUnits(value, units);
    
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

  // const calculateLinearDistance = (start: { x: number; y: number }, end: { x: number; y: number }): number => {
  //   return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  // };

  // const calculateAngle = (center: { x: number; y: number }, point1: { x: number; y: number }, point2: { x: number; y: number }): number => {
  //   const angle1 = Math.atan2(point1.y - center.y, point1.x - center.x);
  //   const angle2 = Math.atan2(point2.y - center.y, point2.x - center.x);
  //   let angle = Math.abs(angle2 - angle1);
  //   if (angle > Math.PI) angle = 2 * Math.PI - angle;
  //   return angle * (180 / Math.PI);
  // };

  // const calculatePolygonArea = (points: Array<{ x: number; y: number }>): number => {
  //   if (points.length < 3) return 0;
  //   let area = 0;
  //   for (let i = 0; i < points.length; i++) {
  //     const j = (i + 1) % points.length;
  //     area += points[i].x * points[j].y;
  //     area -= points[j].x * points[i].y;
  //   }
  //   return Math.abs(area) / 2;
  // };

  const deleteMeasurement = (id: string) => {
    onMeasurementsChange(measurements.filter(m => m.id !== id));
  };

  const updateMeasurementStyle = (id: string, styleUpdates: Partial<Measurement['style']>) => {
    const updatedMeasurements = measurements.map(m => 
      m.id === id 
        ? { ...m, style: { ...m.style, ...styleUpdates } }
        : m
    );
    onMeasurementsChange(updatedMeasurements);
  };

  const getMeasurementStats = () => {
    const stats = {
      total: measurements.length,
      linear: measurements.filter(m => m.type === 'linear').length,
      angular: measurements.filter(m => m.type === 'angular').length,
      area: measurements.filter(m => m.type === 'area').length,
      radius: measurements.filter(m => m.type === 'radius').length
    };
    return stats;
  };

  const stats = getMeasurementStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Measurements & Dimensions</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-md transition-colors ${
                showSettings ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Measurement Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Measurements List */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Measurements</h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-blue-50 rounded p-2 text-center">
                  <div className="font-semibold text-blue-900">{stats.total}</div>
                  <div className="text-blue-600">Total</div>
                </div>
                <div className="bg-green-50 rounded p-2 text-center">
                  <div className="font-semibold text-green-900">{stats.linear}</div>
                  <div className="text-green-600">Linear</div>
                </div>
                <div className="bg-purple-50 rounded p-2 text-center">
                  <div className="font-semibold text-purple-900">{stats.angular}</div>
                  <div className="text-purple-600">Angular</div>
                </div>
                <div className="bg-orange-50 rounded p-2 text-center">
                  <div className="font-semibold text-orange-900">{stats.area}</div>
                  <div className="text-orange-600">Area</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {measurements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No measurements yet</p>
                  <p className="text-xs">Use the measure tool to add dimensions</p>
                </div>
              ) : (
                measurements.map((measurement) => (
                  <div
                    key={measurement.id}
                    className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                      selectedMeasurement === measurement.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMeasurement(
                      selectedMeasurement === measurement.id ? null : measurement.id
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: measurement.style.color }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {measurement.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">
                          {measurement.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMeasurement(measurement.id);
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete measurement"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {selectedMeasurement === measurement.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-gray-600 mb-1">Color</label>
                            <input
                              type="color"
                              value={measurement.style.color}
                              onChange={(e) => updateMeasurementStyle(measurement.id, { color: e.target.value })}
                              className="w-full h-6 rounded border"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">Text Position</label>
                            <select
                              value={measurement.style.textPosition}
                              onChange={(e) => updateMeasurementStyle(measurement.id, { 
                                textPosition: e.target.value as 'above' | 'below' | 'center' 
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                              <option value="above">Above</option>
                              <option value="center">Center</option>
                              <option value="below">Below</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">Arrow Style</label>
                            <select
                              value={measurement.style.arrowStyle}
                              onChange={(e) => updateMeasurementStyle(measurement.id, { 
                                arrowStyle: e.target.value as 'arrow' | 'dot' | 'slash' 
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                              <option value="arrow">Arrow</option>
                              <option value="dot">Dot</option>
                              <option value="slash">Slash</option>
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={measurement.style.showExtensionLines}
                                onChange={(e) => updateMeasurementStyle(measurement.id, { 
                                  showExtensionLines: e.target.checked 
                                })}
                                className="rounded"
                              />
                              <span className="text-gray-600">Extension Lines</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="w-80 border-l border-gray-200 p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-4">Default Settings</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Default Units
                  </label>
                  <select
                    value={measurementSettings.units}
                    onChange={(e) => setMeasurementSettings(prev => ({ 
                      ...prev, 
                      units: e.target.value as typeof prev.units 
                    }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
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
                    Precision: {measurementSettings.precision} decimal places
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={measurementSettings.precision}
                    onChange={(e) => setMeasurementSettings(prev => ({ 
                      ...prev, 
                      precision: Number(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Default Color
                  </label>
                  <input
                    type="color"
                    value={measurementSettings.color}
                    onChange={(e) => setMeasurementSettings(prev => ({ 
                      ...prev, 
                      color: e.target.value 
                    }))}
                    className="w-full h-8 rounded border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={measurementSettings.showExtensionLines}
                      onChange={(e) => setMeasurementSettings(prev => ({ 
                        ...prev, 
                        showExtensionLines: e.target.checked 
                      }))}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-700">Show Extension Lines</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={measurementSettings.autoLabel}
                      onChange={(e) => setMeasurementSettings(prev => ({ 
                        ...prev, 
                        autoLabel: e.target.checked 
                      }))}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-700">Auto-generate Labels</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Extension Line Length: {measurementSettings.extensionLineLength}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={measurementSettings.extensionLineLength}
                    onChange={(e) => setMeasurementSettings(prev => ({ 
                      ...prev, 
                      extensionLineLength: Number(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Quick Actions</h5>
                <div className="space-y-2">
                  <button
                    onClick={() => onMeasurementsChange([])}
                    className="w-full text-xs px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Clear All Measurements
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {measurements.length} measurement{measurements.length !== 1 ? 's' : ''} • 
            Scale: {pixelsPerUnit}px = 1{defaultUnit}
          </div>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasurementTool;