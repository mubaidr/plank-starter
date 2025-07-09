"use client";
import React, { useState } from 'react';
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
  Grid3X3,
  Magnet,
  DoorOpen,
  Lasso,
  Crosshair,
  Home,
  RectangleHorizontal,
  Type,
  Triangle,
  Shapes,
  Menu,
  X,
  ChevronDown,
  Settings
} from 'lucide-react';

import { ToolType } from '@/types/coreTypes';

interface ResponsiveToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  zoomLevel: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  onToggleGrid?: () => void;
  onToggleSnap?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
}

const ResponsiveToolbar: React.FC<ResponsiveToolbarProps> = ({
  activeTool,
  setActiveTool,
  canUndo,
  canRedo,
  undo,
  redo,
  zoomLevel,
  gridVisible,
  snapToGrid,
  onToggleGrid,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onSave,
  onLoad,
  onExport
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Organized tool groups for better UX
  const toolGroups = [
    {
      id: 'selection',
      name: 'Selection',
      color: 'blue',
      tools: [
        { id: 'select' as ToolType, icon: MousePointer, label: 'Select', shortcut: 'V' },
        { id: 'lasso' as ToolType, icon: Lasso, label: 'Lasso', shortcut: 'L' },
        { id: 'pan' as ToolType, icon: Hand, label: 'Pan', shortcut: 'H' },
      ]
    },
    {
      id: 'shapes',
      name: 'Shapes',
      color: 'green',
      tools: [
        { id: 'rectangle' as ToolType, icon: Square, label: 'Rectangle', shortcut: 'R' },
        { id: 'circle' as ToolType, icon: Circle, label: 'Circle', shortcut: 'C' },
        { id: 'line' as ToolType, icon: Ruler, label: 'Line', shortcut: 'Shift+L' },
      ]
    },
    {
      id: 'architecture',
      name: 'Architecture',
      color: 'purple',
      tools: [
        { id: 'wall' as ToolType, icon: Home, label: 'Wall', shortcut: 'W' },
        { id: 'door' as ToolType, icon: DoorOpen, label: 'Door', shortcut: 'D' },
        { id: 'window' as ToolType, icon: RectangleHorizontal, label: 'Window', shortcut: 'Shift+W' },
        { id: 'room' as ToolType, icon: Shapes, label: 'Room', shortcut: 'O' },
        { id: 'roof' as ToolType, icon: Triangle, label: 'Roof', shortcut: 'F' },
      ]
    },
    {
      id: 'tools',
      name: 'Tools',
      color: 'orange',
      tools: [
        { id: 'text' as ToolType, icon: Type, label: 'Text', shortcut: 'T' },
        { id: 'measure' as ToolType, icon: Ruler, label: 'Measure', shortcut: 'M' },
        { id: 'section' as ToolType, icon: Crosshair, label: 'Section', shortcut: 'S' },
        { id: 'move' as ToolType, icon: Move, label: 'Move', shortcut: 'G' },
        { id: 'rotate' as ToolType, icon: RotateCw, label: 'Rotate', shortcut: 'R' },
      ]
    }
  ];

  const getGroupColor = (color: string, active: boolean = false) => {
    const colors = {
      blue: active ? 'bg-blue-500 border-blue-600' : 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: active ? 'bg-green-500 border-green-600' : 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: active ? 'bg-purple-500 border-purple-600' : 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      orange: active ? 'bg-orange-500 border-orange-600' : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getToolColor = (groupColor: string, isActive: boolean) => {
    if (isActive) {
      const activeColors = {
        blue: 'bg-blue-500 text-white shadow-md',
        green: 'bg-green-500 text-white shadow-md',
        purple: 'bg-purple-500 text-white shadow-md',
        orange: 'bg-orange-500 text-white shadow-md'
      };
      return activeColors[groupColor as keyof typeof activeColors];
    }
    return 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm';
  };

  const currentGroup = toolGroups.find(group => 
    group.tools.some(tool => tool.id === activeTool)
  );

  return (
    <>
      {/* Desktop Toolbar */}
      <div className="hidden lg:block bg-white border-b border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          {/* File Operations */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border">
              <button
                onClick={onSave}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
                title="Save Project (Ctrl+S)"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={onLoad}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
                title="Load Project (Ctrl+O)"
              >
                <FolderOpen size={16} />
                <span>Load</span>
              </button>
              <button
                onClick={onExport}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
                title="Export Project (Ctrl+E)"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border ml-2">
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
              <div key={group.id} className="flex items-center">
                {groupIndex > 0 && <div className="w-px h-8 bg-gray-300 mx-2" />}
                <div className={`flex items-center space-x-1 rounded-lg p-1 border transition-all ${getGroupColor(group.color, group.tools.some(tool => tool.id === activeTool))}`}>
                  {group.tools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`flex items-center justify-center w-10 h-10 rounded-md transition-all ${getToolColor(group.color, isActive)}`}
                        title={`${tool.label} (${tool.shortcut})`}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border">
              <button
                onClick={onToggleGrid}
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
                onClick={onToggleSnap}
                className={`flex items-center justify-center w-9 h-9 rounded-md transition-all ${
                  snapToGrid
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                }`}
                title="Snap to Grid (Shift+G)"
              >
                <Magnet size={16} />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border">
              <button
                onClick={onZoomOut}
                className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                title="Zoom Out (-)"
              >
                <ZoomOut size={14} />
              </button>
              <div className="px-2 py-1 text-xs font-medium text-gray-700 min-w-[3rem] text-center bg-white rounded border">
                {Math.round(zoomLevel * 100)}%
              </div>
              <button
                onClick={onZoomIn}
                className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                title="Zoom In (+)"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={onZoomFit}
                className="flex items-center justify-center w-8 h-8 rounded-md transition-all text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                title="Fit to Screen (0)"
              >
                <Maximize size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Toolbar */}
      <div className="lg:hidden bg-white border-b border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Current Tool Display */}
          <div className="flex items-center space-x-2">
            {currentGroup && (
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getGroupColor(currentGroup.color, true)}`}>
                {(() => {
                  const currentTool = currentGroup.tools.find(tool => tool.id === activeTool);
                  if (currentTool) {
                    const Icon = currentTool.icon;
                    return (
                      <>
                        <Icon size={18} className="text-white" />
                        <span className="text-white font-medium">{currentTool.label}</span>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`flex items-center justify-center w-9 h-9 rounded-md ${
                canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400'
              }`}
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`flex items-center justify-center w-9 h-9 rounded-md ${
                canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400'
              }`}
            >
              <Redo size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="space-y-4">
              {toolGroups.map((group) => (
                <div key={group.id}>
                  <button
                    onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
                    className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-700 hover:bg-white rounded-md"
                  >
                    <span>{group.name}</span>
                    <ChevronDown 
                      size={16} 
                      className={`transform transition-transform ${activeGroup === group.id ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {activeGroup === group.id && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {group.tools.map((tool) => {
                        const Icon = tool.icon;
                        const isActive = activeTool === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              setActiveTool(tool.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex flex-col items-center space-y-1 p-3 rounded-md transition-all ${
                              isActive 
                                ? `${getGroupColor(group.color, true)} text-white` 
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <Icon size={20} />
                            <span className="text-xs font-medium">{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResponsiveToolbar;