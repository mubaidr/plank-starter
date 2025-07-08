# Feature Specifications

## Introduction

This document specifies the features and functionalities of the web-based floor plan designer application, detailing user requirements and underlying data models.

## Core Functionality

### Canvas Interaction
-   **Zoom**: Pinch-to-zoom (touch), scroll wheel (mouse), zoom buttons (+/-).
-   **Pan**: Two-finger drag (touch), click-and-drag (mouse), pan buttons.
-   **Selection**:
    -   Single object selection by click.
    -   Multi-selection by Ctrl/Cmd + click.
    -   Area selection by drag rectangle.
    -   Lasso selection (advanced).
-   **Object Manipulation**: Move, rotate, scale, delete, duplicate.
-   **Undo/Redo**: Unlimited history for all actions.

### 2.2 Grid System
-   **Configurable Grid**: Size (e.g., 1ft, 1m, 6in), unit (imperial/metric), color, visibility.
-   **Snap-to-Grid**: Objects and drawing tools snap to grid points.
-   **Snap-to-Objects**: Objects snap to edges, centers, and intersections of other objects.
-   **Snap-to-Guides**: User-definable guidelines for snapping.
-   **Visual Indicators**: Highlighted snap points/lines.

### 2.3 Layers
-   **Layer Management**: Create, rename, delete, reorder layers.
-   **Visibility & Lock**: Toggle layer visibility and lock status.
-   **Object Assignment**: Assign objects to specific layers.
-   **Layer Properties**: Color coding, opacity, print control.

### 2.4 File Operations
-   **Save Project**: Save current floor plan to local storage (JSON format).
-   **Load Project**: Load previously saved projects.
-   **Auto-Save**: Periodically save changes.
-   **Export**:
    -   **PDF**: High-resolution export for printing, configurable scale, paper size.
    -   **PNG/JPG**: Image export, configurable resolution.
    -   **SVG**: Vector graphic export.
-   **Import**:
    -   **JSON**: Import existing project files.
    -   **Image**: Import image as background reference.

### 2.5 Advanced 2D Views
-   Top-down view of the floor plan.
-   Front, left, right, and back elevation views for individual floors.
-   Section views for individual floors.

### 2.6 Material Library
-   Extensive library of textures and materials.
-   Custom material import.
-   Material rendering in 2d view.

## 3. Drawing Tools

