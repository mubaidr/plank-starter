import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import {
  FloorPlanState,
  FloorPlanAction,
  FloorPlanObject,
  LayerState,
  Point,
  ViewType,
  Dimension,
  Guide
} from '@/types/floorPlanTypes';

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
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleGuides: () => void;

  // Layer Management
  addLayer: (layer: Omit<LayerState, 'id'>) => void;
  updateLayer: (id: string, updates: Partial<LayerState>) => void;
  deleteLayer: (id: string) => void;

  // Dimension Management
  addDimension: (dimension: Dimension) => void;
  updateDimension: (id: string, updates: Partial<Dimension>) => void;
  deleteDimension: (id: string) => void;

  // Guide Management
  addGuide: (guide: Omit<Guide, 'id'>) => void;
  updateGuide: (id: string, updates: Partial<Guide>) => void;
  removeGuide: (id: string) => void;

  // History Management - Enhanced for unlimited undo/redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  getHistorySize: () => number;
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
      toolSettings: {},
      currentMousePosition: { x: 0, y: 0 }
    }
  },
  project: {
    name: 'Untitled Project',
    description: '',
    author: '',
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    version: '1.0.0',
    units: 'feet',
    scale: 1
  },
  dimensions: {},
  guides: [],
  // Enhanced history system for unlimited undo/redo
  history: {
    past: [],
    present: null,
    future: [],
    maxHistorySize: -1, // -1 means unlimited
    canUndo: false,
    canRedo: false
  }
};

// Helper function to create a snapshot of the current state (excluding history)
const createStateSnapshot = (state: FloorPlanState): Omit<FloorPlanState, 'history'> => {
  const { history, ...snapshot } = state;
  return snapshot;
};

// Enhanced reducer with unlimited history support
const floorPlanReducer = (state: FloorPlanState, action: FloorPlanAction): FloorPlanState => {
  // Helper function to update state with history tracking
  const updateWithHistory = (newState: Partial<FloorPlanState>): FloorPlanState => {
    const currentSnapshot = createStateSnapshot(state);
    const updatedState = { ...state, ...newState };
    
    return {
      ...updatedState,
      history: {
        ...state.history,
        past: [...state.history.past, currentSnapshot],
        present: createStateSnapshot(updatedState),
        future: [], // Clear future when new action is performed
        canUndo: true,
        canRedo: false
      }
    };
  };

  switch (action.type) {
    case 'ADD_OBJECT': {
      const newObjects = {
        ...state.objects,
        [action.payload.id]: action.payload
      };
      return updateWithHistory({ objects: newObjects });
    }

    case 'UPDATE_OBJECT': {
      const { id, updates } = action.payload;
      if (!state.objects[id]) return state;
      
      const newObjects = {
        ...state.objects,
        [id]: { ...state.objects[id], ...updates }
      };
      return updateWithHistory({ objects: newObjects });
    }

    case 'DELETE_OBJECT': {
      const { [action.payload]: deleted, ...newObjects } = state.objects;
      return updateWithHistory({ objects: newObjects });
    }

    case 'SELECT_OBJECTS': {
      const newCanvas = {
        ...state.canvas,
        selection: {
          ...state.canvas.selection,
          selectedIds: action.payload
        }
      };
      // Selection changes don't need history tracking
      return { ...state, canvas: newCanvas };
    }

    case 'SET_ZOOM': {
      const newCanvas = {
        ...state.canvas,
        viewport: {
          ...state.canvas.viewport,
          zoom: action.payload
        }
      };
      return { ...state, canvas: newCanvas };
    }

    case 'SET_PAN': {
      const newCanvas = {
        ...state.canvas,
        viewport: {
          ...state.canvas.viewport,
          pan: action.payload
        }
      };
      return { ...state, canvas: newCanvas };
    }

    case 'ADD_LAYER': {
      const layerId = `layer-${Date.now()}`;
      const newLayer = { ...action.payload, id: layerId };
      const newLayers = {
        ...state.layers,
        [layerId]: newLayer
      };
      return updateWithHistory({ layers: newLayers });
    }

    case 'UPDATE_LAYER': {
      const { id, updates } = action.payload;
      if (!state.layers[id]) return state;
      
      const newLayers = {
        ...state.layers,
        [id]: { ...state.layers[id], ...updates }
      };
      return updateWithHistory({ layers: newLayers });
    }

    case 'DELETE_LAYER': {
      const { [action.payload]: deleted, ...newLayers } = state.layers;
      return updateWithHistory({ layers: newLayers });
    }

    case 'ADD_DIMENSION': {
      const newDimensions = {
        ...state.dimensions,
        [action.payload.id]: action.payload
      };
      return updateWithHistory({ dimensions: newDimensions });
    }

    case 'UPDATE_DIMENSION': {
      const { id, updates } = action.payload;
      if (!state.dimensions[id]) return state;
      
      const newDimensions = {
        ...state.dimensions,
        [id]: { ...state.dimensions[id], ...updates }
      };
      return updateWithHistory({ dimensions: newDimensions });
    }

    case 'DELETE_DIMENSION': {
      const { [action.payload]: deleted, ...newDimensions } = state.dimensions;
      return updateWithHistory({ dimensions: newDimensions });
    }

    case 'ADD_GUIDE': {
      const newGuides = [...state.guides, action.payload];
      return updateWithHistory({ guides: newGuides });
    }

    case 'UPDATE_GUIDE': {
      const { id, updates } = action.payload;
      const newGuides = state.guides.map(guide => 
        guide.id === id ? { ...guide, ...updates } : guide
      );
      return updateWithHistory({ guides: newGuides });
    }

    case 'REMOVE_GUIDE': {
      const newGuides = state.guides.filter(guide => guide.id !== action.payload);
      return updateWithHistory({ guides: newGuides });
    }

    case 'UNDO': {
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      const currentSnapshot = createStateSnapshot(state);
      
      return {
        ...previous,
        history: {
          ...state.history,
          past: newPast,
          present: previous,
          future: [currentSnapshot, ...state.history.future],
          canUndo: newPast.length > 0,
          canRedo: true
        }
      };
    }

    case 'REDO': {
      if (state.history.future.length === 0) return state;
      
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      const currentSnapshot = createStateSnapshot(state);
      
      return {
        ...next,
        history: {
          ...state.history,
          past: [...state.history.past, currentSnapshot],
          present: next,
          future: newFuture,
          canUndo: true,
          canRedo: newFuture.length > 0
        }
      };
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: {
          ...state.history,
          past: [],
          future: [],
          canUndo: false,
          canRedo: false
        }
      };
    }

    case 'TOGGLE_GRID': {
      const newCanvas = {
        ...state.canvas,
        grid: {
          ...state.canvas.grid,
          visible: !state.canvas.grid.visible
        }
      };
      return updateWithHistory({ canvas: newCanvas });
    }

    case 'TOGGLE_SNAP': {
      const newCanvas = {
        ...state.canvas,
        snap: {
          ...state.canvas.snap,
          enabled: !state.canvas.snap.enabled
        }
      };
      return updateWithHistory({ canvas: newCanvas });
    }

    case 'TOGGLE_GUIDES': {
      const newGuides = state.guides.map(guide => ({
        ...guide,
        visible: !guide.visible
      }));
      return updateWithHistory({ guides: newGuides });
    }

    case 'LOAD_PROJECT': {
      const projectData = action.payload as any; // ProjectData from file operations
      
      // Convert ProjectData to FloorPlanState format
      const objects: Record<string, FloorPlanObject> = {};
      projectData.objects?.forEach((obj: any) => {
        objects[obj.id] = obj;
      });
      
      const layers: Record<string, LayerState> = {};
      projectData.layers?.forEach((layer: any) => {
        layers[layer.id] = {
          ...layer,
          opacity: 1,
          printable: true
        };
      });
      
      const dimensions: Record<string, Dimension> = {};
      projectData.measurements?.forEach((measurement: any) => {
        dimensions[measurement.id] = {
          ...measurement,
          units: measurement.units as any
        };
      });
      
      const newState: FloorPlanState = {
        objects,
        layers: Object.keys(layers).length > 0 ? layers : state.layers, // Keep existing layers if none provided
        canvas: {
          ...state.canvas,
          grid: {
            ...state.canvas.grid,
            size: projectData.settings?.gridSize || state.canvas.grid.size,
            visible: projectData.settings?.gridVisible ?? state.canvas.grid.visible,
            snap: projectData.settings?.snapToGrid ?? state.canvas.grid.snap
          },
          backgroundImage: projectData.settings?.backgroundImage ? {
            src: projectData.settings.backgroundImage.src,
            opacity: projectData.settings.backgroundImage.opacity,
            scale: projectData.settings.backgroundImage.scale,
            position: projectData.settings.backgroundImage.position
          } : undefined
        },
        project: {
          ...state.project,
          name: projectData.metadata?.name || 'Untitled Project',
          description: projectData.metadata?.description || '',
          scale: projectData.metadata?.scale || 1,
          units: projectData.metadata?.units || 'ft'
        },
        dimensions,
        guides: state.guides, // Keep existing guides
        history: {
          past: [],
          present: {} as any, // Will be set below
          future: [],
          maxHistorySize: -1,
          canUndo: false,
          canRedo: false
        }
      };
      
      // Set the present state
      newState.history.present = createStateSnapshot(newState);
      
      return newState;
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

  const toggleGrid = useCallback(() => {
    dispatch({ type: 'TOGGLE_GRID' });
  }, []);

  const toggleSnap = useCallback(() => {
    dispatch({ type: 'TOGGLE_SNAP' });
  }, []);

  const toggleGuides = useCallback(() => {
    dispatch({ type: 'TOGGLE_GUIDES' });
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

  // Dimension Management Functions
  const addDimension = useCallback((dimension: Dimension) => {
    dispatch({ type: 'ADD_DIMENSION', payload: dimension });
  }, []);

  const updateDimension = useCallback((id: string, updates: Partial<Dimension>) => {
    dispatch({ type: 'UPDATE_DIMENSION', payload: { id, updates } });
  }, []);

  const deleteDimension = useCallback((id: string) => {
    dispatch({ type: 'DELETE_DIMENSION', payload: id });
  }, []);

  // Guide Management Functions
  const addGuide = useCallback((guide: Omit<Guide, 'id'>) => {
    const newGuide: Guide = {
      ...guide,
      id: `guide-${Date.now()}`,
      color: guide.color || '#3B82F6',
      visible: guide.visible ?? true
    };
    dispatch({ type: 'ADD_GUIDE', payload: newGuide });
  }, []);

  const updateGuide = useCallback((id: string, updates: Partial<Guide>) => {
    dispatch({ type: 'UPDATE_GUIDE', payload: { id, updates } });
  }, []);

  const removeGuide = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_GUIDE', payload: id });
  }, []);

  // Enhanced History Management Functions
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const getHistorySize = useCallback(() => {
    return state.history.past.length + state.history.future.length;
  }, [state.history]);

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
    toggleGrid,
    toggleSnap,
    toggleGuides,
    addLayer,
    updateLayer,
    deleteLayer,
    addDimension,
    updateDimension,
    deleteDimension,
    addGuide,
    updateGuide,
    removeGuide,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistorySize
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