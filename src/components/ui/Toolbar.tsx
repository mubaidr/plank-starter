"use client";
import React from 'react';
import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { useToolContext } from '@/context/ToolContext';
import { 
  MousePointer, 
  Square, 
  Circle, 
  Move, 
  RotateCw, 
  Trash2, 
  Undo, 
  Redo, 
  Save, 
  FolderOpen,
  Download,
  Hand,
  Ruler,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minus,
  Grid3X3,
  Magnet,
  DoorOpen,
  Lasso,
  Crosshair,
  RectangleHorizontal,
  Layers,
  Shapes,
  Type,
  Home,
  Settings,
  Triangle,
  Palette
} from 'lucide-react';

export type ToolType = 'select' | 'lasso' | 'rectangle' | 'circle' | 'line' | 'wall' | 'door' | 'window' | 'room' | 'text' | 'roof' | 'move' | 'rotate' | 'pan' | 'measure';

interface ToolbarProps {
  // Most functionality is now handled by context
}

const Toolbar: React.FC<ToolbarProps> = () => {
  // Get state and actions from contexts
  const { state, undo, redo, canUndo, canRedo, deleteObject } = useFloorPlanContext();
  const { activeTool, setActiveTool } = useToolContext();
  
  // Extract values from state
  const hasSelection = state.canvas.selection.selectedIds.length > 0;
  const zoomLevel = state.canvas.viewport.zoom;
  const gridVisible = state.canvas.grid.visible;
  const snapToGrid = state.canvas.snap.snapToGrid;
  // Organized tool groups for better UX
  const toolGroups = [
    {
      name: 'Selection',
      tools: [
        { id: 'select' as ToolType, icon: MousePointer, label: 'Select', tooltip: 'Select and manipulate objects (S)' },
        { id: 'lasso' as ToolType, icon: Lasso, label: 'Lasso', tooltip: 'Lasso selection tool (L)' },
        { id: 'pan' as ToolType, icon: Hand, label: 'Pan', tooltip: 'Pan around the canvas (H)' },
      ]
    },
    {
      name: 'Basic Shapes',
      tools: [
        { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle', tooltip: 'Draw rectangles (R)' },
        { id: 'circle' as ToolType, icon: Circle, label: 'Circle', tooltip: 'Draw circles (C)' },
        { id: 'line' as ToolType, icon: Minus, label: 'Line', tooltip: 'Draw simple lines (L)' },
      ]
    },
    {
      name: 'Architecture',
      tools: [
        { id: 'wall' as ToolType, icon: Home, label: 'Wall', tooltip: 'Draw walls with properties (W)' },
        { id: 'door' as ToolType, icon: DoorOpen, label: 'Door', tooltip: 'Place doors on walls (D)' },
        { id: 'window' as ToolType, icon: RectangleHorizontal, label: 'Window', tooltip: 'Place windows on walls (Shift+W)' },
        { id: 'room' as ToolType, icon: Shapes, label: 'Room', tooltip: 'Define room boundaries (O)' },
        { id: 'roof' as ToolType, icon: Triangle, label: 'Roof', tooltip: 'Create roof structures (F)' },
      ]
    },
    {
      name: 'Tools',
      tools: [
        { id: 'text' as ToolType, icon: Type, label: 'Text', tooltip: 'Add text labels (T)' },
        { id: 'measure' as ToolType, icon: Ruler, label: 'Measure', tooltip: 'Measure distances and areas (M)' },
        { id: 'move' as ToolType, icon: Move, label: 'Move', tooltip: 'Move objects freely (V)' },
        { id: 'rotate' as ToolType, icon: RotateCw, label: 'Rotate', tooltip: 'Rotate selected objects (R)' },
      ]
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* File Operations */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => console.log('Save functionality to be implemented')}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              title="Save Project (Ctrl+S)"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => console.log('Load functionality to be implemented')}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              title="Load Project (Ctrl+O)"
            >
              <FolderOpen size={16} />
              <span className="hidden sm:inline">Load</span>
            </button>
            <button
              onClick={() => console.log('Export functionality to be implemented')}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
              title="Export Project (Ctrl+E)"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 ml-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`flex items-center justify-center w-9 h-9 rounded-md transition-all ${
                canUndo
                  ? 'text-gray-700 hover:bg-white hover:shadow-sm'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`flex items-center justify-center w-9 h-9 rounded-md transition-all ${
                canRedo
                  ? 'text-gray-700 hover:bg-white hover:shadow-sm'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={16} />
            </button>
          </div>
        </div>

        {/* Tool Groups */}
        <div className="flex items-center space-x-3">
          {toolGroups.map((group, groupIndex) => (
            <div key={group.name} className="flex items-center">
              {groupIndex > 0 && <div className="w-px h-8 bg-gray-300 mx-2" />}
              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                {group.tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`flex items-center justify-center w-10 h-10 rounded-md transition-all ${
                        activeTool === tool.id
                          ? 'bg-blue-500 text-white shadow-md transform scale-105'
                          : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                      }`}
                      title={tool.tooltip || tool.label}
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* View & Settings Controls */}
        <div className="flex items-center space-x-1">
          {/* View Controls */}
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => console.log('Toggle grid')}
              className={`flex items-center justify-center w-9 h-9 rounded-md transition-all ${
                gridVisible
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              }`}
              title="Toggle Grid (G)"
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => console.log('Toggle snap')}
              className={`flex items-center justify-center w-9 h-9 rounded-md transition-all ${
                snapToGrid
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
              }`}
              title="Snap to Grid (Shift+G)"
            >
              <Magnet size={16} />
            </button>
            <button
              onClick={() => console.log('Manage guides')}
              className="flex items-center justify-center w-9 h-9 rounded-md transition-all text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              title="Guides (Ctrl+;)"
            >
              <Crosshair size={16} />
            </button>
            {onGridSettings && (
              <button
                onClick={onGridSettings}
                className="flex items-center justify-center w-10 h-10 rounded-md transition-colors text-gray-600 hover:bg-white hover:text-gray-900"
                title="Grid Settings (Ctrl+G)"
              >
                <Settings size={18} />
              </button>
            )}
            {onToggleLayers && (
              <button
                onClick={onToggleLayers}
                className="flex items-center justify-center w-10 h-10 rounded-md transition-colors text-gray-600 hover:bg-white hover:text-gray-900"
                title="Toggle Layers Panel (Ctrl+L)"
              >
                <Layers size={18} />
              </button>
            )}
            {onToggleShapes && (
              <button
                onClick={onToggleShapes}
                className="flex items-center justify-center w-10 h-10 rounded-md transition-colors text-gray-600 hover:bg-white hover:text-gray-900"
                title="Toggle Shape Library (Ctrl+Shift+S)"
              >
                <Shapes size={18} />
              </button>
            )}
            {onToggleMaterials && (
              <button
                onClick={onToggleMaterials}
                className="flex items-center justify-center w-10 h-10 rounded-md transition-colors text-gray-600 hover:bg-white hover:text-gray-900"
                title="Toggle Material Library (Ctrl+M)"
              >
                <Palette size={18} />
              </button>
            )}
            {onToggleDimensions && (
              <button
                onClick={onToggleDimensions}
                className="flex items-center justify-center w-10 h-10 rounded-md transition-colors text-gray-600 hover:bg-white hover:text-gray-900"
                title="Toggle Dimension Tools (Ctrl+D)"
              >
                <Ruler size={18} />
              </button>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 ml-2">
            <button
              onClick={() => console.log('Zoom out')}
              className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              title="Zoom Out (-)"
            >
              <ZoomOut size={14} />
            </button>
            <div className="px-2 py-1 text-xs font-medium text-gray-700 min-w-[3rem] text-center bg-white rounded border">
              {Math.round(zoomLevel * 100)}%
            </div>
            <button
              onClick={() => console.log('Zoom in')}
              className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              title="Zoom In (+)"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => console.log('Fit to screen')}
              className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
              title="Fit to Screen (0)"
            >
              <Maximize size={14} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
              canUndo
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
              canRedo
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
          <button
            onClick={() => {
              // Delete selected objects
              state.canvas.selection.selectedIds.forEach(id => {
                deleteObject(id);
              });
            }}
            disabled={!hasSelection}
            className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
              hasSelection
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title="Delete Selected (Delete)"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;