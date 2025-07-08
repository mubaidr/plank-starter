"use client";
import React, { useState } from 'react';
import { Eye, Compass, X, RotateCw } from 'lucide-react';

interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  ceilingHeight?: number;
}

interface ElevationViewsProps {
  objects: CanvasObject[];
  onClose: () => void;
}

type ElevationDirection = 'front' | 'left' | 'right' | 'back';

const ElevationViews: React.FC<ElevationViewsProps> = ({ objects, onClose }) => {
  const [activeView, setActiveView] = useState<ElevationDirection>('front');

  const elevationDirections = [
    { id: 'front' as ElevationDirection, name: 'Front Elevation', angle: 0 },
    { id: 'right' as ElevationDirection, name: 'Right Elevation', angle: 90 },
    { id: 'back' as ElevationDirection, name: 'Back Elevation', angle: 180 },
    { id: 'left' as ElevationDirection, name: 'Left Elevation', angle: 270 }
  ];

  // Generate elevation view based on 2D objects
  const generateElevationView = () => {
    const walls = objects.filter(obj => obj.type === 'line');
    const doors = objects.filter(obj => obj.type === 'door');
    const windows = objects.filter(obj => obj.type === 'window');
    
    // For demo purposes, create a simplified elevation view
    const elevationElements = [];
    
    // Add walls as vertical lines
    walls.forEach((wall, index) => {
      const height = 120; // Default wall height
      elevationElements.push({
        type: 'wall',
        x: wall.x / 4, // Scale down for elevation view
        y: 200 - height,
        width: Math.abs(wall.points?.[2] || 100) / 4,
        height: height,
        id: `elevation-wall-${index}`
      });
    });

    // Add doors
    doors.forEach((door, index) => {
      elevationElements.push({
        type: 'door',
        x: door.x / 4,
        y: 200 - 100,
        width: (door.width || 80) / 4,
        height: 100,
        id: `elevation-door-${index}`
      });
    });

    // Add windows
    windows.forEach((window, index) => {
      elevationElements.push({
        type: 'window',
        x: window.x / 4,
        y: 200 - 80,
        width: (window.width || 80) / 4,
        height: 60,
        id: `elevation-window-${index}`
      });
    });

    return elevationElements;
  };

  const currentElevation = generateElevationView(activeView);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Elevation Views</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex">
          {/* View Selection Sidebar */}
          <div className="w-48 border-r border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select View</h4>
            <div className="space-y-2">
              {elevationDirections.map(direction => (
                <button
                  key={direction.id}
                  onClick={() => setActiveView(direction.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center space-x-2 ${
                    activeView === direction.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Compass size={16} />
                  <span>{direction.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-xs font-medium text-gray-700 mb-2">View Info</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Direction: {activeView}</div>
                <div>Elements: {currentElevation.length}</div>
                <div>Scale: 1:4</div>
              </div>
            </div>
          </div>

          {/* Elevation View Canvas */}
          <div className="flex-1 p-6">
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 h-96 relative overflow-hidden">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 400"
                className="absolute inset-0"
              >
                {/* Ground line */}
                <line
                  x1="0"
                  y1="350"
                  x2="800"
                  y2="350"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                
                {/* Render elevation elements */}
                {currentElevation.map(element => {
                  if (element.type === 'wall') {
                    return (
                      <rect
                        key={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill="#E5E7EB"
                        stroke="#6B7280"
                        strokeWidth="2"
                      />
                    );
                  } else if (element.type === 'door') {
                    return (
                      <g key={element.id}>
                        <rect
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill="#8B4513"
                          stroke="#654321"
                          strokeWidth="1"
                        />
                        <line
                          x1={element.x + element.width / 2}
                          y1={element.y}
                          x2={element.x + element.width / 2}
                          y2={element.y + element.height}
                          stroke="#654321"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  } else if (element.type === 'window') {
                    return (
                      <g key={element.id}>
                        <rect
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill="#87CEEB"
                          stroke="#4682B4"
                          strokeWidth="1"
                        />
                        <line
                          x1={element.x}
                          y1={element.y + element.height / 2}
                          x2={element.x + element.width}
                          y2={element.y + element.height / 2}
                          stroke="#4682B4"
                          strokeWidth="1"
                        />
                        <line
                          x1={element.x + element.width / 2}
                          y1={element.y}
                          x2={element.x + element.width / 2}
                          y2={element.y + element.height}
                          stroke="#4682B4"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  }
                  return null;
                })}

                {/* View direction indicator */}
                <text
                  x="20"
                  y="30"
                  fontSize="14"
                  fill="#6B7280"
                  fontWeight="bold"
                >
                  {elevationDirections.find(d => d.id === activeView)?.name}
                </text>
              </svg>

              {/* No content message */}
              {currentElevation.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No elevation data</p>
                    <p className="text-sm">Draw walls, doors, and windows to see elevation views</p>
                  </div>
                </div>
              )}
            </div>

            {/* View Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <button className="btn-secondary flex items-center space-x-1">
                  <RotateCw size={16} />
                  <span>Rotate View</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                Viewing: {elevationDirections.find(d => d.id === activeView)?.name}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200">
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

export default ElevationViews;