### 3.1 Wall Tool
-   **Drawing Modes**: Straight walls (click-to-start, click-to-end), continuous walls.
-   **Auto-Connect**: Walls automatically connect at endpoints and intersections.
-   **Properties**:
    -   **Thickness**: Configurable (e.g., 4", 6", 8", 10", 12").
    -   **Height**: Configurable (e.g., 8ft, 9ft, 10ft).
    -   **Material**: Dropdown selection (e.g., drywall, brick, concrete).
    -   **Load-Bearing**: Toggle.
-   **Editing**: Drag endpoints, split walls, join walls.

### 3.2 Door Tool
-   **Placement**: Click on a wall to place a door; auto-snaps to wall center or user-defined position.
-   **Types**: Single swing, double swing, sliding, bi-fold, pocket.
-   **Properties**:
    -   **Width**: Configurable (e.g., 24", 30", 36").
    -   **Height**: Configurable (e.g., 80", 84").
    -   **Swing Direction**: Left/Right/Both, configurable opening angle.
    -   **Material**: Dropdown selection.
-   **Editing**: Move along wall, resize, change type/swing.

### 3.3 Window Tool
-   **Placement**: Click on a wall to place a window; auto-snaps to wall center or user-defined position.
-   **Types**: Single hung, double hung, casement, sliding, bay, bow.
-   **Properties**:
    -   **Width**: Configurable.
    -   **Height**: Configurable.
    -   **Sill Height**: Distance from floor to bottom of window.
    -   **Material**: Dropdown selection.
    -   **Glazing Type**: Single, double, triple pane.
-   **Editing**: Move along wall, resize, change type.

### 3.4 Room Tool
-   **Auto-Detection**: Automatically detect enclosed areas formed by walls.
-   **Manual Definition**: Draw a polygon to define a room.
-   **Properties**:
    -   **Name**: User-defined (e.g., "Living Room", "Kitchen").
    -   **Type**: Dropdown (e.g., Bedroom, Bathroom, Office).
    -   **Area Calculation**: Automatic display of square footage/meters.
    -   **Floor Material**: Dropdown selection.
    -   **Ceiling Height**: Configurable.
-   **Editing**: Adjust boundaries, merge/split rooms.

### 3.5 Measurement Tool
-   **Distance**: Measure linear distance between two points.
-   **Area**: Measure area of any closed polygon (e.g., room, custom shape).
-   **Angle**: Measure angle between two lines.
-   **Dimension Lines**: Place permanent dimension annotations on the plan.
-   **Unit Conversion**: Display measurements in imperial or metric units.

### 3.6 Roof Tool
-   **Customizable Roofs**: Define and customize various roof types (e.g., gable, hip, flat, shed).
-   **Parameters**: Adjust pitch, overhang, and material.
-   **Auto-Generation**: Generate roofs based on wall outlines.

## 4. User Interface

### 4.1 Toolbar
-   **Tool Selection**: Icons for Wall, Door, Window, Room, Select, Pan, Zoom, Measure.
-   **Undo/Redo Buttons**.
-   **File Operations**: Save, Load, Export buttons.

### 4.2 Properties Panel (Right Sidebar)
-   **Contextual Properties**: Displays properties of selected object(s).
-   **Input Fields**: Text, number, dropdowns, toggles for object properties.
-   **Real-time Updates**: Changes in panel reflect immediately on canvas.
-   **Bulk Editing**: Edit common properties for multiple selected objects.

### 4.3 Layers Panel (Left Sidebar)
-   **Layer List**: Displays all defined layers.
-   **Controls**: Toggle visibility, lock, rename, delete, reorder.
-   **Active Layer Indicator**.

### 4.4 Status Bar (Bottom)
-   **Current Tool Indicator**.
-   **Mouse Coordinates**.
-   **Zoom Level**.
-   **Unit Display**.

## 5. Data Models & Schema

### 5.1 Core Data Structures

#### Base Object Interface
```typescript
interface FloorPlanObject {
  id: string;
  type: ObjectType;
  position: Point;
  rotation: number;
  scale: Point;
  visible: boolean;
  locked: boolean;
  layerId: string;
  properties: ObjectProperties;
  metadata: ObjectMetadata;
}

interface Point {
  x: number;
  y: number;
}

interface ObjectMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  version: number;
  tags?: string[];
}
```

#### Wall Object
```typescript
interface Wall extends FloorPlanObject {
  type: 'wall';
  startPoint: Point;
  endPoint: Point;
  thickness: number;
  height: number;
  material: WallMaterial;
  isLoadBearing: boolean;
  connectedWalls: string[];
  openings: Opening[];
  properties: WallProperties;
}

interface WallProperties {
  exteriorFinish?: string;
  interiorFinish?: string;
  insulation?: InsulationType;
  fireRating?: number;
  acousticRating?: number;
}

interface WallMaterial {
  name: string;
  color: string;
  texture?: string;
  pattern?: HatchPattern;
}

interface Opening {
  id: string;
  type: 'door' | 'window';
  position: number;
  width: number;
  height: number;
}
```

#### Door Object
```typescript
interface Door extends FloorPlanObject {
  type: 'door';
  wallId: string;
  width: number;
  height: number;
  swingDirection: SwingDirection;
  openingPercentage: number;
  material: DoorMaterial;
  properties: DoorProperties;
}

type SwingDirection = 'left' | 'right' | 'both' | 'sliding' | 'folding' | 'pocket';

interface DoorProperties {
  doorType: 'single' | 'double' | 'french' | 'sliding' | 'bifold';
  handleSide: 'left' | 'right';
  threshold: boolean;
  weatherStripping: boolean;
  lockType?: string;
  glazing?: GlazingType;
}

interface DoorMaterial {
  frame: MaterialSpec;
  panel: MaterialSpec;
  hardware: MaterialSpec;
}
```

#### Window Object
```typescript
interface Window extends FloorPlanObject {
  type: 'window';
  wallId: string;
  width: number;
  height: number;
  sillHeight: number;
  material: WindowMaterial;
  properties: WindowProperties;
}

interface WindowProperties {
  windowType: 'single' | 'double' | 'casement' | 'sliding' | 'bay' | 'bow';
  operationType: 'fixed' | 'operable';
  glazingLayers: number;
  frameType: 'wood' | 'vinyl' | 'aluminum' | 'composite';
  energyRating?: number;
  screens: boolean;
}

interface WindowMaterial {
  frame: MaterialSpec;
  glazing: GlazingType;
  trim: MaterialSpec;
}

interface GlazingType {
  type: 'clear' | 'tinted' | 'frosted' | 'tempered';
  thickness: number;
  coating?: string;
}
```

#### Room Object
```typescript
interface Room extends FloorPlanObject {
  type: 'room';
  boundary: Point[];
  area: number;
  perimeter: number;
  name: string;
  roomType: RoomType;
  floorMaterial: MaterialSpec;
  ceilingMaterial: MaterialSpec;
  properties: RoomProperties;
}

type RoomType =
  | 'living' | 'dining' | 'kitchen' | 'bedroom' | 'bathroom'
  | 'office' | 'storage' | 'utility' | 'garage' | 'hallway'
  | 'closet' | 'pantry' | 'laundry' | 'basement' | 'attic'
  | 'porch' | 'deck' | 'patio' | 'balcony' | 'other';

interface RoomProperties {
  ceilingHeight: number;
  floorLevel: number;
  ventilation: VentilationType[];
  lighting: LightingSpec[];
  electrical: ElectricalSpec[];
  plumbing: PlumbingSpec[];
  climate: ClimateSpec;
}
```

#### Stair Object
```typescript
interface Stair extends FloorPlanObject {
  type: 'stair';
  startPoint: Point;
  endPoint: Point;
  stairType: StairType;
  stepCount: number;
  stepWidth: number;
  stepHeight: number;
  handrail: HandrailSpec;
  properties: StairProperties;
}

type StairType = 'straight' | 'l-shaped' | 'u-shaped' | 'spiral' | 'curved' | 'winder';

interface StairProperties {
  totalRise: number;
  totalRun: number;
  landingWidth?: number;
  stringerType: 'open' | 'closed';
  material: StairMaterial;
}

interface StairMaterial {
  treads: MaterialSpec;
  risers: MaterialSpec;
  stringers: MaterialSpec;
  handrail: MaterialSpec;
}
```

#### Electrical Elements
```typescript
interface ElectricalElement extends FloorPlanObject {
  type: 'electrical';
  elementType: ElectricalType;
  voltage: number;
  amperage?: number;
  circuitId?: string;
  properties: ElectricalProperties;
}

type ElectricalType =
  | 'outlet' | 'switch' | 'light' | 'panel' | 'junction'
  | 'gfci' | 'dimmer' | 'fan' | 'smoke_detector' | 'security';

interface ElectricalProperties {
  height: number;               // Height from floor
  dedicated: boolean;           // Dedicated circuit
  weatherproof?: boolean;
  smartEnabled?: boolean;
}
```

#### Plumbing Elements
```typescript
interface PlumbingElement extends FloorPlanObject {
  type: 'plumbing';
  elementType: PlumbingType;
  waterType: 'hot' | 'cold' | 'mixed';
  properties: PlumbingProperties;
}

type PlumbingType =
  | 'sink' | 'toilet' | 'shower' | 'bathtub' | 'faucet'
  | 'water_heater' | 'drain' | 'vent' | 'shutoff' | 'meter';

interface PlumbingProperties {
  pipeSize: string;
  material: 'copper' | 'pex' | 'pvc' | 'cast_iron';
  pressure?: number;
  flow_rate?: number;
}
```

#### HVAC Elements
```typescript
interface HVACElement extends FloorPlanObject {
  type: 'hvac';
  elementType: HVACType;
  capacity?: number;             // BTU or CFM
  properties: HVACProperties;
}

type HVACType =
  | 'vent' | 'return' | 'unit' | 'duct' | 'thermostat'
  | 'fan' | 'damper' | 'filter' | 'coil';

interface HVACProperties {
  ductSize?: string;
  airflow?: number;             // CFM
  temperature?: number;
  zoneId?: string;
}
```

### 5.2 Canvas and View State

#### Canvas State
```typescript
interface CanvasState {
  viewport: Viewport;
  grid: GridState;
  snap: SnapState;
  selection: SelectionState;
  view: ViewState;
  interaction: InteractionState;
}

interface Viewport {
  zoom: number;                 // Zoom level (0.1 - 10.0)
  pan: Point;                   // Pan offset
  bounds: Bounds;               // Visible area bounds
  center: Point;                // Viewport center
}

interface GridState {
  visible: boolean;
  size: number;                 // Grid spacing
  unit: Unit;                   // Measurement unit
  subdivisions: number;         // Minor grid lines
  color: string;
  opacity: number;
}

interface SnapState {
  enabled: boolean;
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapToGuides: boolean;
  tolerance: number;            // Snap distance in pixels
}

interface SelectionState {
  selectedIds: string[];
  selectionBounds?: Bounds;
  multiSelect: boolean;
  selectionMode: 'single' | 'multiple' | 'area' | 'lasso';
}

interface ViewState {
  viewType: ViewType;
  showDimensions: boolean;
  showGrid: boolean;
  showGuides: boolean;
  showMeasurements: boolean;
  renderQuality: 'low' | 'medium' | 'high';
}

type ViewType = '2d' | 'elevation' | 'section' | '3d' | 'walkthrough';
```

### 5.3 Project and File Structure

#### Project Data
```typescript
interface FloorPlanProject {
  metadata: ProjectMetadata;
  settings: ProjectSettings;
  layers: Layer[];
  objects: Record<string, FloorPlanObject>;
  views: SavedView[];
  annotations: Annotation[];
  history: HistoryState;
}

interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags?: string[];
  thumbnail?: string;           // Base64 image
}

interface ProjectSettings {
  units: Unit;
  scale: number;
  precision: number;
  defaultWallThickness: number;
  defaultWallHeight: number;
  defaultDoorHeight: number;
  defaultWindowHeight: number;
  defaultSillHeight: number;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  printable: boolean;
  objectIds: string[];
  parentId?: string;            // For layer hierarchy
}

interface SavedView {
  id: string;
  name: string;
  viewType: ViewType;
  viewport: Viewport;
  layerVisibility: Record<string, boolean>;
  timestamp: Date;
}

interface Annotation {
  id: string;
  type: 'dimension' | 'label' | 'note' | 'arrow' | 'callout';
  position: Point;
  content: string;
  style: AnnotationStyle;
  targetId?: string;            // Referenced object ID
}
```

### 5.4 Material and Style System

#### Material Specifications
```typescript
interface MaterialSpec {
  id: string;
  name: string;
  category: MaterialCategory;
  properties: MaterialProperties;
  appearance: MaterialAppearance;
  cost?: CostData;
}

type MaterialCategory =
  | 'wood' | 'metal' | 'stone' | 'ceramic' | 'glass' | 'fabric'
  | 'plastic' | 'composite' | 'concrete' | 'masonry' | 'other';

interface MaterialProperties {
  density?: number;
  strength?: number;
  thermal?: ThermalProperties;
  acoustic?: AcousticProperties;
  fire?: FireProperties;
  moisture?: MoistureProperties;
}

interface MaterialAppearance {
  color: string;
  texture?: TextureSpec;
  pattern?: PatternSpec;
  finish: FinishType;
  reflectance?: number;
  transparency?: number;
}

interface TextureSpec {
  url: string;
  scale: Point;
  rotation: number;
  offset: Point;
}

type FinishType = 'matte' | 'satin' | 'semi-gloss' | 'gloss' | 'metallic';
```

### 5.5 Measurement and Units

```typescript
type Unit = 'inches' | 'feet' | 'meters' | 'centimeters' | 'millimeters';

interface Measurement {
  value: number;
  unit: Unit;
  precision: number;
  displayFormat: 'decimal' | 'fractional' | 'architectural';
}

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Dimension {
  id: string;
  startPoint: Point;
  endPoint: Point;
  offset: number;               // Offset from measured line
  value: Measurement;
  label?: string;
  style: DimensionStyle;
}

interface DimensionStyle {
  lineColor: string;
  textColor: string;
  fontSize: number;
  arrowStyle: 'arrow' | 'dot' | 'slash' | 'none';
  precision: number;
}
```

### 5.6 Validation Schema

```typescript
interface ValidationRule {
  field: string;
  type: 'required' | 'range' | 'pattern' | 'custom';
  params?: any;
  message: string;
}

const wallValidationRules: ValidationRule[] = [
  {
    field: 'thickness',
    type: 'range',
    params: { min: 1, max: 24 },
    message: 'Wall thickness must be between 1 and 24 inches'
  },
  {
    field: 'height',
    type: 'range',
    params: { min: 72, max: 144 },
    message: 'Wall height must be between 6 and 12 feet'
  }
];

const doorValidationRules: ValidationRule[] = [
  {
    field: 'width',
    type: 'range',
    params: { min: 24, max: 96 },
    message: 'Door width must be between 24 and 96 inches'
  }
];
```

## 6. Future Enhancements (Roadmap)

### 6.1 Advanced 2D Views
-   Top-down view of the floor plan.
-   Front, left, right, and back elevation views for individual floors.
-   Section views for individual floors.

### 6.2 Material Library
-   Extensive library of textures and materials.
-   Custom material import.
-   Material rendering in 2D view.

### 6.3 Furniture & Fixtures Library
-   Pre-built library of common furniture, appliances, and fixtures.
-   Drag-and-drop placement.
-   Custom object import.

### 6.5 Advanced Import/Export
-   Full DXF/DWG import/export.
-   Revit/BIM model import.
-   Integration with other design software.
