"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Transformer, Text } from 'react-konva';
import Konva from 'konva';
import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { useToolContext } from '@/context/ToolContext';
import { useSnapSystem } from '../../hooks/useSnapSystem';
import SnapIndicators from './SnapIndicators';
import { FloorPlanObject } from '@/types';

interface DesignCanvasProps {
  // Most props are now handled by context, but we can keep some for flexibility
  onTextToolClick?: (x: number, y: number) => void;
  onRoomToolClick?: (x: number, y: number) => void;
  onFinishRoom?: () => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  onTextToolClick,
  onRoomToolClick,
  onFinishRoom
}) => {
  // Get state from contexts
  const { state, addObject, updateObject, deleteObject, selectObjects, setZoom, setPan } = useFloorPlanContext();
  const { activeTool, isDrawing, drawingData, startDrawing, continueDrawing, finishDrawing, cancelDrawing } = useToolContext();
  
  // Extract state values for easier access
  const _objects = Object.values(state.objects);
  const _selectedObjectIds = state.canvas.selection.selectedIds;
  const _zoom = state.canvas.viewport.zoom;
  const _pan = state.canvas.viewport.pan;
  const _gridVisible = state.canvas.grid.visible;
  const _gridSize = state.canvas.grid.size;
  const _snapToGrid = state.canvas.snap.snapToGrid;
  const _snapToObjects = state.canvas.snap.snapToObjects;
  const _snapTolerance = state.canvas.snap.tolerance;
  const layers = Object.values(state.layers);
  const visibleLayers = layers.filter((layer: any) => layer.visible);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [newObject, setNewObject] = useState<FloorPlanObject | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isAreaSelecting, setIsAreaSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [currentSnapPoints, setCurrentSnapPoints] = useState<Array<{
    x: number;
    y: number;
    type: 'grid' | 'object-edge' | 'object-center' | 'object-corner' | 'intersection' | 'guide';
    objectId?: string;
    description: string;
  }>>([]);
  const [activeSnapPoint, setActiveSnapPoint] = useState<{
    x: number;
    y: number;
    type: 'grid' | 'object-edge' | 'object-center' | 'object-corner' | 'intersection' | 'guide';
    objectId?: string;
    description: string;
  } | null>(null);

  // Handle window resize
  useEffect(() => {
    const _updateSize = () => {
      const _container = stageRef.current?.container();
      if (container) {
        const _containerRect = container.getBoundingClientRect();
        setStageSize({
          width: containerRect.width,
          height: containerRect.height
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    const _transformer = transformerRef.current;
    const _stage = stageRef.current;
    
    if (!transformer || !stage) return;

    const _selectedNodes = selectedObjectIds.map(id => 
      stage.findOne(`#${id}`)
    ).filter((node): node is Konva.Node => Boolean(node));

    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedObjectIds]);

  const _generateId = () => `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Initialize snap system
  const { snapPoint, shouldAutoConnect } = useSnapSystem({
    objects,
    gridSize,
    snapToGrid,
    snapToObjects,
    snapTolerance,
    guides: [] // We can add user-defined guides later
  });

  // Enhanced snap function with visual feedback
  const _snapToGridPoint = useCallback((point: { x: number; y: number }) => {
    const _snapResult = snapPoint(point.x, point.y);
    setCurrentSnapPoints(snapResult.snapPoints);
    setActiveSnapPoint(snapResult.isSnapped ? snapResult.snapPoints[0] : null);
    return snapResult.point;
  }, [snapPoint]);

  // Handle wheel zoom
  const _handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const _stage = e.target.getStage();
    if (!stage) return;

    const _oldScale = stage.scaleX();
    const _pointer = stage.getPointerPosition();
    if (!pointer) return;

    const _mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const _direction = e.evt.deltaY > 0 ? -1 : 1;
    const _scaleBy = 1.1;
    const _newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Limit zoom range
    const _clampedScale = Math.max(0.1, Math.min(5, newScale));
    
    const _newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position(newPos);
    stage.batchDraw();
    
    onZoomChange(clampedScale);
    onPanChange(newPos);
  }, [onZoomChange, onPanChange]);

  const _handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const _stage = e.target.getStage();
    if (!stage) return;

    const _pos = stage.getPointerPosition();
    if (!pos) return;

    // Handle pan tool
    if (activeTool === 'pan') {
      setIsPanning(true);
      setLastPanPoint(pos);
      return;
    }

    // If clicking on empty space with select tool, start area selection or clear selection
    if (e.target === stage) {
      if (activeTool === 'select') {
        setIsAreaSelecting(true);
        setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      } else if (activeTool === 'text') {
        onTextToolClick?.(pos.x, pos.y);
      } else if (activeTool === 'room') {
        onRoomToolClick?.(pos.x, pos.y);
      } else {
        onSelectionChange([]);
      }
      return;
    }

    // Handle measurement tool
    if (activeTool === 'measure') {
      if (!isMeasuring) {
        setIsMeasuring(true);
        setMeasureStart(pos);
      } else {
        // Complete measurement
        if (measureStart) {
          const _distance = Math.sqrt(
            Math.pow(pos.x - measureStart.x, 2) + Math.pow(pos.y - measureStart.y, 2)
          );
          const _newMeasurement = {
            id: generateId(),
            startPoint: measureStart,
            endPoint: pos,
            label: `${Math.round(distance)}px`
          };
          onMeasurementsChange([...measurements, newMeasurement]);
        }
        setIsMeasuring(false);
        setMeasureStart(null);
      }
      return;
    }

    // Handle tool-specific actions
    if (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line' || activeTool === 'wall' || activeTool === 'door' || activeTool === 'window') {
      const _id = generateId();
      const _snappedPos = snapToGridPoint(pos);
      
      const _activeLayer = layers.find(l => l.id === activeLayerId);
      const _baseObject = {
        id,
        x: snappedPos.x,
        y: snappedPos.y,
        fill: activeTool === 'line' ? 'transparent' : 
              activeTool === 'door' ? '#8B4513' :
              activeTool === 'window' ? '#87CEEB' : '#3B82F6',
        stroke: activeLayer?.color || '#1E40AF',
        strokeWidth: activeTool === 'line' ? 4 : 2,
        rotation: 0,
        layerId: activeLayerId
      };

      let object: CanvasObject;
      if (activeTool === 'rectangle') {
        object = { ...baseObject, type: 'rectangle', width: 0, height: 0 };
        setIsDrawing(true);
        setNewObject(object);
      } else if (activeTool === 'circle') {
        object = { ...baseObject, type: 'circle', radius: 0 };
        setIsDrawing(true);
        setNewObject(object);
      } else if (activeTool === 'line') {
        object = { ...baseObject, type: 'line', points: [0, 0, 0, 0] };
        setIsDrawing(true);
        setNewObject(object);
      } else if (activeTool === 'wall') {
        object = { 
          ...baseObject, 
          type: 'wall', 
          points: [0, 0, 0, 0],
          fill: '#F5F5F5',
          stroke: '#8B4513',
          strokeWidth: 6,
          wallThickness: 10,
          wallMaterial: 'drywall',
          wallHeight: 180,
          wallInsulation: false,
          wallStructural: false
        };
        setIsDrawing(true);
        setNewObject(object);
      } else if (activeTool === 'door') {
        // For doors, create them immediately with enhanced properties
        object = { 
          ...baseObject, 
          type: 'door', 
          width: 60, 
          height: 140, 
          doorType: 'single',
          doorSwingDirection: 'right',
          doorOpeningAngle: 90,
          doorMaterial: 'wood',
          doorHandleType: 'lever',
          doorThreshold: true
        };
        onAddObject(object);
        onSelectionChange([object.id]);
      } else if (activeTool === 'window') {
        object = { 
          ...baseObject, 
          type: 'window', 
          width: 60, 
          height: 80, 
          windowType: 'standard',
          windowOpeningDirection: 'none',
          windowFrameType: 'vinyl',
          windowGlassType: 'double',
          windowGrilles: false,
          windowSill: true,
          windowTrim: true
        };
        onAddObject(object);
        onSelectionChange([object.id]);
      }
    } else if (activeTool === 'select') {
      // Handle selection
      const _clickedId = e.target.id();
      if (clickedId) {
        const _isSelected = selectedObjectIds.includes(clickedId);
        const _isMultiSelect = e.evt.ctrlKey || e.evt.metaKey;

        if (isMultiSelect) {
          if (isSelected) {
            onSelectionChange(selectedObjectIds.filter(id => id !== clickedId));
          } else {
            onSelectionChange([...selectedObjectIds, clickedId]);
          }
        } else {
          onSelectionChange(isSelected ? [] : [clickedId]);
        }
      }
    }
  }, [activeTool, selectedObjectIds, onSelectionChange]);

  const _handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const _stage = e.target.getStage();
    if (!stage) return;

    const _pos = stage.getPointerPosition();
    if (!pos) return;

    // Handle panning
    if (isPanning && activeTool === 'pan') {
      const _dx = pos.x - lastPanPoint.x;
      const _dy = pos.y - lastPanPoint.y;
      
      const _newPos = {
        x: stage.x() + dx,
        y: stage.y() + dy
      };
      
      stage.position(newPos);
      stage.batchDraw();
      onPanChange(newPos);
      return;
    }

    // Handle area selection
    if (isAreaSelecting && activeTool === 'select') {
      const _rect = {
        x: Math.min(pos.x, selectionRect.x),
        y: Math.min(pos.y, selectionRect.y),
        width: Math.abs(pos.x - selectionRect.x),
        height: Math.abs(pos.y - selectionRect.y)
      };
      setSelectionRect(rect);
      return;
    }

    // Handle drawing
    if (!isDrawing || !newObject) return;

    const _snappedPos = snapToGridPoint(pos);
    const _updatedObject = { ...newObject };

    if (newObject.type === 'rectangle') {
      updatedObject.width = Math.abs(snappedPos.x - newObject.x);
      updatedObject.height = Math.abs(snappedPos.y - newObject.y);
      if (snappedPos.x < newObject.x) updatedObject.x = snappedPos.x;
      if (snappedPos.y < newObject.y) updatedObject.y = snappedPos.y;
    } else if (newObject.type === 'circle') {
      const _radius = Math.sqrt(
        Math.pow(snappedPos.x - newObject.x, 2) + Math.pow(snappedPos.y - newObject.y, 2)
      );
      updatedObject.radius = radius;
    } else if (newObject.type === 'line') {
      updatedObject.points = [0, 0, snappedPos.x - newObject.x, snappedPos.y - newObject.y];
    } else if (newObject.type === 'door' || newObject.type === 'window') {
      updatedObject.width = Math.abs(snappedPos.x - newObject.x);
      updatedObject.height = Math.abs(snappedPos.y - newObject.y);
      if (snappedPos.x < newObject.x) updatedObject.x = snappedPos.x;
      if (snappedPos.y < newObject.y) updatedObject.y = snappedPos.y;
    }

    setNewObject(updatedObject);
  }, [isDrawing, newObject, isPanning, activeTool, lastPanPoint, onPanChange]);

  const _handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Handle area selection
    if (isAreaSelecting) {
      const _stage = stageRef.current;
      if (stage && selectionRect.width > 5 && selectionRect.height > 5) {
        const selectedIds: string[] = [];
        objects.forEach(obj => {
          const _objBounds = {
            x: obj.x,
            y: obj.y,
            width: obj.width || (obj.radius ? obj.radius * 2 : 0),
            height: obj.height || (obj.radius ? obj.radius * 2 : 0)
          };
          
          // Check if object intersects with selection rectangle
          if (objBounds.x < selectionRect.x + selectionRect.width &&
              objBounds.x + objBounds.width > selectionRect.x &&
              objBounds.y < selectionRect.y + selectionRect.height &&
              objBounds.y + objBounds.height > selectionRect.y) {
            selectedIds.push(obj.id);
          }
        });
        onSelectionChange(selectedIds);
      }
      setIsAreaSelecting(false);
      setSelectionRect({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }

    if (isDrawing && newObject) {
      // Only add object if it has meaningful size
      let hasSize = false;
      if (newObject.type === 'rectangle') {
        hasSize = (newObject.width || 0) > 5 && (newObject.height || 0) > 5;
      } else if (newObject.type === 'circle') {
        hasSize = (newObject.radius || 0) > 5;
      } else if (newObject.type === 'line') {
        const _points = newObject.points || [];
        hasSize = Math.abs(points[2]) > 5 || Math.abs(points[3]) > 5;
      } else if (newObject.type === 'door' || newObject.type === 'window') {
        hasSize = (newObject.width || 0) > 10 && (newObject.height || 0) > 5;
      } else if (newObject.type === 'text') {
        hasSize = (newObject.text || '').length > 0;
      }

      if (hasSize) {
        onAddObject(newObject);
        onSelectionChange([newObject.id]);
      }
    }
    
    setIsDrawing(false);
    setNewObject(null);
  }, [isDrawing, newObject, isPanning, isAreaSelecting, selectionRect, objects, onAddObject, onSelectionChange]);

  const _handleObjectChange = useCallback((id: string, newAttrs: Partial<CanvasObject>) => {
    const _updatedObjects = objects.map(obj => 
      obj.id === id ? { ...obj, ...newAttrs } : obj
    );
    onObjectsChange(updatedObjects);
  }, [objects, onObjectsChange]);

  const _renderObject = (obj: CanvasObject) => {
    const _commonProps = {
      key: obj.id,
      id: obj.id,
      x: obj.x,
      y: obj.y,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      rotation: obj.rotation,
      draggable: activeTool === 'select' || activeTool === 'move',
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        handleObjectChange(obj.id, {
          x: e.target.x(),
          y: e.target.y()
        });
      },
      onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
        const _node = e.target;
        const _scaleX = node.scaleX();
        const _scaleY = node.scaleY();

        // Reset scale and apply to dimensions
        node.scaleX(1);
        node.scaleY(1);

        const updates: Partial<CanvasObject> = {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation()
        };

        if (obj.type === 'rectangle') {
          updates.width = Math.max(5, node.width() * scaleX);
          updates.height = Math.max(5, node.height() * scaleY);
        } else if (obj.type === 'circle') {
          updates.radius = Math.max(5, node.radius() * Math.max(scaleX, scaleY));
        } else if (obj.type === 'line' || obj.type === 'wall') {
          const _points = obj.points || [0, 0, 0, 0];
          updates.points = [
            points[0] * scaleX,
            points[1] * scaleY,
            points[2] * scaleX,
            points[3] * scaleY
          ];
        } else if (obj.type === 'door' || obj.type === 'window') {
          updates.width = Math.max(20, node.width() * scaleX);
          updates.height = Math.max(10, node.height() * scaleY);
        }

        handleObjectChange(obj.id, updates);
      }
    };

    if (obj.type === 'rectangle') {
      return (
        <Rect
          {...commonProps}
          width={obj.width}
          height={obj.height}
        />
      );
    } else if (obj.type === 'circle') {
      return (
        <Circle
          {...commonProps}
          radius={obj.radius}
        />
      );
    } else if (obj.type === 'line') {
      return (
        <Line
          {...commonProps}
          points={obj.points}
          lineCap="round"
          lineJoin="round"
        />
      );
    } else if (obj.type === 'wall') {
      return (
        <Line
          {...commonProps}
          points={obj.points}
          lineCap="round"
          lineJoin="round"
          strokeWidth={obj.wallThickness || obj.strokeWidth}
        />
      );
    } else if (obj.type === 'door') {
      return (
        <React.Fragment key={obj.id}>
          {/* Door frame */}
          <Rect
            {...commonProps}
            width={obj.width}
            height={obj.height}
            fill={obj.fill}
          />
          {/* Door swing arc for single doors */}
          {obj.doorType === 'single' && (
            <Circle
              x={obj.x}
              y={obj.y}
              radius={obj.width || 80}
              fill="transparent"
              stroke={obj.stroke}
              strokeWidth={1}
              dash={[3, 3]}
              listening={false}
              startAngle={0}
              endAngle={90}
            />
          )}
          {/* Double door indicator */}
          {obj.doorType === 'double' && (
            <Line
              x={obj.x}
              y={obj.y}
              points={[(obj.width || 80) / 2, 0, (obj.width || 80) / 2, obj.height || 20]}
              stroke={obj.stroke}
              strokeWidth={1}
              listening={false}
            />
          )}
        </React.Fragment>
      );
    } else if (obj.type === 'window') {
      return (
        <React.Fragment key={obj.id}>
          {/* Window frame */}
          <Rect
            {...commonProps}
            width={obj.width}
            height={obj.height}
            fill={obj.fill}
          />
          {/* Window panes */}
          <Line
            x={obj.x}
            y={obj.y}
            points={[(obj.width || 80) / 2, 0, (obj.width || 80) / 2, obj.height || 20]}
            stroke={obj.stroke}
            strokeWidth={1}
            listening={false}
          />
          <Line
            x={obj.x}
            y={obj.y}
            points={[0, (obj.height || 20) / 2, obj.width || 80, (obj.height || 20) / 2]}
            stroke={obj.stroke}
            strokeWidth={1}
            listening={false}
          />
        </React.Fragment>
      );
    } else if (obj.type === 'text') {
      return (
        <Text
          {...commonProps}
          text={obj.text}
          fontSize={obj.fontSize || 16}
          fontFamily={obj.fontFamily || 'Arial'}
          fill={obj.fill}
        />
      );
    } else if (obj.type === 'room') {
      const _points = obj.points || [];
      if (points.length >= 6) { // At least 3 points (x,y pairs)
        return (
          <React.Fragment key={obj.id}>
            <Line
              {...commonProps}
              points={[...points, points[0], points[1]]} // Close the polygon
              closed={true}
              fill={obj.fill}
              stroke={obj.stroke}
              strokeWidth={obj.strokeWidth}
            />
            {/* Room label */}
            {obj.roomName && (
              <Text
                x={obj.x + 10}
                y={obj.y + 10}
                text={obj.roomName}
                fontSize={14}
                fontFamily="Arial"
                fill="#1E40AF"
                listening={false}
              />
            )}
          </React.Fragment>
        );
      }
    }

    return null;
  };

  // Apply zoom and pan to stage
  useEffect(() => {
    const _stage = stageRef.current;
    if (!stage) return;
    
    stage.scale({ x: zoom, y: zoom });
    stage.position(pan);
    stage.batchDraw();
  }, [zoom, pan]);

  return (
    <div className="canvas-container">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          if (activeTool === 'room' && isDefiningRoom && roomPoints.length >= 3) {
            onFinishRoom?.();
          }
        }}
        style={{ 
          cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 
                  activeTool === 'select' ? (isAreaSelecting ? 'crosshair' : 'default') : 
                  activeTool === 'room' ? 'crosshair' : 'crosshair' 
        }}
      >
        <Layer>
          {/* Grid background */}
          {gridVisible && (
            <>
              {Array.from({ length: Math.ceil(stageSize.width / gridSize) + 1 }).map((_, i) => (
                <React.Fragment key={`grid-v-${i}`}>
                  <Rect
                    x={i * gridSize}
                    y={0}
                    width={1}
                    height={stageSize.height}
                    fill="#E5E7EB"
                    listening={false}
                  />
                </React.Fragment>
              ))}
              {Array.from({ length: Math.ceil(stageSize.height / gridSize) + 1 }).map((_, i) => (
                <React.Fragment key={`grid-h-${i}`}>
                  <Rect
                    x={0}
                    y={i * gridSize}
                    width={stageSize.width}
                    height={1}
                    fill="#E5E7EB"
                    listening={false}
                  />
                </React.Fragment>
              ))}
            </>
          )}

          {/* Render existing objects */}
          {objects.filter(obj => {
            const _layer = layers.find(l => l.id === obj.layerId);
            return !layer || layer.visible;
          }).map(renderObject)}

          {/* Render object being drawn */}
          {newObject && renderObject(newObject)}

          {/* Render measurements */}
          {measurements.map(measurement => (
            <React.Fragment key={measurement.id}>
              <Line
                points={[
                  measurement.startPoint.x,
                  measurement.startPoint.y,
                  measurement.endPoint.x,
                  measurement.endPoint.y
                ]}
                stroke="#FF6B6B"
                strokeWidth={2}
                listening={false}
              />
              <Circle
                x={measurement.startPoint.x}
                y={measurement.startPoint.y}
                radius={4}
                fill="#FF6B6B"
                listening={false}
              />
              <Circle
                x={measurement.endPoint.x}
                y={measurement.endPoint.y}
                radius={4}
                fill="#FF6B6B"
                listening={false}
              />
              {/* Measurement label */}
              <Rect
                x={(measurement.startPoint.x + measurement.endPoint.x) / 2 - 25}
                y={(measurement.startPoint.y + measurement.endPoint.y) / 2 - 10}
                width={50}
                height={20}
                fill="white"
                stroke="#FF6B6B"
                strokeWidth={1}
                listening={false}
              />
            </React.Fragment>
          ))}

          {/* Render measurement preview */}
          {isMeasuring && measureStart && (
            <Line
              points={[measureStart.x, measureStart.y, measureStart.x, measureStart.y]}
              stroke="#FF6B6B"
              strokeWidth={2}
              dash={[5, 5]}
              listening={false}
            />
          )}

          {/* Area selection rectangle */}
          {isAreaSelecting && selectionRect.width > 0 && selectionRect.height > 0 && (
            <Rect
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3B82F6"
              strokeWidth={1}
              dash={[5, 5]}
              listening={false}
            />
          )}

          {/* Room definition preview */}
          {isDefiningRoom && roomPoints.length > 0 && (
            <>
              {/* Draw lines connecting the points */}
              {roomPoints.length > 1 && (
                <Line
                  points={roomPoints.flatMap(p => [p.x, p.y])}
                  stroke="#FF6B6B"
                  strokeWidth={2}
                  dash={[5, 5]}
                  listening={false}
                />
              )}
              {/* Draw points */}
              {roomPoints.map((point, index) => (
                <Circle
                  key={index}
                  x={point.x}
                  y={point.y}
                  radius={4}
                  fill="#FF6B6B"
                  listening={false}
                />
              ))}
              {/* Instructions */}
              {roomPoints.length >= 3 && (
                <Text
                  x={roomPoints[0].x}
                  y={roomPoints[0].y - 30}
                  text="Right-click to finish room"
                  fontSize={12}
                  fill="#FF6B6B"
                  listening={false}
                />
              )}
            </>
          )}

          {/* Transformer for selected objects */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
          {/* Snap Indicators */}
          <SnapIndicators
            snapPoints={currentSnapPoints}
            activeSnapPoint={activeSnapPoint}
            visible={activeTool !== 'select' && activeTool !== 'pan'}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default DesignCanvas;