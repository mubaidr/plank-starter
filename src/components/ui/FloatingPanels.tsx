"use client";
import React, { useState } from 'react';
import { 
  Settings, 
  Layers, 
  Home, 
  Ruler, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface FloatingPanelsProps {
  activeTool: string;
  onOpenRoomPanel: () => void;
  onOpenGuidesPanel: () => void;
  onOpenSectionPanel: () => void;
  onOpenValidationPanel: () => void;
  validationEnabled: boolean;
  onToggleValidation: () => void;
  validationSummary: {
    total: number;
    critical: number;
    high: number;
  };
}

const FloatingPanels: React.FC<FloatingPanelsProps> = ({
  activeTool,
  onOpenRoomPanel,
  onOpenGuidesPanel,
  onOpenSectionPanel,
  onOpenValidationPanel,
  validationEnabled,
  onToggleValidation,
  validationSummary
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState<'right' | 'left'>('right');

  const getValidationColor = () => {
    if (validationSummary.critical > 0) return 'bg-red-500 hover:bg-red-600';
    if (validationSummary.high > 0) return 'bg-orange-500 hover:bg-orange-600';
    if (validationSummary.total > 0) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-green-500 hover:bg-green-600';
  };

  const panelButtons = [
    {
      id: 'guides',
      icon: Ruler,
      label: 'Guides',
      onClick: onOpenGuidesPanel,
      color: 'bg-blue-500 hover:bg-blue-600',
      show: true
    },
    {
      id: 'sections',
      icon: Settings,
      label: 'Sections',
      onClick: onOpenSectionPanel,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      show: activeTool === 'section' || true // Always show for now
    },
    {
      id: 'rooms',
      icon: Home,
      label: 'Rooms',
      onClick: onOpenRoomPanel,
      color: 'bg-purple-500 hover:bg-purple-600',
      show: activeTool === 'room'
    },
    {
      id: 'validation',
      icon: AlertTriangle,
      label: `${validationSummary.total} Issues`,
      onClick: onOpenValidationPanel,
      color: getValidationColor(),
      show: true,
      badge: validationSummary.critical > 0 ? validationSummary.critical : undefined
    }
  ];

  const visibleButtons = panelButtons.filter(button => button.show);

  return (
    <div className={`fixed ${position === 'right' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 z-40`}>
      <div className="flex flex-col space-y-2">
        {/* Collapse/Expand Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="self-center bg-white border border-gray-300 text-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all"
          title={isCollapsed ? 'Expand panels' : 'Collapse panels'}
        >
          {isCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>

        {/* Panel Buttons */}
        {!isCollapsed && (
          <div className="flex flex-col space-y-2">
            {visibleButtons.map((button) => {
              const Icon = button.icon;
              return (
                <div key={button.id} className="relative">
                  <button
                    onClick={button.onClick}
                    className={`${button.color} text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-105 relative`}
                    title={button.label}
                  >
                    <Icon size={20} />
                    {button.badge && (
                      <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {button.badge}
                      </div>
                    )}
                  </button>
                  
                  {/* Tooltip */}
                  <div className={`absolute ${position === 'right' ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 whitespace-nowrap`}>
                    {button.label}
                  </div>
                </div>
              );
            })}

            {/* Validation Toggle */}
            <button
              onClick={onToggleValidation}
              className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 ${
                validationEnabled 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-400 hover:bg-gray-500 text-white'
              }`}
              title={validationEnabled ? 'Disable validation' : 'Enable validation'}
            >
              <Settings size={20} />
            </button>
          </div>
        )}

        {/* Position Toggle */}
        <button
          onClick={() => setPosition(position === 'right' ? 'left' : 'right')}
          className="self-center bg-white border border-gray-300 text-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all"
          title={`Move to ${position === 'right' ? 'left' : 'right'} side`}
        >
          {position === 'right' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default FloatingPanels;