# Floor Plan Tool - Troubleshooting Guide

## Common Issues & Solutions

### Canvas & Rendering Issues

#### Canvas Not Rendering
**Symptoms**: Blank canvas area, no Konva stage visible
**Causes & Solutions**:
```typescript
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!containerRef.current) {
    console.error('Canvas container not found');
    return;
  }
}, []);

.canvas-container {
  width: 100%;
  height: 100vh;
}
```

#### Performance Issues with Large Drawings
**Symptoms**: Slow rendering, laggy interactions
**Solutions**:
```typescript
const objectPool = new Map<string, Konva.Shape>();

const backgroundShape = new Konva.Rect({
  listening: false,
});

layer.cache();
layer.getCanvas().getPixelRatio = () => 1;
```

#### Memory Leaks
**Symptoms**: Increasing memory usage, browser slowdown
**Solutions**:
```typescript
useEffect(() => {
  return () => {
    stage.destroy();
  };
}, []);

useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

### Tool-Specific Issues

#### Wall Tool Not Connecting
**Symptoms**: Walls don't join at endpoints
**Debug Steps**:
```typescript
const SNAP_TOLERANCE = 10;
const nearbyPoint = findNearbyPoint(mousePos, SNAP_TOLERANCE);

const isNearEndpoint = (point: Point, wall: Wall) => {
  const distToStart = distance(point, wall.startPoint);
  const distToEnd = distance(point, wall.endPoint);
  return Math.min(distToStart, distToEnd) < SNAP_TOLERANCE;
};

console.log('Connected walls:', wall.connectedWalls);
```

#### Door/Window Placement Issues
**Symptoms**: Doors/windows not snapping to walls
**Solutions**:
```typescript
const getWallAtPoint = (point: Point): Wall | null => {
  return walls.find(wall => {
    const distance = pointToLineDistance(point, [wall.startPoint, wall.endPoint]);
    return distance < wall.thickness / 2;
  });
};

const getPositionOnWall = (point: Point, wall: Wall): number => {
  const wallVector = {
    x: wall.endPoint.x - wall.startPoint.x,
    y: wall.endPoint.y - wall.startPoint.y
  };
  const wallLength = Math.sqrt(wallVector.x ** 2 + wallVector.y ** 2);
};
```

### State Management Issues

#### Context Not Updating
**Symptoms**: UI not reflecting state changes
**Debug Steps**:
```typescript
// Check context provider wrapping
const App = () => (
  <FloorPlanProvider>
    <ToolProvider>
      <YourComponent />
    </ToolProvider>
  </FloorPlanProvider>
);

// Verify dispatch calls
const { dispatch } = useFloorPlanContext();
dispatch({ type: 'ADD_OBJECT', payload: object });

// Check reducer implementation
const floorPlanReducer = (state: FloorPlanState, action: FloorPlanAction) => {
  console.log('Action:', action.type, action.payload);
  // Ensure new state object is returned
  return { ...state, /* updates */ };
};
```

#### Undo/Redo Not Working
**Symptoms**: History operations don't restore previous state
**Solutions**:
```typescript
// Ensure state is properly serializable
const saveState = (state: FloorPlanState): string => {
  try {
    return JSON.stringify(state);
  } catch (error) {
    console.error('State not serializable:', error);
    return '';
  }
};

// Check history limits
const MAX_HISTORY = 50;
const addToHistory = (state: FloorPlanState) => {
  const newHistory = [...history.past, history.present].slice(-MAX_HISTORY);
  return { past: newHistory, present: state, future: [] };
};
```

### File Operations Issues

#### Export Not Working
**Symptoms**: Export functions fail or produce empty files
**Debug Steps**:
```typescript
// Check stage data URL generation
const dataURL = stage.toDataURL({
  mimeType: 'image/png',
  quality: 1,
  pixelRatio: 2
});

if (!dataURL || dataURL === 'data:,') {
  console.error('Stage export failed - check if stage has content');
}

// Verify PDF export
const exportToPDF = async (stage: Konva.Stage) => {
  try {
    const canvas = stage.toCanvas();
    const imgData = canvas.toDataURL('image/png');
    // Use PDF library to create document
  } catch (error) {
    console.error('PDF export failed:', error);
  }
};
```

#### Import Validation Errors
**Symptoms**: Imported files cause errors or don't load
**Solutions**:
```typescript
// Validate file format
const validateFloorPlanFile = (data: any): boolean => {
  const requiredFields = ['version', 'objects', 'layers', 'canvas'];
  return requiredFields.every(field => field in data);
};

