import { useCallback, useRef, useState } from 'react';
import { Point } from '@/types';

interface LassoSelectionState {
  isActive: boolean;
  points: Point[];
  isDrawing: boolean;
}

interface UseLassoSelectionProps {
  onSelectionComplete: (selectedIds: string[]) => void;
  objects: Array<{
    id: string;
    position: Point;
    properties?: {
      width?: number;
      height?: number;
    };
  }>;
  isEnabled: boolean;
}

export const useLassoSelection = ({
  onSelectionComplete,
  objects,
  isEnabled
}: UseLassoSelectionProps) => {
  const [lassoState, setLassoState] = useState<LassoSelectionState>({
    isActive: false,
    points: [],
    isDrawing: false
  });

  const startPointRef = useRef<Point | null>(null);

  // Check if a point is inside a polygon using ray casting algorithm
  const isPointInPolygon = useCallback((point: Point, polygon: Point[]): boolean => {
    if (polygon.length < 3) return false;

    let inside = false;
    let j = polygon.length - 1;

    for (let i = 0; i < polygon.length; i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
      j = i;
    }

    return inside;
  }, []);

  // Check if an object's bounds intersect with the lasso
  const isObjectInLasso = useCallback((obj: any, lassoPoints: Point[]): boolean => {
    if (lassoPoints.length < 3) return false;

    const objX = obj.position.x;
    const objY = obj.position.y;
    const objWidth = obj.properties?.width || 50;
    const objHeight = obj.properties?.height || 50;

    // Check if any corner of the object is inside the lasso
    const corners = [
      { x: objX, y: objY },
      { x: objX + objWidth, y: objY },
      { x: objX + objWidth, y: objY + objHeight },
      { x: objX, y: objY + objHeight }
    ];

    // If any corner is inside the lasso, select the object
    for (const corner of corners) {
      if (isPointInPolygon(corner, lassoPoints)) {
        return true;
      }
    }

    // Also check if the object center is inside
    const center = {
      x: objX + objWidth / 2,
      y: objY + objHeight / 2
    };

    return isPointInPolygon(center, lassoPoints);
  }, [isPointInPolygon]);

  // Get mouse/touch position relative to canvas
  const getCanvasPosition = useCallback((
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>,
    element: HTMLElement
  ): Point => {
    const rect = element.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }, []);

  const startLasso = useCallback((
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) => {
    if (!isEnabled) return;

    const position = getCanvasPosition(e, e.currentTarget);
    startPointRef.current = position;

    setLassoState({
      isActive: true,
      points: [position],
      isDrawing: true
    });

    e.preventDefault();
  }, [isEnabled, getCanvasPosition]);

  const updateLasso = useCallback((
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) => {
    if (!lassoState.isDrawing || !isEnabled) return;

    const position = getCanvasPosition(e, e.currentTarget);
    
    setLassoState(prev => ({
      ...prev,
      points: [...prev.points, position]
    }));

    e.preventDefault();
  }, [lassoState.isDrawing, isEnabled, getCanvasPosition]);

  const completeLasso = useCallback((
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) => {
    if (!lassoState.isDrawing || !isEnabled) return;

    const finalPosition = getCanvasPosition(e, e.currentTarget);
    const finalPoints = [...lassoState.points, finalPosition];

    // Close the lasso by connecting back to start point if needed
    const startPoint = startPointRef.current;
    if (startPoint) {
      const distance = Math.sqrt(
        Math.pow(finalPosition.x - startPoint.x, 2) + 
        Math.pow(finalPosition.y - startPoint.y, 2)
      );
      
      // If we're close to the start point, close the loop
      if (distance < 20) {
        finalPoints.push(startPoint);
      }
    }

    // Find objects within the lasso
    const selectedIds = objects
      .filter(obj => isObjectInLasso(obj, finalPoints))
      .map(obj => obj.id);

    // Complete the selection
    onSelectionComplete(selectedIds);

    // Reset lasso state
    setLassoState({
      isActive: false,
      points: [],
      isDrawing: false
    });

    startPointRef.current = null;
    e.preventDefault();
  }, [lassoState.isDrawing, lassoState.points, isEnabled, objects, isObjectInLasso, onSelectionComplete, getCanvasPosition]);

  const cancelLasso = useCallback(() => {
    setLassoState({
      isActive: false,
      points: [],
      isDrawing: false
    });
    startPointRef.current = null;
  }, []);

  // Generate SVG path for the lasso
  const getLassoPath = useCallback((): string => {
    if (lassoState.points.length < 2) return '';

    const pathData = lassoState.points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      } else {
        return `${path} L ${point.x} ${point.y}`;
      }
    }, '');

    return pathData;
  }, [lassoState.points]);

  return {
    lassoState,
    lassoHandlers: {
      onMouseDown: startLasso,
      onMouseMove: updateLasso,
      onMouseUp: completeLasso,
      onTouchStart: startLasso,
      onTouchMove: updateLasso,
      onTouchEnd: completeLasso
    },
    getLassoPath,
    cancelLasso,
    isLassoActive: lassoState.isActive
  };
};