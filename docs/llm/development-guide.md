# Development Guide

## Code Standards & Best Practices

### TypeScript Guidelines
- **Strict Mode**: Always use strict TypeScript configuration
- **Type Safety**: Prefer explicit types over `any`, use type guards
- **Interfaces**: Define clear interfaces for all data structures
- **Generics**: Use generics for reusable components and utilities
- **Naming**: Use PascalCase for types/interfaces, camelCase for variables/functions

### React Component Guidelines
- **Functional Components**: Use function components with hooks
- **Props Interface**: Always define props interface for components
- **Default Props**: Use default parameters instead of defaultProps
- **Memo**: Use React.memo for performance-critical components
- **Custom Hooks**: Extract complex logic into custom hooks

### Konva.js Best Practices
- **Layer Organization**: Separate objects into logical layers
- **Performance**: Use `listening: false` for non-interactive objects
- **Memory Management**: Properly destroy stages and layers
- **Event Handling**: Use delegation for better performance
- **Caching**: Cache complex shapes when possible

### State Management Patterns
- **Context Usage**: Use Context for global state (canvas, tools, layers)
- **Local State**: Keep component-specific state local
- **Reducers**: Use useReducer for complex state logic
- **Immutability**: Always return new state objects
- **State Shape**: Keep state normalized and flat

### File Organization
```
src/
├── app/
├── components/
│   ├── ui/
│   ├── canvas/
│   ├── tools/
│   └── panels/
├── hooks/
├── context/
├── types/
├── utils/
├── constants/
└── lib/
```

### Accessibility Requirements
- **Keyboard Navigation**: All tools accessible via keyboard
- **Screen Readers**: Proper ARIA labels and descriptions
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: Meet WCAG 2.1 AA standards
- **Alternative Input**: Support for various input methods

### Error Handling
- **Boundary Components**: Use Error Boundaries for canvas errors
- **Validation**: Validate user inputs and file formats
- **Graceful Degradation**: Handle missing features gracefully
- **User Feedback**: Clear error messages and recovery options
- **Logging**: Comprehensive error logging for debugging

### Security Considerations
- **File Uploads**: Validate file types and sizes
- **XSS Prevention**: Sanitize user-generated content
- **Data Validation**: Validate all external data
- **CORS**: Proper CORS configuration for file operations
- **Content Security Policy**: Implement CSP headers

## 2. Implementation Patterns

### Standard Component Pattern
```typescript
interface ToolProps {
  isActive: boolean;
  onComplete?: (object: FloorPlanObject) => void;
}

export const ToolComponent: React.FC<ToolProps> = ({ isActive, onComplete }) => {
  const { state, dispatch } = useFloorPlanContext();
  const [isDrawing, setIsDrawing] = useState(false);

  return (
    <div className="tool-component">
    </div>
  );
};
```

### Canvas Integration Pattern
```typescript
const useCanvasEvents = (tool: ToolType) => {
  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    switch (tool) {
      case 'wall':
        startWallDrawing(pos);
        break;
      case 'door':
        placeDoor(pos);
        break;
    }
  }, [tool]);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
};
```

### State Update Pattern
```typescript
const updateObject = (id: string, updates: Partial<FloorPlanObject>) => {
  dispatch({
    type: 'UPDATE_OBJECT',
    payload: { id, updates },
    meta: {
      undoable: true,
      description: `Update ${updates.type || 'object'}`
    }
  });
};
```

### Layer Management Pattern
```typescript
const setupLayers = (stage: Konva.Stage) => {
  const backgroundLayer = new Konva.Layer({ name: 'background' });
  const gridLayer = new Konva.Layer({ name: 'grid', listening: false });
  const structuralLayer = new Konva.Layer({ name: 'structural' });
  const furnitureLayer = new Konva.Layer({ name: 'furniture' });
  const annotationLayer = new Konva.Layer({ name: 'annotation' });
  const uiLayer = new Konva.Layer({ name: 'ui' });

  stage.add(backgroundLayer, gridLayer, structuralLayer, furnitureLayer, annotationLayer, uiLayer);
  return { backgroundLayer, gridLayer, structuralLayer, furnitureLayer, annotationLayer, uiLayer };
};
```

### Tool Implementation Patterns

### Wall Tool Pattern
```typescript
const useWallTool = () => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [previewWall, setPreviewWall] = useState<Wall | null>(null);

  const startWall = (point: Point) => {
    setStartPoint(snapToGrid(point));
  };

  const updatePreview = (point: Point) => {
    if (!startPoint) return;
    const endPoint = snapToGrid(point);
    setPreviewWall(createWall(startPoint, endPoint));
  };

  const finishWall = () => {
    if (previewWall) {
      addObject(previewWall);
      setStartPoint(null);
      setPreviewWall(null);
    }
  };

  return { startWall, updatePreview, finishWall, previewWall };
};
```

### Door/Window Placement Pattern
```typescript
const useDoorPlacement = () => {
  const findNearestWall = (point: Point): Wall | null => {
    const walls = getObjectsByType('wall') as Wall[];
    let nearestWall = null;
    let minDistance = Infinity;

    walls.forEach(wall => {
      const distance = pointToLineDistance(point, [wall.startPoint, wall.endPoint]);
      if (distance < minDistance && distance < SNAP_THRESHOLD) {
        minDistance = distance;
        nearestWall = wall;
      }
    });

    return nearestWall;
  };

  const placeDoor = (point: Point) => {
    const wall = findNearestWall(point);
    if (wall) {
      const door = createDoorOnWall(wall, point);
      addObject(door);
    }
  };

  return { placeDoor, findNearestWall };
};
```

### Selection System Pattern
```typescript
const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<Bounds | null>(null);

  const selectObject = (id: string, multiSelect = false) => {
    setSelectedIds(prev => {
      if (multiSelect) {
        return prev.includes(id)
          ? prev.filter(i => i !== id)
          : [...prev, id];
      }
      return [id];
    });
  };

  const selectInArea = (bounds: Bounds) => {
    const objectsInArea = Object.values(state.objects)
      .filter(obj => boundsIntersect(getObjectBounds(obj), bounds))
      .map(obj => obj.id);
    setSelectedIds(objectsInArea);
  };

  return { selectedIds, selectObject, selectInArea, clearSelection: () => setSelectedIds([]) };
};
```

### Utility Patterns

### Geometry Calculations
```typescript
const geometryUtils = {
  distance: (p1: Point, p2: Point) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2),

  midpoint: (p1: Point, p2: Point) => ({
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  }),

  rotate: (point: Point, center: Point, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    };
  },

  snapToGrid: (point: Point, gridSize: number) => ({
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize
  })
};
```

### File Operations Pattern
```typescript
const useFileOperations = () => {
  const saveProject = async (state: FloorPlanState, filename: string) => {
    const data = {
      version: '1.0',
      metadata: {
        created: new Date().toISOString(),
        application: 'Floor Plan Tool'
      },
      ...state
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.floorplan`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const loadProject = async (file: File): Promise<FloorPlanState> => {
    const text = await file.text();
    const data = JSON.parse(text);

    return validateAndMigrateProject(data);
  };

  return { saveProject, loadProject };
};
```

### Performance Optimization Patterns

### Viewport Culling
```typescript
const useViewportCulling = () => {
  const getVisibleObjects = (viewport: Bounds, objects: FloorPlanObject[]) => {
    return objects.filter(obj => {
      const bounds = getObjectBounds(obj);
      return boundsIntersect(bounds, viewport);
    });
  };

  const updateViewport = (stage: Konva.Stage) => {
    const scale = stage.scaleX();
    const position = stage.position();

    return {
      x: -position.x / scale,
      y: -position.y / scale,
      width: stage.width() / scale,
      height: stage.height() / scale
    };
  };

  return { getVisibleObjects, updateViewport };
};
```

### Object Pooling
```typescript
const useObjectPool = <T extends Konva.Shape>(createFn: () => T) => {
  const pool: T[] = [];
  const active: T[] = [];

  const acquire = (): T => {
    const obj = pool.pop() || createFn();
    active.push(obj);
    return obj;
  };

  const release = (obj: T) => {
    const index = active.indexOf(obj);
    if (index > -1) {
      active.splice(index, 1);
      obj.visible(false);
      pool.push(obj);
    }
  };

  return { acquire, release };
};
```

## 3. Code Generation Templates

### New Tool Component Template
```typescript
// Template: src/components/tools/{ToolName}Tool.tsx
import React, { useState, useCallback } from 'react';
import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { useToolContext } from '@/context/ToolContext';
import { Point, {ToolName}Object } from '@/types';

interface {ToolName}ToolProps {
  isActive: boolean;
}

export const {ToolName}Tool: React.FC<{ToolName}ToolProps> = ({ isActive }) => {
  const { state, addObject } = useFloorPlanContext();
  const { toolSettings } = useToolContext();
  const [isDrawing, setIsDrawing] = useState(false);
  const [preview, setPreview] = useState<{ToolName}Object | null>(null);

  const handleStart = useCallback((point: Point) => {
    if (!isActive) return;
    setIsDrawing(true);
  }, [isActive]);

  const handleMove = useCallback((point: Point) => {
    if (!isDrawing) return;
  }, [isDrawing]);

  const handleEnd = useCallback(() => {
    if (!isDrawing || !preview) return;
    addObject(preview);
    setIsDrawing(false);
    setPreview(null);
  }, [isDrawing, preview, addObject]);

  React.useEffect(() => {
    if (!isActive) return;

    const canvas = document.getElementById('floor-plan-canvas');
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseup', handleEnd);
    };
  }, [isActive, handleStart, handleMove, handleEnd]);

  return null;
};
```

### Custom Hook Template
```typescript
// Template: src/hooks/use{HookName}.ts
import { useState, useCallback, useRef } from 'react';
import { useFloorPlanContext } from '@/context/FloorPlanContext';

export const use{HookName} = () => {
  const { state, dispatch } = useFloorPlanContext();
  const [localState, setLocalState] = useState(/* initial state */);
  const refValue = useRef(/* ref initial value */);

  const handleAction = useCallback((/* parameters */) => {
  }, [/* dependencies */]);

  const resetState = useCallback(() => {
    setLocalState(/* reset value */);
  }, []);

  return {
    localState,
    handleAction,
    resetState,
  };
};
```

### Context Provider Template
```typescript
// Template: src/context/{ContextName}Context.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface {ContextName}State {
}

type {ContextName}Action =
  | { type: 'ACTION_TYPE'; payload: any }
  | { type: 'ANOTHER_ACTION' };

interface {ContextName}ContextType {
  state: {ContextName}State;
  dispatch: React.Dispatch<{ContextName}Action>;
}

const initial{ContextName}State: {ContextName}State = {
};

const {contextName}Reducer = (state: {ContextName}State, action: {ContextName}Action): {ContextName}State => {
  switch (action.type) {
    case 'ACTION_TYPE':
      return {
        ...state,
      };
    default:
      return state;
  }
};

const {ContextName}Context = createContext<{ContextName}ContextType | undefined>(undefined);

export const {ContextName}Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer({contextName}Reducer, initial{ContextName}State);

  const helperFunction = (/* params */) => {
    dispatch({ type: 'ACTION_TYPE', payload: /* data */ });
  };

  const value = {
    state,
    dispatch,
    helperFunction,
  };

  return (
    <{ContextName}Context.Provider value={value}>
      {children}
    </{ContextName}Context.Provider>
  );
};

export const use{ContextName}Context = () => {
  const context = useContext({ContextName}Context);
  if (context === undefined) {
    throw new Error('use{ContextName}Context must be used within a {ContextName}Provider');
  }
  return context;
};
```

### Konva Component Template
```typescript
// Template: src/components/canvas/{ObjectName}.tsx
import React from 'react';
import { Group, Rect, Line, Circle } from 'react-konva';
import { {ObjectName}Object } from '@/types';

interface {ObjectName}Props {
  object: {ObjectName}Object;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (updates: Partial<{ObjectName}Object>) => void;
}

export const {ObjectName}: React.FC<{ObjectName}Props> = ({
  object,
  isSelected = false,
  onSelect,
  onUpdate,
}) => {
  const handleDragEnd = (e: any) => {
    const node = e.target;
    onUpdate?.({
      position: {
        x: node.x(),
        y: node.y(),
      },
    });
  };

  return (
    <Group
      x={object.position.x}
      y={object.position.y}
      rotation={object.rotation}
      scaleX={object.scale.x}
      scaleY={object.scale.y}
      draggable={!object.locked}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
    >
      <Rect
        width={/* width */}
        height={/* height */}
        fill={/* fill color */}
        stroke={isSelected ? '#0066cc' : '#000000'}
        strokeWidth={isSelected ? 2 : 1}
      />

      {isSelected && (
        <>
          <Circle
            x={0}
            y={0}
            radius={4}
            fill="#0066cc"
            draggable
          />
        </>
      )}
    </Group>
  );
};
```

### Utility Function Template
```typescript
// Template: src/utils/{utilityName}.ts
import { Point, Bounds } from '@/types';

export const {utilityName} = (param1: Type1, param2: Type2): ReturnType => {
  return result;
};

export const helper{UtilityName} = (/* params */) => {
};

export const {UtilityName}Utils = {
  {utilityName},
  helper{UtilityName},
};
```

### Test File Template
```typescript
// Template: src/components/{ComponentName}.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';
import { FloorPlanProvider } from '@/context/FloorPlanContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <FloorPlanProvider>
      {component}
    </FloorPlanProvider>
  );
};

const mock{ObjectName} = {
  id: 'test-id',
  type: '{objectType}',
};


describe('{ComponentName}', () => {
  it('should render correctly', () => {
    renderWithProviders(<{ComponentName} {...requiredProps} />);
    expect(screen.getByTestId('{component-test-id}')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const mockHandler = jest.fn();
    renderWithProviders(
      <{ComponentName} {...requiredProps} onAction={mockHandler} />
    );

    fireEvent.click(screen.getByTestId('{interactive-element}'));
    expect(mockHandler).toHaveBeenCalledWith(/* expected args */);
  });

  it('should update when props change', () => {
    const { rerender } = renderWithProviders(
      <{ComponentName} {...requiredProps} />
    );

    rerender(<{ComponentName} {...updatedProps} />);
    expect(screen.getByTestId('{component-test-id}')).toHaveTextContent(/* expected content */);
  });
});
```

### Type Definition Template
```typescript
// Template: src/types/{typeName}.ts
export interface {TypeName} {
  id: string;
  type: '{typeName}';
  position: Point;
  rotation: number;
  scale: Point;
  visible: boolean;
  locked: boolean;
  layerId: string;

  specificProperty: SpecificType;

  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

export type {TypeName}Update = Partial<Omit<{TypeName}, 'id' | 'type' | 'metadata'>>;
export type {TypeName}Create = Omit<{TypeName}, 'id' | 'metadata'>;

export const is{TypeName} = (obj: any): obj is {TypeName} => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    obj.type === '{typeName}' &&
  );
};

export const create{TypeName} = (data: {TypeName}Create): {TypeName} => {
  return {
    ...data,
    id: generateId(),
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
  };
};
```

### Page Component Template
```typescript
// Template: src/app/{pageName}/page.tsx
'use client';

import React from 'react';
import { {ComponentName} } from '@/components/{ComponentName}';
import { FloorPlanProvider } from '@/context/FloorPlanContext';

export default function {PageName}Page() {
  return (
    <FloorPlanProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 py-4">
              {Page Title}
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <{ComponentName} />
        </main>
      </div>
    </FloorPlanProvider>
  );
}
```

## Quick Generation Commands for AI

When generating code, use these patterns:

1. **New Tool**: Use Tool Component + Custom Hook + Konva Component templates
2. **New Feature**: Use Context Provider + Utility + Test templates
3. **New Object Type**: Use Type Definition + Konva Component + Test templates
4. **New Page**: Use Page Component + necessary providers

## Common Replacements for Templates

- `{ToolName}` → Wall, Door, Window, Room, etc.
- `{ObjectName}` → Wall, Door, Window, Room, etc.
- `{ComponentName}` → Actual component name
- `{ContextName}` → FloorPlan, Tool, Selection, etc.
- `{utilityName}` → calculateDistance, snapToGrid, etc.
- `{TypeName}` → Wall, Door, Window, Room, etc.

## 4. Testing Strategy

### Testing Philosophy

### Testing Pyramid
- Unit Tests (70%): Individual functions, components, utilities
- Integration Tests (20%): Component interactions, context providers
- E2E Tests (10%): Complete user workflows, critical paths

### Testing Principles
- Test Behavior, Not Implementation
- Arrange-Act-Assert
- Isolation
- Fast Feedback
- Realistic Data

## Unit Testing

### Component Testing
```typescript
import { render, fireEvent, screen } from '@testing-library/react';
import { WallTool } from '@/components/tools/WallTool';
import { FloorPlanProvider } from '@/context/FloorPlanContext';

describe('WallTool', () => {
  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <FloorPlanProvider>
        {component}
      </FloorPlanProvider>
    );
  };

  it('should start drawing wall on canvas click', () => {
    const mockOnWallStart = jest.fn();
    renderWithContext(<WallTool onWallStart={mockOnWallStart} />);

    const canvas = screen.getByTestId('floor-plan-canvas');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });

    expect(mockOnWallStart).toHaveBeenCalledWith({ x: 100, y: 100 });
  });

  it('should show preview while drawing', () => {
    renderWithContext(<WallTool />);

    const canvas = screen.getByTestId('floor-plan-canvas');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 100 });

    expect(screen.getByTestId('wall-preview')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction';

describe('useCanvasInteraction', () => {
  it('should handle zoom operations', () => {
    const { result } = renderHook(() => useCanvasInteraction());

    act(() => {
      result.current.zoomIn();
    });

    expect(result.current.zoom).toBeGreaterThan(1);
  });

  it('should constrain zoom within limits', () => {
    const { result } = renderHook(() => useCanvasInteraction());

    act(() => {
      for (let i = 0; i < 20; i++) {
        result.current.zoomOut();
      }
    });

    expect(result.current.zoom).toBeGreaterThanOrEqual(0.1);
  });
});
```

### Utility Function Testing
```typescript
import { distance, lineIntersection, polygonArea } from '@/utils/geometry';

describe('Geometry Utils', () => {
  describe('distance', () => {
    it('should calculate distance between two points', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 3, y: 4 };
      expect(distance(p1, p2)).toBe(5);
    });
  });

  describe('lineIntersection', () => {
    it('should find intersection of two lines', () => {
      const line1: [Point, Point] = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
      const line2: [Point, Point] = [{ x: 5, y: -5 }, { x: 5, y: 5 }];

      const intersection = lineIntersection(line1, line2);
      expect(intersection).toEqual({ x: 5, y: 0 });
    });

    it('should return null for parallel lines', () => {
      const line1: [Point, Point] = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
      const line2: [Point, Point] = [{ x: 0, y: 5 }, { x: 10, y: 5 }];

      expect(lineIntersection(line1, line2)).toBeNull();
    });
  });
});
```

## Integration Testing

### Context Provider Testing
```typescript
import { render, fireEvent, screen } from '@testing-library/react';
import { FloorPlanProvider, useFloorPlanContext } from '@/context/FloorPlanContext';

const TestComponent = () => {
  const { state, addObject, selectObjects } = useFloorPlanContext();

  return (
    <div>
      <div data-testid="object-count">{Object.keys(state.objects).length}</div>
      <button
        onClick={() => addObject(mockWall)}
        data-testid="add-wall"
      >
        Add Wall
      </button>
    </div>
  );
};

describe('FloorPlan Context Integration', () => {
  it('should add objects and update state', () => {
    render(
      <FloorPlanProvider>
        <TestComponent />
      </FloorPlanProvider>
    );

    expect(screen.getByTestId('object-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('add-wall'));

    expect(screen.getByTestId('object-count')).toHaveTextContent('1');
  });
});
```

### Canvas Component Integration
```typescript
describe('Canvas Tool Integration', () => {
  it('should create wall when using wall tool', async () => {
    render(
      <FloorPlanProvider>
        <ToolProvider>
          <FloorPlanCanvas />
          <ToolSidebar />
        </ToolProvider>
      </FloorPlanProvider>
    );

    fireEvent.click(screen.getByTestId('wall-tool'));

    const canvas = screen.getByTestId('floor-plan-canvas');
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 100 });
    fireEvent.mouseUp(canvas);

    await waitFor(() => {
      expect(screen.getByTestId('wall-object')).toBeInTheDocument();
    });
  });
});
```

## E2E Testing (Playwright)

### Setup
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
```

