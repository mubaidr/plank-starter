"use client";
import React, { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Settings, 
  HelpCircle, 
  Keyboard,
  Eye,
  EyeOff,
  Grid3X3,
  Magnet,
  Crosshair,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface QuickActionsPanelProps {
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onToggleGuides: () => void;
  gridVisible: boolean;
  snapToGrid: boolean;
  guidesVisible: boolean;
  className?: string;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onSave,
  onLoad,
  onExport,
  onToggleGrid,
  onToggleSnap,
  onToggleGuides,
  gridVisible,
  snapToGrid,
  guidesVisible,
  className = ""
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const fileActions = [
    { icon: Save, label: 'Save', action: onSave, shortcut: 'Ctrl+S' },
    { icon: FolderOpen, label: 'Load', action: onLoad, shortcut: 'Ctrl+O' },
    { icon: Download, label: 'Export', action: onExport, shortcut: 'Ctrl+E' },
  ];

  const viewActions = [
    { 
      icon: Grid3X3, 
      label: 'Grid', 
      action: onToggleGrid, 
      active: gridVisible, 
      shortcut: 'G',
      color: 'blue'
    },
    { 
      icon: Magnet, 
      label: 'Snap', 
      action: onToggleSnap, 
      active: snapToGrid, 
      shortcut: 'Shift+G',
      color: 'green'
    },
    { 
      icon: Crosshair, 
      label: 'Guides', 
      action: onToggleGuides, 
      active: guidesVisible, 
      shortcut: 'Ctrl+;',
      color: 'purple'
    },
  ];

  const keyboardShortcuts = [
    { category: 'Tools', shortcuts: [
      { key: 'V', action: 'Select Tool' },
      { key: 'L', action: 'Lasso Tool' },
      { key: 'R', action: 'Rectangle Tool' },
      { key: 'W', action: 'Wall Tool' },
      { key: 'D', action: 'Door Tool' },
      { key: 'O', action: 'Room Tool' },
    ]},
    { category: 'Actions', shortcuts: [
      { key: 'Ctrl+Z', action: 'Undo' },
      { key: 'Ctrl+Y', action: 'Redo' },
      { key: 'Ctrl+S', action: 'Save' },
      { key: 'Delete', action: 'Delete Selected' },
    ]},
    { category: 'View', shortcuts: [
      { key: 'G', action: 'Toggle Grid' },
      { key: '+/-', action: 'Zoom In/Out' },
      { key: '0', action: 'Fit to Screen' },
      { key: 'Space+Drag', action: 'Pan View' },
    ]},
  ];

  return (
    <div className={`bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-800">Quick Actions</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-4">
          {/* File Actions */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">File</h4>
            <div className="grid grid-cols-3 gap-2">
              {fileActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className="flex flex-col items-center space-y-1 p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group"
                    title={`${action.label} (${action.shortcut})`}
                  >
                    <Icon size={18} className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Actions */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">View</h4>
            <div className="space-y-2">
              {viewActions.map((action, index) => {
                const Icon = action.icon;
                const colorClasses = {
                  blue: action.active ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                  green: action.active ? 'bg-green-500 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100',
                  purple: action.active ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                };
                
                return (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`flex items-center justify-between w-full p-2 rounded-md transition-colors ${
                      colorClasses[action.color as keyof typeof colorClasses]
                    }`}
                    title={`${action.label} (${action.shortcut})`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon size={16} />
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                    <span className="text-xs opacity-75">{action.shortcut}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Help Actions */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Help</h4>
            <div className="space-y-2">
              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="flex items-center justify-between w-full p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                title="View keyboard shortcuts"
              >
                <div className="flex items-center space-x-2">
                  <Keyboard size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Shortcuts</span>
                </div>
                {showKeyboardShortcuts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              
              {showKeyboardShortcuts && (
                <div className="bg-gray-50 rounded-md p-3 space-y-3">
                  {keyboardShortcuts.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h5 className="text-xs font-medium text-gray-600 mb-1">{category.category}</h5>
                      <div className="space-y-1">
                        {category.shortcuts.map((shortcut, shortcutIndex) => (
                          <div key={shortcutIndex} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{shortcut.action}</span>
                            <kbd className="bg-white px-1.5 py-0.5 rounded border text-gray-700 font-mono">
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActionsPanel;