"use client";
import React, { useState } from 'react';
import { Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, X } from 'lucide-react';

interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
}

interface Floor {
  id: string;
  name: string;
  level: number;
  height: number;
  visible: boolean;
  locked: boolean;
  objects: CanvasObject[];
}

interface FloorManagerProps {
  floors: Floor[];
  activeFloorId: string;
  onFloorsChange: (floors: Floor[]) => void;
  onActiveFloorChange: (floorId: string) => void;
  onClose: () => void;
}

const FloorManager: React.FC<FloorManagerProps> = ({
  floors,
  activeFloorId,
  onFloorsChange,
  onActiveFloorChange,
  onClose
}) => {
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const addFloor = () => {
    const newFloor: Floor = {
      id: `floor-${Date.now()}`,
      name: `Floor ${floors.length + 1}`,
      level: floors.length,
      height: 10, // Default 10 feet
      visible: true,
      locked: false,
      objects: []
    };
    
    onFloorsChange([...floors, newFloor]);
  };

  const deleteFloor = (floorId: string) => {
    if (floors.length <= 1) {
      alert('Cannot delete the last floor');
      return;
    }
    
    const updatedFloors = floors.filter(f => f.id !== floorId);
    onFloorsChange(updatedFloors);
    
    // If we deleted the active floor, switch to the first available floor
    if (floorId === activeFloorId && updatedFloors.length > 0) {
      onActiveFloorChange(updatedFloors[0].id);
    }
  };

  const updateFloor = (floorId: string, updates: Partial<Floor>) => {
    const updatedFloors = floors.map(floor =>
      floor.id === floorId ? { ...floor, ...updates } : floor
    );
    onFloorsChange(updatedFloors);
  };

  const moveFloor = (floorId: string, direction: 'up' | 'down') => {
    const currentIndex = floors.findIndex(f => f.id === floorId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= floors.length) return;
    
    const updatedFloors = [...floors];
    [updatedFloors[currentIndex], updatedFloors[newIndex]] = 
    [updatedFloors[newIndex], updatedFloors[currentIndex]];
    
    // Update level numbers
    updatedFloors.forEach((floor, index) => {
      floor.level = index;
    });
    
    onFloorsChange(updatedFloors);
  };

  const startEdit = (floor: Floor) => {
    setEditingFloorId(floor.id);
    setEditingName(floor.name);
  };

  const finishEdit = () => {
    if (editingFloorId && editingName.trim()) {
      updateFloor(editingFloorId, { name: editingName.trim() });
    }
    setEditingFloorId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      finishEdit();
    } else if (e.key === 'Escape') {
      setEditingFloorId(null);
      setEditingName('');
    }
  };

  // Sort floors by level (bottom to top)
  const sortedFloors = [...floors].sort((a, b) => b.level - a.level);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Floor Manager</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Add Floor Button */}
          <button
            onClick={addFloor}
            className="w-full mb-4 flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Plus size={20} />
            <span>Add New Floor</span>
          </button>

          {/* Floors List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sortedFloors.map((floor, index) => (
              <div
                key={floor.id}
                className={`p-3 border rounded-lg transition-colors ${
                  floor.id === activeFloorId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onActiveFloorChange(floor.id)}
                  >
                    {editingFloorId === floor.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={finishEdit}
                        onKeyDown={handleKeyPress}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{floor.name}</span>
                          {floor.id === activeFloorId && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Level {floor.level} • Height: {floor.height}ft • {floor.objects.length} objects
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 ml-2">
                    {/* Move buttons */}
                    <button
                      onClick={() => moveFloor(floor.id, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveFloor(floor.id, 'down')}
                      disabled={index === sortedFloors.length - 1}
                      className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>

                    {/* Visibility toggle */}
                    <button
                      onClick={() => updateFloor(floor.id, { visible: !floor.visible })}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title={floor.visible ? 'Hide Floor' : 'Show Floor'}
                    >
                      {floor.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>

                    {/* Lock toggle */}
                    <button
                      onClick={() => updateFloor(floor.id, { locked: !floor.locked })}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title={floor.locked ? 'Unlock Floor' : 'Lock Floor'}
                    >
                      {floor.locked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>

                    {/* Edit name */}
                    <button
                      onClick={() => startEdit(floor)}
                      className="p-1 rounded hover:bg-gray-200 transition-colors"
                      title="Rename Floor"
                    >
                      ✏️
                    </button>

                    {/* Delete */}
                    {floors.length > 1 && (
                      <button
                        onClick={() => deleteFloor(floor.id)}
                        className="p-1 rounded hover:bg-red-200 text-red-600 transition-colors"
                        title="Delete Floor"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Floor height adjustment */}
                <div className="mt-2 flex items-center space-x-2">
                  <label className="text-xs text-gray-600">Height:</label>
                  <input
                    type="number"
                    value={floor.height}
                    onChange={(e) => updateFloor(floor.id, { height: Number(e.target.value) })}
                    className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    min="8"
                    max="20"
                    step="0.5"
                  />
                  <span className="text-xs text-gray-600">ft</span>
                </div>
              </div>
            ))}
          </div>

          {floors.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No floors created</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {floors.length} floor{floors.length !== 1 ? 's' : ''}
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

export default FloorManager;