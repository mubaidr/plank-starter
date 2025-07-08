"use client";
import React, { useState } from 'react';
import { Home, Plus, Edit3, Trash2, X, Move, Square, Palette, Settings } from 'lucide-react';
import { RoomBoundary } from '@/hooks/useManualRoomDefinition';

interface RoomManagementPanelProps {
  rooms: RoomBoundary[];
  currentRoom: RoomBoundary | null;
  isDefiningRoom: boolean;
  onStartRoomDefinition: (name?: string) => void;
  onCompleteRoom: () => void;
  onCancelRoomDefinition: () => void;
  onRemoveRoom: (roomId: string) => void;
  onUpdateRoomName: (roomId: string, name: string) => void;
  onUpdateRoomProperties: (roomId: string, properties: Partial<RoomBoundary['properties']>) => void;
  onStartEditingRoom: (roomId: string) => void;
  onClose: () => void;
}

const RoomManagementPanel: React.FC<RoomManagementPanelProps> = ({
  rooms,
  currentRoom,
  isDefiningRoom,
  onStartRoomDefinition,
  onCompleteRoom,
  onCancelRoomDefinition,
  onRemoveRoom,
  onUpdateRoomName,
  onUpdateRoomProperties,
  onStartEditingRoom,
  onClose
}) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);

  const startNewRoom = () => {
    const name = newRoomName.trim() || undefined;
    onStartRoomDefinition(name);
    setNewRoomName('');
  };

  const startEditName = (room: RoomBoundary) => {
    setEditingRoomId(room.id);
    setEditingName(room.name);
  };

  const finishEditName = () => {
    if (editingRoomId && editingName.trim()) {
      onUpdateRoomName(editingRoomId, editingName.trim());
    }
    setEditingRoomId(null);
    setEditingName('');
  };

  const cancelEditName = () => {
    setEditingRoomId(null);
    setEditingName('');
  };

  const toggleRoomExpansion = (roomId: string) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const formatArea = (area: number): string => {
    return `${Math.round(area).toLocaleString()} sq px`;
  };

  const materials = [
    'Hardwood', 'Tile', 'Carpet', 'Concrete', 'Marble', 'Laminate', 'Vinyl'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Room Management</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Current Room Definition Status */}
          {isDefiningRoom && currentRoom && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900">
                  Defining: {currentRoom.name}
                </h3>
                <div className="flex space-x-2">
                  {currentRoom.points.length >= 3 && (
                    <button
                      onClick={onCompleteRoom}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={onCancelRoomDefinition}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className="text-xs text-blue-700">
                Points: {currentRoom.points.length} | 
                {currentRoom.points.length < 3 
                  ? ` Need ${3 - currentRoom.points.length} more points`
                  : ' Click near start point or press Enter to complete'
                }
              </div>
            </div>
          )}

          {/* Add New Room */}
          {!isDefiningRoom && (
            <div className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Create New Room</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name (optional)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') startNewRoom();
                  }}
                />
                <button
                  onClick={startNewRoom}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Start</span>
                </button>
              </div>
            </div>
          )}

          {/* Existing Rooms */}
          {rooms.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  Rooms ({rooms.length})
                </h3>
                <div className="text-xs text-gray-500">
                  Total Area: {formatArea(rooms.reduce((sum, room) => sum + (room.properties.area || 0), 0))}
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: room.color }}
                        />
                        {editingRoomId === room.id ? (
                          <div className="flex space-x-1 flex-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') finishEditName();
                                if (e.key === 'Escape') cancelEditName();
                              }}
                              autoFocus
                            />
                            <button
                              onClick={finishEditName}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEditName}
                              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{room.name}</div>
                            <div className="text-xs text-gray-500">
                              {room.properties.area ? formatArea(room.properties.area) : 'No area calculated'}
                              {room.properties.wallHeight && ` • ${room.properties.wallHeight}" walls`}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => toggleRoomExpansion(room.id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Room properties"
                        >
                          <Settings size={14} />
                        </button>
                        <button
                          onClick={() => startEditName(room)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit name"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => onStartEditingRoom(room.id)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Edit boundary"
                        >
                          <Move size={14} />
                        </button>
                        <button
                          onClick={() => onRemoveRoom(room.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Remove room"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Room Properties */}
                    {expandedRoom === room.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                        {/* Wall Height */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Wall Height (inches)
                          </label>
                          <input
                            type="number"
                            value={room.properties.wallHeight || 96}
                            onChange={(e) => onUpdateRoomProperties(room.id, { 
                              wallHeight: parseInt(e.target.value) || 96 
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="60"
                            max="240"
                          />
                        </div>

                        {/* Floor Material */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Floor Material
                          </label>
                          <select
                            value={room.properties.floorMaterial || ''}
                            onChange={(e) => onUpdateRoomProperties(room.id, { 
                              floorMaterial: e.target.value 
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select material...</option>
                            {materials.map(material => (
                              <option key={material} value={material}>{material}</option>
                            ))}
                          </select>
                        </div>

                        {/* Ceiling Material */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Ceiling Material
                          </label>
                          <select
                            value={room.properties.ceilingMaterial || ''}
                            onChange={(e) => onUpdateRoomProperties(room.id, { 
                              ceilingMaterial: e.target.value 
                            })}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select material...</option>
                            {materials.map(material => (
                              <option key={material} value={material}>{material}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-1">Instructions</h4>
            <div className="text-xs text-green-700 space-y-1">
              <div>• Click "Start" to begin defining a room boundary</div>
              <div>• Click points around the room perimeter</div>
              <div>• Click near the start point or press Enter to complete</div>
              <div>• Press Escape to cancel current room</div>
              <div>• <kbd className="bg-green-200 px-1 rounded">Ctrl+R</kbd> - Quick start new room</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManagementPanel;