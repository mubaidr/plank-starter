"use client";
import React, { useState } from 'react';
import { Home, X, Calculator } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Room {
  id: string;
  name: string;
  type: string;
  points: Point[];
  area: number;
  floorMaterial: string;
  ceilingHeight: number;
}

interface RoomToolProps {
  points: Point[];
  onComplete: (room: Omit<Room, 'id' | 'area'>) => void;
  onCancel: () => void;
  pixelsPerUnit?: number;
  unit?: string;
}

const RoomTool: React.FC<RoomToolProps> = ({
  points,
  onComplete,
  onCancel,
  pixelsPerUnit = 20,
  unit = 'ft'
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('living-room');
  const [floorMaterial, setFloorMaterial] = useState('hardwood');
  const [ceilingHeight, setCeilingHeight] = useState(9);

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
    return area / (pixelsPerUnit * pixelsPerUnit);
  };

  const area = calculateArea();

  const handleSubmit = () => {
    if (name.trim() && points.length >= 3) {
      onComplete({
        name: name.trim(),
        type,
        points,
        floorMaterial,
        ceilingHeight
      });
    }
  };

  const roomTypes = [
    { value: 'living-room', label: 'Living Room' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'dining-room', label: 'Dining Room' },
    { value: 'office', label: 'Office' },
    { value: 'closet', label: 'Closet' },
    { value: 'hallway', label: 'Hallway' },
    { value: 'garage', label: 'Garage' },
    { value: 'other', label: 'Other' }
  ];

  const floorMaterials = [
    { value: 'hardwood', label: 'Hardwood' },
    { value: 'tile', label: 'Tile' },
    { value: 'carpet', label: 'Carpet' },
    { value: 'laminate', label: 'Laminate' },
    { value: 'vinyl', label: 'Vinyl' },
    { value: 'concrete', label: 'Concrete' },
    { value: 'stone', label: 'Stone' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Define Room</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Master Bedroom"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Room Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-select"
            >
              {roomTypes.map(roomType => (
                <option key={roomType.value} value={roomType.value}>
                  {roomType.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Floor Material</label>
            <select
              value={floorMaterial}
              onChange={(e) => setFloorMaterial(e.target.value)}
              className="form-select"
            >
              {floorMaterials.map(material => (
                <option key={material.value} value={material.value}>
                  {material.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Ceiling Height ({unit})</label>
            <input
              type="number"
              value={ceilingHeight}
              onChange={(e) => setCeilingHeight(Number(e.target.value))}
              min="6"
              max="20"
              step="0.5"
              className="form-input"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Calculated Area</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {area.toFixed(2)} {unit}²
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {points.length} points defined
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || points.length < 3}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomTool;