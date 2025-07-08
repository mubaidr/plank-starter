"use client";
import React from 'react';
import { Eye, EyeOff, Grid3X3, Ruler, Home, AlertTriangle } from 'lucide-react';

interface StatusBarProps {
  activeTool: string;
  objectCount: number;
  zoom: number;
  pan: { x: number; y: number };
  gridVisible: boolean;
  gridSize: number;
  guidesEnabled: boolean;
  guidesCount: number;
  snapTolerance: number;
  roomsCount: number;
  totalArea: number;
  validationEnabled: boolean;
  validationIssues: number;
  criticalIssues: number;
  isGesturing?: boolean;
  isCreatingGuide?: string | null;
  isDefiningRoom?: boolean;
  currentRoomName?: string;
  currentRoomPoints?: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  activeTool,
  objectCount,
  zoom,
  pan,
  gridVisible,
  gridSize,
  guidesEnabled,
  guidesCount,
  snapTolerance,
  roomsCount,
  totalArea,
  validationEnabled,
  validationIssues,
  criticalIssues,
  isGesturing,
  isCreatingGuide,
  isDefiningRoom,
  currentRoomName,
  currentRoomPoints
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - Tool Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tool
            </span>
          </div>
          
          {isGesturing && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Touch Gesture</span>
            </div>
          )}
          
          {isCreatingGuide && (
            <div className="flex items-center space-x-1 text-green-600">
              <Ruler className="w-3 h-3" />
              <span className="text-xs font-medium">Creating {isCreatingGuide} guide</span>
            </div>
          )}
          
          {isDefiningRoom && currentRoomName && (
            <div className="flex items-center space-x-1 text-purple-600">
              <Home className="w-3 h-3" />
              <span className="text-xs font-medium">
                {currentRoomName} ({currentRoomPoints} points)
              </span>
            </div>
          )}
        </div>

        {/* Center Section - Project Stats */}
        <div className="flex items-center space-x-6 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span className="font-medium">{objectCount}</span>
            <span>Objects</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Home className="w-3 h-3" />
            <span className="font-medium">{roomsCount}</span>
            <span>Rooms</span>
          </div>
          
          {totalArea > 0 && (
            <div className="flex items-center space-x-1">
              <span className="font-medium">{Math.round(totalArea).toLocaleString()}</span>
              <span>sq px</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <AlertTriangle className={`w-3 h-3 ${criticalIssues > 0 ? 'text-red-500' : validationIssues > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
            <span className={`font-medium ${criticalIssues > 0 ? 'text-red-600' : validationIssues > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
              {validationIssues}
            </span>
            <span>Issues</span>
          </div>
        </div>

        {/* Right Section - View Settings */}
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <span className="font-medium">{Math.round(zoom * 100)}%</span>
            <span>Zoom</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span>({Math.round(pan.x)}, {Math.round(pan.y)})</span>
            <span>Pan</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Grid3X3 className={`w-3 h-3 ${gridVisible ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={gridVisible ? 'text-blue-600 font-medium' : ''}>
              Grid {gridVisible ? 'On' : 'Off'}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Ruler className={`w-3 h-3 ${guidesEnabled ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={guidesEnabled ? 'text-blue-600 font-medium' : ''}>
              {guidesCount} Guides
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;