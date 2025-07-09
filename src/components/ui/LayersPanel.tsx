"use client";
import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Edit3, Printer, Palette } from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  printable: boolean;
}

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerUpdate: (layerId: string, updates: Partial<Layer>) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerSelect: (layerId: string) => void;
  onLayerReorder?: (fromIndex: number, toIndex: number) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onLayerUpdate,
  onLayerAdd,
  onLayerDelete,
  onLayerSelect,
}) => {
  const [editingLayerId, setEditingLayerId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState('');
  const [showColorPicker, setShowColorPicker] = React.useState<string | null>(null);

  // Predefined color palette
  const colorPalette = [
    '#1E40AF', '#059669', '#DC2626', '#7C3AED', '#EA580C',
    '#0891B2', '#BE185D', '#65A30D', '#CA8A04', '#6B7280'
  ];

  const handleStartEdit = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleFinishEdit = () => {
    if (editingLayerId && editingName.trim()) {
      onLayerUpdate(editingLayerId, { name: editingName.trim() });
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEdit();
    } else if (e.key === 'Escape') {
      setEditingLayerId(null);
      setEditingName('');
    }
  };

  return (
    <div className="w-64 panel flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Layers</h3>
          <button
            onClick={onLayerAdd}
            className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Add Layer"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Layers List */}
      <div className="panel-content custom-scrollbar">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
              layer.id === activeLayerId ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
            }`}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center space-x-2">
              {/* Color Indicator with Picker */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(showColorPicker === layer.id ? null : layer.id);
                  }}
                  className="w-4 h-4 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                  style={{ backgroundColor: layer.color, opacity: layer.opacity }}
                  title="Change layer color"
                />
                
                {/* Color Picker Dropdown */}
                {showColorPicker === layer.id && (
                  <div className="absolute top-6 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <div className="grid grid-cols-5 gap-1 mb-2">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={(e) => {
                            e.stopPropagation();
                            onLayerUpdate(layer.id, { color });
                            setShowColorPicker(null);
                          }}
                          className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    
                    {/* Opacity Slider */}
                    <div className="mb-2">
                      <label className="text-xs text-gray-600 block mb-1">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={layer.opacity}
                        onChange={(e) => {
                          onLayerUpdate(layer.id, { opacity: parseFloat(e.target.value) });
                        }}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-xs text-gray-500 text-center">{Math.round(layer.opacity * 100)}%</div>
                    </div>
                    
                    {/* Custom Color Input */}
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Custom Color</label>
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => {
                          onLayerUpdate(layer.id, { color: e.target.value });
                        }}
                        className="w-full h-6 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Layer Name */}
              <div className="flex-1">
                {editingLayerId === layer.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleFinishEdit}
                    onKeyDown={handleKeyPress}
                    className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{layer.name}</span>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerUpdate(layer.id, { printable: !layer.printable });
                  }}
                  className={`p-1 rounded transition-colors ${
                    layer.printable 
                      ? 'text-green-600 hover:bg-green-100' 
                      : 'text-gray-400 hover:bg-gray-200'
                  }`}
                  title={layer.printable ? 'Exclude from print' : 'Include in print'}
                >
                  <Printer size={14} />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(layer);
                  }}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title="Rename Layer"
                >
                  <Edit3 size={14} />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerUpdate(layer.id, { visible: !layer.visible });
                  }}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerUpdate(layer.id, { locked: !layer.locked });
                  }}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                
                {layers.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerDelete(layer.id);
                    }}
                    className="p-1 rounded hover:bg-red-200 text-red-600 transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Layer Info */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;