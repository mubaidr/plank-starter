# Coding Agent Guide

## Quick Start for AI Assistants

### Understanding the Codebase
This floor plan application is **feature-complete** with advanced functionality. Before making changes:

1. **Check existing implementations** - Most features are already built
2. **Review TODO comments** - Focus on completing existing functionality
3. **Follow established patterns** - Don't reinvent existing systems
4. **Maintain type safety** - Use existing TypeScript definitions

### Current State Analysis

#### ✅ FULLY IMPLEMENTED
- **Core Canvas**: Konva.js with zoom, pan, selection, layers
- **Drawing Tools**: Wall, Door, Window, Room, Text, Dimension tools with auto-connect
- **Layer System**: Color coding, opacity, print control, visibility management
- **History Management**: Unlimited undo/redo with proper state snapshots
- **Validation**: Comprehensive rules for geometry, architecture, accessibility
- **MEP Integration**: Electrical, HVAC, Plumbing type systems
- **Selection System**: Including advanced lasso selection
- **UI Components**: Responsive toolbar, panels, dialogs

#### 🚧 NEEDS IMPLEMENTATION (Priority Order)
1. **File Operations**: Connect UI to existing storage utilities
2. **Export Functionality**: Connect dialogs to existing PDF/PNG exporters  
3. **Grid Toggle**: Implement grid visibility controls
4. **Snap System**: Enhance existing snap-to-grid/objects
5. **Guides Panel**: Implement user-defined guidelines

### Key Implementation Patterns

#### 1. Context Usage Pattern
```typescript
// Always use existing context methods
const { state, addObject, updateObject, undo, redo } = useFloorPlanContext();
const { activeTool, setActiveTool } = useToolContext();

// For file operations (when implementing)
const { saveProject, loadProject } = useFileOperationsContext();
```

#### 2. Object Creation Pattern
```typescript
// Follow this exact pattern for new objects
const createFloorPlanObject = (type: string, position: Point): FloorPlanObject => ({
  id: `${Date.now()}-${Math.random()}`,
  type,
  position,
  rotation: 0,
  scale: { x: 1, y: 1 },
  visible: true,
  locked: false,
  layerId: state.activeLayerId,
  properties: {},
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1
  }
});
```

#### 3. Validation Integration
```typescript
// Always validate objects after creation/modification
const { validateObject, getValidationIssues } = useValidationRules();

const handleObjectUpdate = (object: FloorPlanObject) => {
  updateObject(object.id, object);
  validateObject(object); // Automatic validation
};
```

#### 4. Canvas Event Handling
```typescript
// Follow existing patterns from SimpleCanvas.tsx
const handleCanvasClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
  const stage = e.target.getStage();
  const pos = stage?.getPointerPosition();
  if (!pos) return;

  switch (activeTool) {
    case 'wall':
      // Use existing wall creation logic
      break;
    case 'door':
      // Use existing door placement logic
      break;
  }
}, [activeTool]);
```

### Common Implementation Tasks

#### Implementing TODO Items
```typescript
// Example: Implementing save functionality
const handleSave = async () => {
  try {
    const projectData: ProjectData = {
      version: '1.0',
      metadata: {
        name: 'Floor Plan',
        description: '',
        author: 'User',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        scale: 1,
        units: state.settings.unitSystem
      },
      objects: Object.values(state.objects),
      layers: Object.values(state.layers),
      measurements: state.dimensions,
      settings: state.settings
    };
    
    // Use existing storage utilities
    await saveToIndexedDB('current-project', projectData);
    // Show success feedback
  } catch (error) {
    console.error('Save failed:', error);
    // Show error feedback
  }
};
```

#### Adding New Tools
```typescript
// Follow existing tool patterns from WallTool.tsx, DoorTool.tsx
export const NewTool: React.FC<ToolProps> = ({ isActive, onComplete }) => {
  const { state, addObject } = useFloorPlanContext();
  const [toolState, setToolState] = useState({});

  // Tool-specific logic here
  
  return (
    <div className="flex flex-col gap-2 p-3">
      <h3 className="font-medium">New Tool</h3>
      {/* Tool controls following existing UI patterns */}
    </div>
  );
};
```

### Performance Considerations

#### Konva.js Optimization
```typescript
// Always follow these patterns for canvas performance
const layer = new Konva.Layer({
  listening: false // For background/static objects
});

// Cache complex shapes
complexShape.cache();

// Batch updates
layer.batchDraw();
```

#### State Management
```typescript
// Use callbacks to prevent unnecessary re-renders
const handleUpdate = useCallback((updates) => {
  updateObject(objectId, updates);
}, [objectId, updateObject]);

// Memoize expensive calculations
const validationResults = useMemo(() => {
  return validateAllObjects(state.objects);
}, [state.objects]);
```

### Testing Approach

#### Component Testing
```typescript
// Test tool functionality
describe('NewTool', () => {
  it('creates objects correctly', () => {
    const mockAddObject = jest.fn();
    // Test implementation
  });
  
  it('validates input properly', () => {
    // Test validation logic
  });
});
```

#### Integration Testing
```typescript
// Test with actual context
const TestWrapper = ({ children }) => (
  <FloorPlanProvider>
    <ToolProvider>
      {children}
    </ToolProvider>
  </FloorPlanProvider>
);
```

### Common Pitfalls to Avoid

1. **Don't bypass existing validation** - Always use `useValidationRules`
2. **Don't mutate state directly** - Use context methods
3. **Don't ignore layer system** - Objects must have valid `layerId`
4. **Don't forget metadata** - All objects need proper metadata
5. **Don't skip error handling** - Implement proper try/catch blocks
6. **Don't ignore mobile** - Test responsive behavior
7. **Don't break undo/redo** - Use context methods for state changes

### Debugging Tips

#### Canvas Issues
```typescript
// Debug canvas rendering
console.log('Stage:', stage.toJSON());
console.log('Layer children:', layer.children.length);

// Check object bounds
const bounds = object.getClientRect();
console.log('Object bounds:', bounds);
```

#### State Issues
```typescript
// Debug state changes
console.log('Current state:', state);
console.log('History size:', getHistorySize());
console.log('Can undo/redo:', canUndo, canRedo);
```

#### Performance Issues
```typescript
// Monitor render performance
const startTime = performance.now();
layer.draw();
console.log('Render time:', performance.now() - startTime);
```

### Next Steps for Development

1. **Complete TODO items** in FloorPlanApp.tsx
2. **Enhance existing tools** rather than creating new ones
3. **Improve validation rules** for edge cases
4. **Add comprehensive error handling**
5. **Optimize canvas performance** for large drawings
6. **Add unit tests** for critical functionality
7. **Improve accessibility** features

Remember: This is a mature codebase with sophisticated architecture. Focus on completing and enhancing existing functionality rather than major architectural changes.