### Critical User Flows
```typescript
import { test, expect } from '@playwright/test';

test.describe('Floor Plan Creation', () => {
  test('should create a basic floor plan', async ({ page }) => {
    await page.goto('/');

    await page.click('[data-testid="wall-tool"]');
    await page.mouse.click(200, 200);
    await page.mouse.click(400, 200);
    await page.mouse.click(400, 400);
    await page.mouse.click(200, 400);
    await page.mouse.click(200, 200);

    await page.click('[data-testid="door-tool"]');
    await page.click('[data-testid="wall-object"]:first-child');

    await page.click('[data-testid="window-tool"]');
    await page.click('[data-testid="wall-object"]:nth-child(2)');

    await expect(page.locator('[data-testid="wall-object"]')).toHaveCount(4);
    await expect(page.locator('[data-testid="door-object"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="window-object"]')).toHaveCount(1);
  });

  test('should save and load floor plan', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="wall-tool"]');
    await page.mouse.click(200, 200);
    await page.mouse.click(400, 200);

    await page.click('[data-testid="file-menu"]');
    await page.click('[data-testid="save-plan"]');
    await page.fill('[data-testid="filename-input"]', 'test-plan');
    await page.click('[data-testid="save-button"]');

    await page.click('[data-testid="file-menu"]');
    await page.click('[data-testid="new-plan"]');

    await page.click('[data-testid="file-menu"]');
    await page.click('[data-testid="load-plan"]');
    await page.click('[data-testid="plan-test-plan"]');

    await expect(page.locator('[data-testid="wall-object"]')).toHaveCount(1);
  });
});
```

### Performance Testing
```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should handle large floor plans', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();

    for (let i = 0; i < 100; i++) {
      await page.click('[data-testid="wall-tool"]');
      await page.mouse.click(100 + i * 5, 100);
      await page.mouse.click(100 + i * 5, 200);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10000);

    await page.click('[data-testid="select-tool"]');
    await page.mouse.click(150, 150);

    await expect(page.locator('[data-testid="selected-object"]')).toBeVisible();
  });
});
```

## Canvas-Specific Testing

### Konva.js Mocking
```typescript
// __mocks__/konva.ts
export default {
  Stage: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    destroy: jest.fn(),
    width: jest.fn(() => 800),
    height: jest.fn(() => 600),
    getPointerPosition: jest.fn(() => ({ x: 0, y: 0 })),
  })),
  Layer: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    draw: jest.fn(),
    children: [],
  })),
  Rect: jest.fn().mockImplementation(() => ({
    x: jest.fn(),
    y: jest.fn(),
    width: jest.fn(),
    height: jest.fn(),
  })),
};
```

### Canvas Interaction Testing
```typescript
// Test canvas operations without actual rendering
describe('Canvas Operations', () => {
  it('should handle object selection', () => {
    const mockStage = new Konva.Stage({
      container: document.createElement('div'),
      width: 800,
      height: 600,
    });

    const canvasManager = new CanvasManager(mockStage);
    const wall = createMockWall();

    canvasManager.addObject(wall);
    canvasManager.selectObject(wall.id);

    expect(canvasManager.getSelectedObjects()).toContain(wall.id);
  });
});
```

## Test Data & Fixtures

### Mock Data Factory
```typescript
// test/fixtures/mockData.ts
export const createMockWall = (overrides?: Partial<Wall>): Wall => ({
  id: 'wall-1',
  type: 'wall',
  startPoint: { x: 0, y: 0 },
  endPoint: { x: 100, y: 0 },
  thickness: 6,
  height: 96,
  material: 'drywall',
  isLoadBearing: false,
  connectedWalls: [],
  position: { x: 0, y: 0 },
  rotation: 0,
  scale: { x: 1, y: 1 },
  visible: true,
  locked: false,
  layerId: 'layer-1',
  properties: {},
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
  },
  ...overrides,
});

export const createMockFloorPlan = (): FloorPlanState => ({
  canvas: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    viewType: '2d',
    gridVisible: true,
    gridSize: 12,
    gridUnit: 'inches',
    snapToGrid: true,
    snapToObjects: true,
    selectedObjects: [],
    clipboard: [],
  },
  layers: [
    {
      id: 'layer-1',
      name: 'Walls',
      visible: true,
      locked: false,
      color: '#000000',
      opacity: 1,
      objects: [],
    },
  ],
  objects: {},
  history: {
    past: [],
    present: null,
    future: [],
  },
  tools: {
    activeTool: 'select',
    toolSettings: {},
  },
  project: {
    name: 'Test Project',
    units: 'inches',
    scale: 1,
  },
});
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

This comprehensive testing strategy ensures the floor plan tool is robust, reliable, and maintainable throughout development.

## 5. Performance Optimization

### 5.1 Canvas Rendering Optimizations (Konva.js)

### Layer Management
- **Principle**: Group objects that change together on the same Konva.Layer. Objects that rarely change (e.g., grid, background) should be on separate layers.
- **Implementation**:
    - `Konva.Layer` for static background elements (grid, rulers).
    - `Konva.Layer` for structural elements (walls, doors, windows).
    - `Konva.Layer` for furniture and annotations.
    - `Konva.Layer` for interactive UI elements (selection boxes, transformers).
- **Benefit**: When a layer is redrawn, only the shapes on that specific layer are re-rendered, reducing overall drawing time.

### Caching Complex Shapes
- **Principle**: For complex Konva.Shape objects that don't change frequently, cache them as images.
- **Implementation**: Use `node.cache()` method.
    ```typescript
    // Example: Caching a complex wall shape
    const wallRef = useRef<Konva.Line>(null);
    useEffect(() => {
      if (wallRef.current) {
        wallRef.current.cache();
      }
    }, [wallData]); // Recache if wallData changes

    <Konva.Line ref={wallRef} points={[...]} stroke="black" strokeWidth={2} />
    ```
- **Benefit**: Drawing a cached shape is much faster than redrawing its individual components.

### Batch Drawing
- **Principle**: Avoid calling `layer.draw()` or `stage.draw()` repeatedly. Instead, use `stage.batchDraw()` or `layer.batchDraw()` to queue up drawing operations and execute them in a single animation frame.
- **Implementation**:
    ```typescript
    // Instead of:
    // object1.x(10); layer.draw();
    // object2.x(20); layer.draw();

    // Use:
    object1.x(10);
    object2.x(20);
    layer.batchDraw(); // Or stage.batchDraw()
    ```
- **Benefit**: Reduces redundant redraws and improves responsiveness.

### `listening: false` for Static Objects
- **Principle**: If a Konva.Shape or Konva.Group does not need to respond to mouse/touch events, set `listening: false`.
- **Implementation**:
    ```typescript
    <Konva.Rect x={0} y={0} width={1000} height={1000} fill="lightgray" listening={false} />
    <Konva.Line points={[...]} stroke="gray" listening={false} />
    ```
- **Benefit**: Improves hit detection performance by skipping unnecessary checks for non-interactive shapes.

### Optimize Hit Detection
- **Principle**: For complex shapes, provide a custom `hitFunc` that is simpler than the actual drawing, or use `perfectDrawEnabled: false` if stroke rendering precision is not critical.
- **Implementation**:
    ```typescript
    <Konva.Shape
      sceneFunc={(context, shape) => { /* complex drawing */ }}
      hitFunc={(context, shape) => {
        context.beginPath();
        context.rect(0, 0, shape.width(), shape.height()); // Simpler hit area
        context.closePath();
        context.fillStrokeShape(shape);
      }}
    />
    ```
- **Benefit**: Faster interaction detection, especially with many objects.

### Viewport Culling
- **Principle**: Only render Konva.Shape objects that are currently visible within the viewport.
- **Implementation**: Filter the list of objects passed to Konva layers based on their bounding box intersection with the current viewport.
- **Benefit**: Significantly reduces the number of shapes Konva needs to draw, especially for large floor plans.

### Object Pooling
- **Principle**: Reuse Konva.Shape instances instead of creating and destroying them frequently (e.g., for temporary drawing guides, selection handles).
- **Implementation**: Maintain a pool of pre-created Konva objects. When an object is needed, retrieve it from the pool; when no longer needed, return it to the pool and hide it.
- **Benefit**: Reduces garbage collection overhead and improves rendering smoothness.

### 5.2 State Management Optimizations (React Context + useReducer)

### Immutable State Updates
- **Principle**: Always return new state objects when updating. Avoid direct mutation of state.
- **Implementation**: Use spread syntax (`...`), `Object.assign()`, or immutable data structures (e.g., Immer.js if complexity warrants).
    ```typescript
    // Correct:
    return {
      ...state,
      objects: {
        ...state.objects,
        [action.payload.id]: {
          ...state.objects[action.payload.id],
          ...action.payload.updates,
        },
      },
    };

    // Incorrect:
    // state.objects[action.payload.id].position = action.payload.newPosition;
    // return state;
    ```
- **Benefit**: Ensures React's change detection works correctly, preventing unnecessary re-renders and bugs.

### Normalized State Structure
- **Principle**: Store data in a flat, normalized structure where objects are stored in a dictionary/map by ID, and references are used instead of nested objects.
- **Implementation**:
    ```typescript
    interface FloorPlanState {
      objects: Record<string, FloorPlanObject>; // { 'wall-1': WallObject, 'door-2': DoorObject }
      layers: Record<string, LayerState>;     // { 'layer-main': LayerState }
      // ... other state
    }
    ```
- **Benefit**: Easier to update individual objects without deep cloning, reduces memory footprint, and improves lookup times.

### Memoization with `React.memo`, `useMemo`, `useCallback`
- **Principle**: Prevent unnecessary re-renders of React components and re-creations of functions/values.
- **Implementation**:
    - `React.memo`: For functional components that render the same output given the same props.
    - `useMemo`: For memoizing expensive calculations or object creations.
    - `useCallback`: For memoizing functions passed down to child components.
- **Benefit**: Reduces the amount of work React needs to do during reconciliation.

### Batching State Updates
- **Principle**: Group multiple state updates into a single dispatch if they logically belong together and should trigger a single re-render.
- **Implementation**: If using `useReducer`, a single dispatch can contain a complex payload that updates multiple parts of the state.
- **Benefit**: Reduces the number of re-renders, especially for rapid interactions.

### 5.3 General Application Optimizations

### Code Splitting & Lazy Loading
- **Principle**: Only load the JavaScript code that is immediately needed.
- **Implementation**: Use Next.js dynamic imports for components, especially for tools or panels that are not always visible.
    ```typescript
    const DynamicToolPanel = dynamic(() => import('../components/panels/ToolPanel'), { ssr: false });
    ```
- **Benefit**: Reduces initial load time and memory consumption.

### Asset Optimization
- **Principle**: Optimize images, fonts, and other assets.
- **Implementation**:
    - Use Next.js `Image` component for optimized image loading.
    - Compress SVG files.
    - Use modern image formats (WebP).
    - Self-host fonts or use `font-display: swap`.
- **Benefit**: Faster page loads and smoother user experience.

### Debouncing and Throttling
- **Principle**: Limit the rate at which a function is called, especially for event handlers that fire frequently (e.g., `mousemove`, `resize`).
- **Implementation**: Use utility functions (e.g., from Lodash or custom implementations).
    ```typescript
    // Example: Debouncing canvas resize
    const handleResize = useCallback(
      debounce(() => {
        // Update canvas size
      }, 200),
      []
    );
    useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);
    ```
- **Benefit**: Prevents overwhelming the browser with too many updates, leading to smoother interactions.

### Web Workers (Future Consideration)
- **Principle**: Offload heavy computations (e.g., complex geometry calculations, file parsing) to a separate thread.
- **Implementation**: Use the Web Worker API.
- **Benefit**: Keeps the main UI thread free, ensuring responsiveness even during intensive tasks.

### 5.4 Performance Monitoring

### Browser Developer Tools
- **Usage**: Use Chrome DevTools (Performance tab, Memory tab, Layers tab) to identify bottlenecks.
- **Key Metrics**: FPS, CPU usage, Heap size, DOM nodes.

### React Profiler
- **Usage**: Use React DevTools Profiler to identify expensive component renders.
- **Key Metrics**: Render times, component re-renders.

### Lighthouse
- **Usage**: Audit web page performance, accessibility, best practices, SEO.
- **Key Metrics**: First Contentful Paint, Largest Contentful Paint, Total Blocking Time.
