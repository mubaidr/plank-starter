// Core Types & Interfaces for Floor Plan Tool
// Based on API Reference specifications

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Unit = 'inches' | 'feet' | 'meters' | 'centimeters' | 'millimeters';
export type ViewType = '2d' | 'elevation' | 'section' | '3d' | 'walkthrough';
export type ToolType = 'select' | 'lasso' | 'wall' | 'door' | 'window' | 'room' | 'measure' | 'roof' | 'text' | 'rectangle' | 'circle' | 'line' | 'section';

// Base Floor Plan Object
export interface FloorPlanObject {
  id: string;
  type: string;
  position: Point;
  rotation: number;
  scale: Point;
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: Record<string, any>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

// Wall Object
export interface Wall extends FloorPlanObject {
  type: 'wall';
  startPoint: Point;
  endPoint: Point;
  thickness: number;
  height: number;
  material: string;
  isLoadBearing: boolean;
  openings: Opening[];
}

// Door Object
export interface Door extends FloorPlanObject {
  type: 'door';
  wallId: string;
  width: number;
  height: number;
  swingDirection: 'left' | 'right' | 'both' | 'sliding' | 'folding' | 'pocket';
  openingPercentage: number;
  doorType: 'single' | 'double' | 'french' | 'sliding' | 'bifold';
  material: string;
}

// Window Object
export interface Window extends FloorPlanObject {
  type: 'window';
  wallId: string;
  width: number;
  height: number;
  sillHeight: number;
  windowType: 'single' | 'double' | 'casement' | 'sliding' | 'bay' | 'bow';
  glazingLayers: number;
  frameType: 'wood' | 'vinyl' | 'aluminum' | 'composite';
  material: string;
}

// Room Object
export interface Room extends FloorPlanObject {
  type: 'room';
  boundary: Point[];
  area: number;
  perimeter: number;
  name: string;
  roomType: string;
  floorMaterial: string;
  ceilingMaterial: string;
  ceilingHeight: number;
}

// Opening (for walls)
export interface Opening {
  id: string;
  type: 'door' | 'window';
  position: number; // Position along wall (0-1)
  width: number;
  height: number;
}

// Canvas State
export interface CanvasState {
  viewport: Viewport;
  grid: GridState;
  snap: SnapState;
  selection: SelectionState;
  view: ViewState;
  interaction: InteractionState;
}

export interface Viewport {
  zoom: number;
  pan: Point;
  bounds: Bounds;
  center: Point;
}

export interface GridState {
  visible: boolean;
  size: number;
  unit: Unit;
  subdivisions: number;
  color: string;
  opacity: number;
}

export interface SnapState {
  enabled: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToGuides: boolean;
  tolerance: number;
}

export interface SelectionState {
  selectedIds: string[];
  selectionBounds?: Bounds;
  multiSelect: boolean;
  selectionMode: 'single' | 'multiple' | 'area' | 'lasso';
}

export interface ViewState {
  viewType: ViewType;
  showGrid: boolean;
  showSnapIndicators: boolean;
  showDimensions: boolean;
  showMaterials: boolean;
}

export interface InteractionState {
  isDrawing: boolean;
  isPanning: boolean;
  isSelecting: boolean;
  currentTool: ToolType;
  toolSettings: Record<string, any>;
}

// Layer State
export interface LayerState {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  printable: boolean;
}

// Floor Plan State
export interface FloorPlanState {
  objects: Record<string, FloorPlanObject>;
  layers: Record<string, LayerState>;
  canvas: CanvasState;
  project: ProjectMetadata;
  history: HistoryState;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  author?: string;
  tags: string[];
}

export interface HistoryState {
  past: FloorPlanState[];
  present: FloorPlanState;
  future: FloorPlanState[];
  maxHistorySize: number;
}

// Measurement Types
export interface Measurement {
  value: number;
  unit: Unit;
  precision: number;
  displayFormat: 'decimal' | 'fractional' | 'architectural';
}

export interface Dimension {
  id: string;
  startPoint: Point;
  endPoint: Point;
  offset: number;
  value: Measurement;
  label?: string;
  style: DimensionStyle;
}

export interface DimensionStyle {
  lineColor: string;
  textColor: string;
  fontSize: number;
  arrowStyle: 'arrow' | 'dot' | 'slash' | 'none';
  precision: number;
}

// Action Types for Reducers
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
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_PROJECT'; payload: FloorPlanState };

// Utility Types
export type ObjectType = FloorPlanObject['type'];
export type CreateObjectInput<T extends FloorPlanObject> = Omit<T, 'id' | 'metadata'>;
export type UpdateObjectInput<T extends FloorPlanObject> = Partial<Omit<T, 'id' | 'type' | 'metadata'>>;