// Handle version compatibility
const migrateFileVersion = (data: any): FloorPlanState => {
  if (data.version < CURRENT_VERSION) {
    // Apply migrations
    data = applyMigrations(data);
  }
  return data;
};
```

### Browser Compatibility Issues

#### Safari Canvas Issues
**Symptoms**: Canvas not rendering properly in Safari
**Solutions**:
```typescript
// Use explicit canvas sizing
const stage = new Konva.Stage({
  container: containerRef.current,
  width: containerRef.current.offsetWidth,
  height: containerRef.current.offsetHeight,
});

// Handle Safari-specific events
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (isSafari) {
  // Safari-specific handling
}
```

#### Mobile Touch Issues
**Symptoms**: Touch events not working on mobile
**Solutions**:
```typescript
// Enable touch events
stage.listening(true);

// Handle touch-specific events
stage.on('touchstart', (e) => {
  const touch = e.evt.touches[0];
  const pos = stage.getPointerPosition();
  // Handle touch start
});

// Prevent default touch behaviors
stage.on('touchmove', (e) => {
  e.evt.preventDefault();
});
```

## Performance Optimization

### Canvas Performance
```typescript
// Batch operations
stage.batchDraw(); // Instead of layer.draw() multiple times

// Use efficient shapes
const efficientRect = new Konva.Rect({
  perfectDrawEnabled: false, // Faster rendering
  shadowForStrokeEnabled: false, // Disable if not needed
});

// Optimize hit detection
const shape = new Konva.Shape({
  hitFunc: (context, shape) => {
    // Custom hit detection for complex shapes
    context.beginPath();
    context.rect(0, 0, shape.width(), shape.height());
    context.closePath();
    context.fillStrokeShape(shape);
  }
});
```

### Memory Management
```typescript
// Clean up unused objects
const cleanupObjects = () => {
  Object.keys(objects).forEach(id => {
    if (!isObjectVisible(objects[id])) {
      delete objects[id];
    }
  });
};

// Use object pooling
class ShapePool {
  private pool: Map<string, Konva.Shape[]> = new Map();
  
  get(type: string): Konva.Shape {
    const shapes = this.pool.get(type) || [];
    return shapes.pop() || this.createShape(type);
  }
  
  release(type: string, shape: Konva.Shape) {
    shape.remove();
    const shapes = this.pool.get(type) || [];
    shapes.push(shape);
    this.pool.set(type, shapes);
  }
}
```

## Debugging Tools

### Development Helpers
```typescript
// Canvas debug overlay
const addDebugOverlay = (stage: Konva.Stage) => {
  const debugLayer = new Konva.Layer();
  
  // Show object bounds
  objects.forEach(obj => {
    const bounds = obj.getClientRect();
    const rect = new Konva.Rect({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      stroke: 'red',
      strokeWidth: 1,
      listening: false,
    });
    debugLayer.add(rect);
  });
  
  stage.add(debugLayer);
};

// State inspector
const StateInspector = () => {
  const { state } = useFloorPlanContext();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed top-0 right-0 bg-black text-white p-4 max-w-sm overflow-auto">
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};
```

### Performance Monitoring
```typescript
// Canvas FPS monitor
class FPSMonitor {
  private frames = 0;
  private lastTime = performance.now();
  
  update() {
    this.frames++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      console.log(`FPS: ${this.frames}`);
      this.frames = 0;
      this.lastTime = currentTime;
    }
  }
}

// Memory usage tracking
const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
};
```

## Error Boundaries

### Canvas Error Boundary
```typescript
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Canvas error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="canvas-error">
          <h2>Canvas Error</h2>
          <p>Something went wrong with the canvas rendering.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Testing Debugging

### Test Utilities
```typescript
// Canvas test helpers
export const createMockStage = () => {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
  
  return new Konva.Stage({
    container,
    width: 800,
    height: 600,
  });
};

// Debug test failures
export const debugTestState = (state: FloorPlanState) => {
  console.log('Test State Debug:', {
    objectCount: Object.keys(state.objects).length,
    selectedCount: state.canvas.selectedObjects.length,
    activeTool: state.tools.activeTool,
    canvasZoom: state.canvas.zoom,
  });
};
```

This troubleshooting guide should help developers quickly identify and resolve common issues during floor plan tool development.