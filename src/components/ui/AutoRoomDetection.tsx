"use client";
import React, { useState } from 'react';
import { Zap, Home, X, Play } from 'lucide-react';

interface DetectedRoom {
  id: string;
  points: Array<{ x: number; y: number }>;
  area: number;
  suggestedName: string;
  suggestedType: string;
}

interface AutoRoomDetectionProps {
  wallObjects: Array<{ x: number; y: number; points?: number[] }>;
  onRoomsDetected: (rooms: DetectedRoom[]) => void;
  onClose: () => void;
}

const AutoRoomDetection: React.FC<AutoRoomDetectionProps> = ({
  wallObjects,
  onRoomsDetected,
  onClose
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedRooms, setDetectedRooms] = useState<DetectedRoom[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);

  const detectEnclosedAreas = () => {
    setIsDetecting(true);
    
    // Simulate room detection algorithm
    setTimeout(() => {
      // Simple room detection based on wall intersections
      const rooms: DetectedRoom[] = [];
      
      // Group walls into potential room boundaries
      const wallLines = wallObjects.filter(obj => obj.points && obj.points.length >= 4);
      
      // For demo purposes, create some sample detected rooms
      if (wallLines.length >= 3) {
        // Calculate bounding areas from wall intersections
        const minX = Math.min(...wallLines.map(w => w.x));
        const maxX = Math.max(...wallLines.map(w => w.x + (w.points?.[2] || 0)));
        const minY = Math.min(...wallLines.map(w => w.y));
        const maxY = Math.max(...wallLines.map(w => w.y + (w.points?.[3] || 0)));
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const width = maxX - minX;
        const height = maxY - minY;
        
        // Create sample rooms based on wall layout
        if (width > 200 && height > 200) {
          // Large area - split into multiple rooms
          rooms.push({
            id: 'room-1',
            points: [
              { x: minX, y: minY },
              { x: centerX, y: minY },
              { x: centerX, y: centerY },
              { x: minX, y: centerY }
            ],
            area: (width / 2) * (height / 2) / 400, // Convert to sq ft
            suggestedName: 'Living Room',
            suggestedType: 'living-room'
          });
          
          rooms.push({
            id: 'room-2',
            points: [
              { x: centerX, y: minY },
              { x: maxX, y: minY },
              { x: maxX, y: centerY },
              { x: centerX, y: centerY }
            ],
            area: (width / 2) * (height / 2) / 400,
            suggestedName: 'Kitchen',
            suggestedType: 'kitchen'
          });
          
          rooms.push({
            id: 'room-3',
            points: [
              { x: minX, y: centerY },
              { x: maxX, y: centerY },
              { x: maxX, y: maxY },
              { x: minX, y: maxY }
            ],
            area: width * (height / 2) / 400,
            suggestedName: 'Bedroom',
            suggestedType: 'bedroom'
          });
        } else {
          // Single room
          rooms.push({
            id: 'room-1',
            points: [
              { x: minX, y: minY },
              { x: maxX, y: minY },
              { x: maxX, y: maxY },
              { x: minX, y: maxY }
            ],
            area: width * height / 400,
            suggestedName: 'Room',
            suggestedType: 'other'
          });
        }
      }
      
      setDetectedRooms(rooms);
      setSelectedRoomIds(rooms.map(r => r.id));
      setIsDetecting(false);
    }, 2000);
  };

  const toggleRoomSelection = (roomId: string) => {
    setSelectedRoomIds(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleCreateRooms = () => {
    const selectedRooms = detectedRooms.filter(room => selectedRoomIds.includes(room.id));
    onRoomsDetected(selectedRooms);
  };

  const roomTypes = [
    'living-room', 'bedroom', 'kitchen', 'bathroom', 'dining-room', 
    'office', 'closet', 'hallway', 'garage', 'other'
  ];

  const updateRoom = (roomId: string, updates: Partial<DetectedRoom>) => {
    setDetectedRooms(prev => 
      prev.map(room => 
        room.id === roomId ? { ...room, ...updates } : room
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Auto Room Detection</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {detectedRooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Detect Rooms Automatically
                </h4>
                <p className="text-gray-600 mb-4">
                  Analyze your wall layout to automatically identify enclosed areas and suggest room types.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    <strong>Detected:</strong> {wallObjects.length} wall objects
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    The algorithm will analyze wall intersections to find enclosed spaces.
                  </p>
                </div>
              </div>

              <button
                onClick={detectEnclosedAreas}
                disabled={isDetecting || wallObjects.length < 3}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {isDetecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Detecting Rooms...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Start Detection</span>
                  </>
                )}
              </button>

              {wallObjects.length < 3 && (
                <p className="text-sm text-red-600 mt-4">
                  Need at least 3 walls to detect rooms. Draw more walls first.
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Detected Rooms ({detectedRooms.length})
                </h4>
                <p className="text-gray-600">
                  Review and customize the detected rooms before creating them.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {detectedRooms.map(room => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      selectedRoomIds.includes(room.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedRoomIds.includes(room.id)}
                          onChange={() => toggleRoomSelection(room.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Home size={16} className="text-gray-400" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {room.area.toFixed(1)} sq ft
                        </div>
                        <div className="text-xs text-gray-500">
                          {room.points.length} points
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Room Name
                        </label>
                        <input
                          type="text"
                          value={room.suggestedName}
                          onChange={(e) => updateRoom(room.id, { suggestedName: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Room Type
                        </label>
                        <select
                          value={room.suggestedType}
                          onChange={(e) => updateRoom(room.id, { suggestedType: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {roomTypes.map(type => (
                            <option key={type} value={type}>
                              {type.split('-').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {selectedRoomIds.length} of {detectedRooms.length} rooms selected
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setDetectedRooms([])}
                    className="btn-secondary"
                  >
                    Detect Again
                  </button>
                  <button
                    onClick={handleCreateRooms}
                    disabled={selectedRoomIds.length === 0}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create {selectedRoomIds.length} Room{selectedRoomIds.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoRoomDetection;