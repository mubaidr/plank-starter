import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { 
  FloorPlanState, 
  FloorPlanAction, 
  FloorPlanObject, 
  LayerState, 
  Point, 
  ViewType 
} from '@/types';

// Context Type Definition
interface FloorPlanContextType {
  state: FloorPlanState;
  dispatch: React.Dispatch<FloorPlanAction>;

  // Object Management
  addObject: (object: FloorPlanObject) => void;
  updateObject: (id: string, updates: Partial<FloorPlanObject>) => void;
  deleteObject: (id: string) => void;
  selectObjects: (ids: string[]) => void;

  // Canvas Management
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  setViewType: (viewType: ViewType) => void;

  // Layer Management
  addLayer: (layer: Omit<LayerState, 'id'>) => void;
  updateLayer: (id: string, updates: Partial<LayerState>) => void;
  deleteLayer: (id: string) => void;

  // History Management
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// Initial State
const initialFloorPlanState: FloorPlanState = {
  objects: {},
  layers: {
    'layer-1': { 
      id: 'layer-1', 
      name: 'Walls', 
      visible: true, 
      locked: false, 
      color: '#1E40AF', 
      opacity: 1, 
      printable: true 
    },
    'layer-2': { 
      id: 'layer-2', 
      name: 'Doors & Windows', 
      visible: true, 
      locked: false, 
      color: '#059669', 
      opacity: 1, 
      printable: true 
    },
    'layer-3': { 
      id: 'layer-3', 
      name: 'Furniture', 
      visible: true, 
      locked: false, 
      color: '#DC2626', 
      opacity: 1, 
      printable: true 
    }
  },
  canvas: {
    viewport: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { x: 0, y: 0, width: 800, height: 600 },
      center: { x: 400, y: 300 }
    },
    grid: {
      visible: true,
      size: 20,
      unit: 'feet',
      subdivisions: 4,
      color: '#E5E7EB',
      opacity: 0.5
    },
    snap: {
      enabled: true,
      snapToGrid: true,
      snapToObjects: true,
      snapToGuides: false,
      tolerance: 10
    },
    selection: {
      selectedIds: [],
      multiSelect: false,
      selectionMode: 'single'
    },
    view: {
      viewType: '2d',
      showGrid: true,
      showSnapIndicators: true,
      showDimensions: true,
      showMaterials: false
    },
    interaction: {
      isDrawing: false,
      isPanning: false,
      isSelecting: false,
      currentTool: 'select',
      toolSettings: {}
    }
  },
  project: {
    id: 'new-project',
    name: 'Untitled Project',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0',
    tags: []
  },
  history: {
    past: [],
    present: {} as FloorPlanState,
    future: [],
    maxHistorySize: 50
  }
};

// Set the present state correctly
initialFloorPlanState.history.present = { ...initialFloorPlanState };

// Reducer Function
const floorPlanReducer = (state: FloorPlanState, action: FloorPlanAction): FloorPlanState => {
  const addToHistory = (newState: FloorPlanState): FloorPlanState => {
    const newPast = [...state.history.past, state.history.present].slice(-state.history.maxHistorySize);
    return {
      ...newState,
      history: {
        ...newState.history,
        past: newPast,
        present: newState,
        future: []
      }
    };
  };

  switch (action.type) {
    case 'ADD_OBJECT': {
      const newState = {
        ...state,
        objects: {
          ...state.objects,
          [action.payload.id]: action.payload
        }
      };
      return addToHistory(newState);
    }

    case 'UPDATE_OBJECT': {
      const { id, updates } = action.payload;
      if (!state.objects[id]) return state;
      
      const newState = {
        ...state,
        objects: {
          ...state.objects,
          [id]: {
            ...state.objects[id],
            ...updates,
            metadata: {
              ...state.objects[id].metadata,
              updatedAt: new Date(),
              version: state.objects[id].metadata.version + 1
            }
          }
        }
      };
      return addToHistory(newState);
    }

    case 'DELETE_OBJECT': {
      const { [action.payload]: deleted, ...remainingObjects } = state.objects;
      const newState = {
        ...state,
        objects: remainingObjects,
        canvas: {
          ...state.canvas,
          selection: {
            ...state.canvas.selection,
            selectedIds: state.canvas.selection.selectedIds.filter(id => id !== action.payload)
          }
        }
      };
      return addToHistory(newState);
    }

    case 'SELECT_OBJECTS': {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          selection: {
            ...state.canvas.selection,
            selectedIds: action.payload
          }
        }
      };
    }

    case 'SET_ZOOM': {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          viewport: {
            ...state.canvas.viewport,
            zoom: Math.max(0.1, Math.min(10, action.payload))
          }
        }
      };
    }

    case 'SET_PAN': {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          viewport: {
            ...state.canvas.viewport,
            pan: action.payload
          }
        }
      };
    }

    case 'SET_VIEW_TYPE': {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          view: {
            ...state.canvas.view,
            viewType: action.payload
          }
        }
      };
    }

    case 'ADD_LAYER': {
      const id = `layer-${Date.now()}`;
      const newState = {
        ...state,
        layers: {
          ...state.layers,
          [id]: { ...action.payload, id }
        }
      };
      return addToHistory(newState);
    }

    case 'UPDATE_LAYER': {
      const { id, updates } = action.payload;
      if (!state.layers[id]) return state;
      
      return {
        ...state,
        layers: {
          ...state.layers,
          [id]: {
            ...state.layers[id],
            ...updates
          }
        }
      };
    }

    case 'DELETE_LAYER': {
      const { [action.payload]: deleted, ...remainingLayers } = state.layers;
      return {
        ...state,
        layers: remainingLayers
      };
    }

    case 'UNDO': {
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      
      return {
        ...previous,
        history: {
          ...previous.history,
          past: newPast,
          present: previous,
          future: [state.history.present, ...state.history.future]
        }
      };
    }

    case 'REDO': {
      if (state.history.future.length === 0) return state;
      
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      
      return {
        ...next,
        history: {
          ...next.history,
          past: [...state.history.past, state.history.present],
          present: next,
          future: newFuture
        }
      };
    }

    case 'LOAD_PROJECT': {
      return {
        ...action.payload,
        history: {
          past: [],
          present: action.payload,
          future: [],
          maxHistorySize: 50
        }
      };
    }

    default:
      return state;
  }
};

// Context Creation
const FloorPlanContext = createContext<FloorPlanContextType | undefined>(undefined);

// Provider Component
export const FloorPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(floorPlanReducer, initialFloorPlanState);

  // Object Management Functions
  const addObject = useCallback((object: FloorPlanObject) => {
    dispatch({ type: 'ADD_OBJECT', payload: object });
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<FloorPlanObject>) => {
    dispatch({ type: 'UPDATE_OBJECT', payload: { id, updates } });
  }, []);

  const deleteObject = useCallback((id: string) => {
    dispatch({ type: 'DELETE_OBJECT', payload: id });
  }, []);

  const selectObjects = useCallback((ids: string[]) => {
    dispatch({ type: 'SELECT_OBJECTS', payload: ids });
  }, []);

  // Canvas Management Functions
  const setZoom = useCallback((zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  }, []);

  const setPan = useCallback((pan: Point) => {
    dispatch({ type: 'SET_PAN', payload: pan });
  }, []);

  const setViewType = useCallback((viewType: ViewType) => {
    dispatch({ type: 'SET_VIEW_TYPE', payload: viewType });
  }, []);

  // Layer Management Functions
  const addLayer = useCallback((layer: Omit<LayerState, 'id'>) => {
    dispatch({ type: 'ADD_LAYER', payload: layer });
  }, []);

  const updateLayer = useCallback((id: string, updates: Partial<LayerState>) => {
    dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } });
  }, []);

  const deleteLayer = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LAYER', payload: id });
  }, []);

  // History Management Functions
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  const value: FloorPlanContextType = {
    state,
    dispatch,
    addObject,
    updateObject,
    deleteObject,
    selectObjects,
    setZoom,
    setPan,
    setViewType,
    addLayer,
    updateLayer,
    deleteLayer,
    undo,
    redo,
    canUndo,
    canRedo
  };

  return (
    <FloorPlanContext.Provider value={value}>
      {children}
    </FloorPlanContext.Provider>
  );
};

// Custom Hook
export const useFloorPlanContext = (): FloorPlanContextType => {
  const context = useContext(FloorPlanContext);
  if (!context) {
    throw new Error('useFloorPlanContext must be used within a FloorPlanProvider');
  }
  return context;
};