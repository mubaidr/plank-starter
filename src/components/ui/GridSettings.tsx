"use client";
import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';

interface GridSettingsProps {
  gridSize: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  onGridSizeChange: (size: number) => void;
  onGridVisibleChange: (visible: boolean) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onClose: () => void;
}

const GridSettings: React.FC<GridSettingsProps> = ({
  gridSize,
  gridVisible,
  snapToGrid,
  onGridSizeChange,
  onGridVisibleChange,
  onSnapToGridChange,
  onClose
}) => {
  const [tempGridSize, setTempGridSize] = useState(gridSize);

  const handleApply = () => {
    onGridSizeChange(tempGridSize);
    onClose();
  };

  const gridSizeOptions = [
    { value: 10, label: '10px (Fine)' },
    { value: 20, label: '20px (Default)' },
    { value: 25, label: '25px (Medium)' },
    { value: 50, label: '50px (Large)' },
    { value: 100, label: '100px (Extra Large)' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Grid Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Show Grid
            </label>
            <button
              onClick={() => onGridVisibleChange(!gridVisible)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                gridVisible ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  gridVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Snap to Grid
            </label>
            <button
              onClick={() => onSnapToGridChange(!snapToGrid)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                snapToGrid ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  snapToGrid ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grid Size
            </label>
            <select
              value={tempGridSize}
              onChange={(e) => setTempGridSize(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {gridSizeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">
              <div>Current: {gridSize}px</div>
              <div>Preview: {tempGridSize}px</div>
              <div className="mt-2">
                Grid spacing affects snap-to-grid precision and visual density.
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

export default GridSettings;