import { ElectricalElement } from './electricalTypes';
import { PlumbingElement } from './plumbingTypes';
import { HVACElement } from './hvacTypes';
import { BaseObject, Point } from './coreTypes';

export type ViewType = '2d' | 'elevation' | 'section' | '3d' | 'walkthrough';

export type FloorPlanObject =
  | ElectricalElement
  | PlumbingElement
  | HVACElement
  | (BaseObject & {
      type: string; // For any other types not specifically handled
    });

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
    toolSettings: Record<string, any>;
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
  past: any[];
  present: any;
  future: any[];
  maxHistorySize: number;
}

export interface FloorPlanState {
  objects: Record<string, FloorPlanObject>;
  layers: Record<string, LayerState>;
  canvas: CanvasState;
  project: ProjectState;
  dimensions: Record<string, Dimension>;
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
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_PROJECT'; payload: any };

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
