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

  const formatValue = (value: number, units: string, precision: number): string => {
    const convertedValue = value / pixelsPerUnit;
    return `${convertedValue.toFixed(precision)} ${units}`;
  };

  const deleteMeasurement = (id: string) => {
    const updatedMeasurements = measurements.filter(m => m.id !== id);
    onMeasurementsChange(updatedMeasurements);
  };

  const updateMeasurement = (id: string, updates: Partial<Measurement>) => {
    const updatedMeasurements = measurements.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    onMeasurementsChange(updatedMeasurements);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Measurement Tool</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Measurements ({measurements.length})</h3>
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Total: {measurements.length} measurements
                  </span>
                </div>
              </div>

              {measurements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Ruler className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No measurements yet</p>
                  <p className="text-sm">Use the measurement tools to add measurements</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {measurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedMeasurement === measurement.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMeasurement(
                        selectedMeasurement === measurement.id ? null : measurement.id
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium capitalize">
                            {measurement.type} Measurement
                          </div>
                          <div className="text-sm text-gray-600">
                            {measurement.label || formatValue(measurement.value, measurement.units, measurement.precision)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: measurement.style.color }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMeasurement(measurement.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showSettings && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-medium mb-4">Measurement Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Units</label>
                  <select
                    value={measurementSettings.units}
                    onChange={(e) => setMeasurementSettings(prev => ({
                      ...prev,
                      units: e.target.value as any
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="ft">Feet</option>
                    <option value="in">Inches</option>
                    <option value="m">Meters</option>
                    <option value="cm">Centimeters</option>
                    <option value="px">Pixels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Precision</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={measurementSettings.precision}
                    onChange={(e) => setMeasurementSettings(prev => ({
                      ...prev,
                      precision: parseInt(e.target.value)
                    }))}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="color"
                    value={measurementSettings.color}
                    onChange={(e) => setMeasurementSettings(prev => ({
                      ...prev,
                      color: e.target.value
                    }))}
                    className="w-full p-2 border rounded h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Text Position</label>
                  <select
                    value={measurementSettings.textPosition}
                    onChange={(e) => setMeasurementSettings(prev => ({
                      ...prev,
                      textPosition: e.target.value as any
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="above">Above</option>
                    <option value="center">Center</option>
                    <option value="below">Below</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Arrow Style</label>
                  <select
                    value={measurementSettings.arrowStyle}
                    onChange={(e) => setMeasurementSettings(prev => ({
                      ...prev,
                      arrowStyle: e.target.value as any
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    <option value="arrow">Arrow</option>
                    <option value="dot">Dot</option>
                    <option value="slash">Slash</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showExtensionLines"
                    checked={measurementSettings.showExtensionLines}
                    onChange={(e) => setMeasurementSettings(prev => ({
                      ...prev,
                      showExtensionLines: e.target.checked
                    }))}
                  />
                  <label htmlFor="showExtensionLines" className="text-sm">
                    Show Extension Lines
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoLabel"
                    checked={measurementSettings.autoLabel}
                    onChange={(e) => setMeasurementSettings(prev => ({
                      ...prev,
                      autoLabel: e.target.checked
                    }))}
                  />
                  <label htmlFor="autoLabel" className="text-sm">
                    Auto Label
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {measurements.length} measurement{measurements.length !== 1 ? 's' : ''} total
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