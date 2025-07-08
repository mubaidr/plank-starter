import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToolType, Point } from '@/types';

// Tool Context Type Definition
interface ToolContextType {
  activeTool: ToolType;
  toolSettings: Record<string, any>;
  isDrawing: boolean;
  drawingData: any;

  // Tool Management
  setActiveTool: (tool: ToolType) => void;
  updateToolSettings: (settings: Record<string, any>) => void;

  // Drawing State Management
  startDrawing: (point: Point, data?: any) => void;
  continueDrawing: (point: Point, data?: any) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;

  // Tool-specific settings
  wallSettings: WallToolSettings;
  doorSettings: DoorToolSettings;
  windowSettings: WindowToolSettings;
  roomSettings: RoomToolSettings;
  measurementSettings: MeasurementToolSettings;
}

// Tool Settings Interfaces
interface WallToolSettings {
  thickness: number;
  height: number;
  material: string;
  isLoadBearing: boolean;
  autoConnect: boolean;
}

interface DoorToolSettings {
  width: number;
  height: number;
  doorType: 'single' | 'double' | 'french' | 'sliding' | 'bifold';
  swingDirection: 'left' | 'right' | 'both' | 'sliding' | 'folding' | 'pocket';
  material: string;
}

interface WindowToolSettings {
  width: number;
  height: number;
  sillHeight: number;
  windowType: 'single' | 'double' | 'casement' | 'sliding' | 'bay' | 'bow';
  glazingLayers: number;
  frameType: 'wood' | 'vinyl' | 'aluminum' | 'composite';
  material: string;
}

interface RoomToolSettings {
  autoDetect: boolean;
  showArea: boolean;
  defaultCeilingHeight: number;
  defaultFloorMaterial: string;
}

interface MeasurementToolSettings {
  unit: 'inches' | 'feet' | 'meters' | 'centimeters';
  precision: number;
  showDimensions: boolean;
  dimensionStyle: {
    lineColor: string;
    textColor: string;
    fontSize: number;
    arrowStyle: 'arrow' | 'dot' | 'slash' | 'none';
  };
}

// Default Settings
const defaultWallSettings: WallToolSettings = {
  thickness: 6, // inches
  height: 96, // inches (8 feet)
  material: 'drywall',
  isLoadBearing: false,
  autoConnect: true
};

const defaultDoorSettings: DoorToolSettings = {
  width: 36, // inches
  height: 80, // inches
  doorType: 'single',
  swingDirection: 'right',
  material: 'wood'
};

const defaultWindowSettings: WindowToolSettings = {
  width: 48, // inches
  height: 36, // inches
  sillHeight: 36, // inches from floor
  windowType: 'single',
  glazingLayers: 2,
  frameType: 'vinyl',
  material: 'glass'
};

const defaultRoomSettings: RoomToolSettings = {
  autoDetect: true,
  showArea: true,
  defaultCeilingHeight: 96, // inches (8 feet)
  defaultFloorMaterial: 'hardwood'
};

const defaultMeasurementSettings: MeasurementToolSettings = {
  unit: 'feet',
  precision: 2,
  showDimensions: true,
  dimensionStyle: {
    lineColor: '#374151',
    textColor: '#111827',
    fontSize: 12,
    arrowStyle: 'arrow'
  }
};

// Context Creation
const ToolContext = createContext<ToolContextType | undefined>(undefined);

// Provider Component
export const ToolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTool, setActiveToolState] = useState<ToolType>('select');
  const [toolSettings, setToolSettings] = useState<Record<string, any>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState<any>(null);

  // Tool-specific settings state
  const [wallSettings, setWallSettings] = useState<WallToolSettings>(defaultWallSettings);
  const [doorSettings, setDoorSettings] = useState<DoorToolSettings>(defaultDoorSettings);
  const [windowSettings, setWindowSettings] = useState<WindowToolSettings>(defaultWindowSettings);
  const [roomSettings, setRoomSettings] = useState<RoomToolSettings>(defaultRoomSettings);
  const [measurementSettings, setMeasurementSettings] = useState<MeasurementToolSettings>(defaultMeasurementSettings);

  // Tool Management Functions
  const setActiveTool = useCallback((tool: ToolType) => {
    // Cancel any ongoing drawing when switching tools
    if (isDrawing) {
      cancelDrawing();
    }
    setActiveToolState(tool);
  }, [isDrawing]);

  const updateToolSettings = useCallback((settings: Record<string, any>) => {
    setToolSettings(prev => ({ ...prev, ...settings }));
    
    // Update specific tool settings based on active tool
    switch (activeTool) {
      case 'wall':
        setWallSettings(prev => ({ ...prev, ...settings }));
        break;
      case 'door':
        setDoorSettings(prev => ({ ...prev, ...settings }));
        break;
      case 'window':
        setWindowSettings(prev => ({ ...prev, ...settings }));
        break;
      case 'room':
        setRoomSettings(prev => ({ ...prev, ...settings }));
        break;
      case 'measure':
        setMeasurementSettings(prev => ({ ...prev, ...settings }));
        break;
    }
  }, [activeTool]);

  // Drawing State Management
  const startDrawing = useCallback((point: Point, data?: any) => {
    setIsDrawing(true);
    setDrawingData({ startPoint: point, ...data });
  }, []);

  const continueDrawing = useCallback((point: Point, data?: any) => {
    if (!isDrawing) return;
    setDrawingData(prev => ({ ...prev, currentPoint: point, ...data }));
  }, [isDrawing]);

  const finishDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawingData(null);
  }, []);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawingData(null);
  }, []);

  const value: ToolContextType = {
    activeTool,
    toolSettings,
    isDrawing,
    drawingData,
    setActiveTool,
    updateToolSettings,
    startDrawing,
    continueDrawing,
    finishDrawing,
    cancelDrawing,
    wallSettings,
    doorSettings,
    windowSettings,
    roomSettings,
    measurementSettings
  };

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  );
};

// Custom Hook
export const useToolContext = (): ToolContextType => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolContext must be used within a ToolProvider');
  }
  return context;
};

// Utility functions for tool-specific operations
export const getToolCursor = (tool: ToolType): string => {
  switch (tool) {
    case 'select':
      return 'default';
    case 'wall':
    case 'line':
      return 'crosshair';
    case 'door':
    case 'window':
      return 'copy';
    case 'room':
      return 'cell';
    case 'measure':
      return 'crosshair';
    case 'text':
      return 'text';
    case 'rectangle':
    case 'circle':
      return 'crosshair';
    default:
      return 'default';
  }
};

export const getToolIcon = (tool: ToolType): string => {
  // Return icon class names or icon components
  switch (tool) {
    case 'select':
      return 'cursor-arrow';
    case 'wall':
      return 'rectangle-horizontal';
    case 'door':
      return 'door-open';
    case 'window':
      return 'window';
    case 'room':
      return 'home';
    case 'measure':
      return 'ruler';
    case 'text':
      return 'type';
    case 'rectangle':
      return 'square';
    case 'circle':
      return 'circle';
    case 'line':
      return 'minus';
    default:
      return 'cursor-arrow';
  }
};