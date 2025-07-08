"use client";
import React from 'react';
import { Calculator, X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface AreaCalculatorProps {
  points: Point[];
  onClose: () => void;
  pixelsPerUnit?: number;
  unit?: string;
}

const AreaCalculator: React.FC<AreaCalculatorProps> = ({
  points,
  onClose,
  pixelsPerUnit = 20, // 20 pixels = 1 unit
  unit = 'ft'
}) => {
  const calculateArea = () => {
    if (points.length < 3) return 0;
    
    // Using the shoelace formula for polygon area
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Convert from pixels to real units
    const realArea = area / (pixelsPerUnit * pixelsPerUnit);
    return realArea;
  };

  const calculatePerimeter = () => {
    if (points.length < 2) return 0;
    
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    
    // Convert from pixels to real units
    return perimeter / pixelsPerUnit;
  };

  const area = calculateArea();
  const perimeter = calculatePerimeter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Area Calculation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">Area</div>
            <div className="text-2xl font-bold text-blue-900">
              {area.toFixed(2)} {unit}²
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Perimeter</div>
            <div className="text-xl font-semibold text-green-900">
              {perimeter.toFixed(2)} {unit}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 font-medium mb-2">Details</div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Points: {points.length}</div>
              <div>Scale: {pixelsPerUnit} pixels = 1 {unit}</div>
              <div>Area in pixels: {(area * pixelsPerUnit * pixelsPerUnit).toFixed(0)} px²</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaCalculator;