import { ElectricalElement } from './electricalTypes';
import { PlumbingElement } from './plumbingTypes';
import { HVACElement } from './hvacTypes';
import { BaseObject, Point } from './coreTypes';

// Export Point for backward compatibility
export type { Point } from './coreTypes';

// Wall, Door, Window, Room types
export interface Wall extends BaseObject {
  type: 'wall';
  points: Point[];
  thickness: number;
  height: number;
  material?: string;
}

export interface Door extends BaseObject {
  type: 'door';
  width: number;
  height: number;
  swing: 'left' | 'right' | 'double';
  material?: string;
}

export interface Window extends BaseObject {
  type: 'window';
  width: number;
  height: number;
  sillHeight: number;
  material?: string;
}

export interface Room extends BaseObject {
  type: 'room';
  points: Point[];
  name: string;
  area?: number;
  material?: string;
}

export type ViewType = '2d' | 'elevation' | 'section' | '3d' | 'walkthrough';

export type FloorPlanObject =
  | Wall
  | Door
  | Window
  | Room
  | ElectricalElement
  | PlumbingElement
  | HVACElement
  | (BaseObject & {
      type: string; // For any other types not specifically handled
    });

// Canvas object type for drawing operations
export interface CanvasObject extends BaseObject {
  width?: number;
  height?: number;
  radius?: number;
  points?: Point[];
  text?: string;
  x?: number;
  y?: number;
}

export interface LayerState {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  printable: boolean;
}

export interface CanvasState {
  viewport: {
    zoom: number;
    pan: Point;
    bounds: { x: number; y: number; width: number; height: number };
    center: Point;
  };
  grid: {
    visible: boolean;
    size: number;
    unit: string;
    subdivisions: number;
    color: string;
    opacity: number;
  };
  snap: {
    enabled: boolean;
    snapToGrid: boolean;
    snapToObjects: boolean;
    snapToGuides: boolean;
    tolerance: number;
  };
  selection: {
    selectedIds: string[];
    multiSelect: boolean;
    selectionMode: string;
  };
  view: {
    viewType: ViewType;
    showGrid: boolean;
    showSnapIndicators: boolean;
    showDimensions: boolean;
    showMaterials: boolean;
  };
  interaction: {
    isDrawing: boolean;
    isPanning: boolean;
    isSelecting: boolean;
    currentTool: string;
    toolSettings: Record<string, unknown>;
    currentMousePosition: Point;
  };
}

export interface ProjectState {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  tags: string[];
  unitSystem: 'imperial' | 'metric';
  displayFormat: 'decimal' | 'fractional' | 'architectural';
  precision: number;
  // Additional project settings
  scale?: number;
  defaultWallThickness?: number;
  defaultWallHeight?: number;
  defaultDoorHeight?: number;
  defaultWindowHeight?: number;
  defaultSillHeight?: number;
}

export interface HistoryState {
  past: unknown[];
  present: unknown;
  future: unknown[];
  maxHistorySize: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  color: string;
  visible: boolean;
}

export interface FloorPlanState {
  objects: Record<string, FloorPlanObject>;
  layers: Record<string, LayerState>;
  canvas: CanvasState;
  project: ProjectState;
  dimensions: Record<string, Dimension>;
  guides: Guide[];
  history: HistoryState;
}

export type FloorPlanAction =
  | { type: 'ADD_OBJECT'; payload: FloorPlanObject }
  | { type: 'UPDATE_OBJECT'; payload: { id: string; updates: Partial<FloorPlanObject> } }
  | { type: 'DELETE_OBJECT'; payload: string }
  | { type: 'SELECT_OBJECTS'; payload: string[] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: Point }
  | { type: 'SET_VIEW_TYPE'; payload: ViewType }
  | { type: 'ADD_LAYER'; payload: Omit<LayerState, 'id'> }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<LayerState> } }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'ADD_DIMENSION'; payload: Dimension }
  | { type: 'UPDATE_DIMENSION'; payload: { id: string; updates: Partial<Dimension> } }
  | { type: 'DELETE_DIMENSION'; payload: string }
  | { type: 'ADD_GUIDE'; payload: Guide }
  | { type: 'REMOVE_GUIDE'; payload: string }
  | { type: 'UPDATE_GUIDE'; payload: { id: string; updates: Partial<Guide> } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'TOGGLE_GUIDES' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_PROJECT'; payload: unknown };

export interface Dimension {
  id: string;
  type: 'linear' | 'angular' | 'area' | 'radius';
  startPoint: Point;
  endPoint?: Point;
  centerPoint?: Point;
  points?: Point[];
  value: number;
  label: string;
  units: 'px' | 'ft' | 'in' | 'm' | 'cm';
  style: {
    showExtensionLines: boolean;
    extensionLineLength: number;
    textPosition: 'above' | 'below' | 'center';
    arrowStyle: 'arrow' | 'dot' | 'slash';
    color: string;
  };
}
