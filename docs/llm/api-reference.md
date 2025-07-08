# API Reference

## Core Types & Interfaces

### Base Types
```typescript
interface Point {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

type Unit = 'inches' | 'feet' | 'meters' | 'centimeters';
type ViewType = '2d' | 'elevation' | 'section';
type ToolType = 'select' | 'wall' | 'door' | 'window' | 'room' | 'measure' | 'roof';
```

### Floor Plan Objects
```typescript
interface FloorPlanObject {
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

interface Wall extends FloorPlanObject {
  type: 'wall';
  startPoint: Point;
  endPoint: Point;
  thickness: number;
  height: number;
  material: string;
  isLoadBearing: boolean;
  connectedWalls: string[];
}

interface Door extends FloorPlanObject {
  type: 'door';
  wallId: string;
  width: number;
  height: number;
  swingDirection: 'left' | 'right' | 'both' | 'sliding';
  openingPercentage: number;
  material: string;
}

interface Window extends FloorPlanObject {
  type: 'window';
  wallId: string;
  width: number;
  height: number;
  sillHeight: number;
  material: string;
  glazingType: string;
}

interface Room extends FloorPlanObject {
  type: 'room';
  boundary: Point[];
  area: number;
  name: string;
  roomType: string;
  floorMaterial: string;
  ceilingHeight: number;
}
```

### Canvas State
```typescript
interface CanvasState {
  zoom: number;
  pan: Point;
  viewType: ViewType;
  gridVisible: boolean;
  gridSize: number;
  gridUnit: Unit;
  snapToGrid: boolean;
  snapToObjects: boolean;
  selectedObjects: string[];
  clipboard: FloorPlanObject[];
}

interface LayerState {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  objects: string[];
}

interface FloorPlanState {
  canvas: CanvasState;
  layers: LayerState[];
  objects: Record<string, FloorPlanObject>;
  history: HistoryState;
  tools: ToolState;
  project: ProjectState;
}
```

## Context APIs

### FloorPlanContext
```typescript
interface FloorPlanContextType {
  state: FloorPlanState;
  dispatch: React.Dispatch<FloorPlanAction>;

  addObject: (object: FloorPlanObject) => void;
  updateObject: (id: string, updates: Partial<FloorPlanObject>) => void;
  deleteObject: (id: string) => void;
  selectObjects: (ids: string[]) => void;

  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  setViewType: (viewType: ViewType) => void;

  addLayer: (layer: Omit<LayerState, 'id'>) => void;
  updateLayer: (id: string, updates: Partial<LayerState>) => void;
  deleteLayer: (id: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
```

### ToolContext
```typescript
interface ToolContextType {
  activeTool: ToolType;
  toolSettings: Record<string, any>;
  setActiveTool: (tool: ToolType) => void;
  updateToolSettings: (settings: Record<string, any>) => void;

  startDrawing: (point: Point) => void;
  continueDrawing: (point: Point) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;
}
```

## Custom Hooks

### Canvas Hooks
```typescript
function useCanvasInteraction() {
  return {
    onMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
    onMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
    onMouseUp: (e: KonvaEventObject<MouseEvent>) => void;
    onWheel: (e: KonvaEventObject<WheelEvent>) => void;
  };
}

function useSelection() {
  return {
    selectedObjects: FloorPlanObject[];
    selectObject: (id: string, multi?: boolean) => void;
    selectArea: (bounds: Bounds) => void;
    clearSelection: () => void;
    deleteSelected: () => void;
  };
}

function useMeasurement() {
  return {
    measureDistance: (start: Point, end: Point) => number;
    measureArea: (points: Point[]) => number;
    measureAngle: (p1: Point, p2: Point, p3: Point) => number;
    formatMeasurement: (value: number, unit: Unit) => string;
  };
}
```

### Tool Hooks
```typescript
function useWallTool() {
  return {
    isDrawing: boolean;
    previewWall: Wall | null;
    startWall: (point: Point) => void;
    updateWall: (point: Point) => void;
    finishWall: () => void;
    cancelWall: () => void;
  };
}

function useDoorTool() {
  return {
    availableWalls: Wall[];
    selectedWall: Wall | null;
    previewDoor: Door | null;
    placeDoor: (wall: Wall, position: number) => void;
    updateDoorPosition: (position: number) => void;
    finishDoorPlacement: () => void;
  };
}
```

## Utility Functions

### Geometry Utilities
```typescript
function distance(p1: Point, p2: Point): number;
function midpoint(p1: Point, p2: Point): Point;
function rotate(point: Point, center: Point, angle: number): Point;
function translate(point: Point, offset: Point): Point;

function lineIntersection(l1: [Point, Point], l2: [Point, Point]): Point | null;
function pointToLineDistance(point: Point, line: [Point, Point]): number;
function isPointOnLine(point: Point, line: [Point, Point], tolerance: number): boolean;

function polygonArea(points: Point[]): number;
function isPointInPolygon(point: Point, polygon: Point[]): boolean;
function polygonBounds(points: Point[]): Bounds;
```

### Conversion Utilities
```typescript
function convertUnit(value: number, from: Unit, to: Unit): number;
function formatUnit(value: number, unit: Unit, precision?: number): string;

function screenToCanvas(point: Point, canvas: CanvasState): Point;
function canvasToScreen(point: Point, canvas: CanvasState): Point;
function snapToGrid(point: Point, gridSize: number): Point;
```

### File Operations
```typescript
function exportToPDF(state: FloorPlanState, options: ExportOptions): Promise<Blob>;
function exportToPNG(stage: Konva.Stage, options: ExportOptions): Promise<Blob>;
function exportToSVG(state: FloorPlanState, options: ExportOptions): Promise<string>;
function exportToJSON(state: FloorPlanState): string;

function importFromJSON(json: string): Promise<FloorPlanState>;
function importFromDXF(file: File): Promise<FloorPlanObject[]>;
function importFromSVG(file: File): Promise<FloorPlanObject[]>;
```

## Event System

### Canvas Events
```typescript
interface CanvasEvents {
  'object:added': (object: FloorPlanObject) => void;
  'object:updated': (object: FloorPlanObject) => void;
  'object:deleted': (objectId: string) => void;
  'selection:changed': (selectedIds: string[]) => void;
  'canvas:zoomed': (zoom: number) => void;
  'canvas:panned': (pan: Point) => void;
  'tool:changed': (tool: ToolType) => void;
}
