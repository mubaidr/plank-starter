import { useCallback, useRef, useState } from 'react';
import { Point } from '@/types';

interface TouchGestureState {
  isPinching: boolean;
  isPanning: boolean;
  initialDistance: number;
  initialZoom: number;
  initialPan: Point;
  lastTouchCenter: Point;
}

interface UseTouchGesturesProps {
  onZoom: (zoom: number) => void;
  onPan: (pan: Point) => void;
  currentZoom: number;
  currentPan: Point;
  minZoom?: number;
  maxZoom?: number;
}

export const useTouchGestures = ({
  onZoom,
  onPan,
  currentZoom,
  currentPan,
  minZoom = 0.1,
  maxZoom = 10
}: UseTouchGesturesProps) => {
  const gestureState = useRef<TouchGestureState>({
    isPinching: false,
    isPanning: false,
    initialDistance: 0,
    initialZoom: 1,
    initialPan: { x: 0, y: 0 },
    lastTouchCenter: { x: 0, y: 0 }
  });

  const [isGesturing, setIsGesturing] = useState(false);

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate center point between two touches
  const getTouchCenter = useCallback((touch1: Touch, touch2: Touch): Point => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  // Get touch coordinates relative to element
  const getTouchPosition = useCallback((touch: Touch, element: HTMLElement): Point => {
    const rect = element.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const touches = e.touches;
    
    if (touches.length === 1) {
      // Single touch - prepare for panning
      const touch = touches[0];
      const position = getTouchPosition(touch, e.currentTarget);
      
      gestureState.current = {
        ...gestureState.current,
        isPanning: true,
        isPinching: false,
        lastTouchCenter: position,
        initialPan: currentPan
      };
      setIsGesturing(true);
    } else if (touches.length === 2) {
      // Two touches - prepare for pinch zoom
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const center = getTouchCenter(touch1, touch2);
      
      gestureState.current = {
        ...gestureState.current,
        isPinching: true,
        isPanning: false,
        initialDistance: distance,
        initialZoom: currentZoom,
        lastTouchCenter: center,
        initialPan: currentPan
      };
      setIsGesturing(true);
    }

    // Prevent default to avoid scrolling
    e.preventDefault();
  }, [currentZoom, currentPan, getTouchDistance, getTouchCenter, getTouchPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const touches = e.touches;
    const state = gestureState.current;

    if (touches.length === 1 && state.isPanning) {
      // Single touch panning
      const touch = touches[0];
      const position = getTouchPosition(touch, e.currentTarget);
      
      const deltaX = position.x - state.lastTouchCenter.x;
      const deltaY = position.y - state.lastTouchCenter.y;
      
      const newPan = {
        x: state.initialPan.x + deltaX,
        y: state.initialPan.y + deltaY
      };
      
      onPan(newPan);
      
    } else if (touches.length === 2 && state.isPinching) {
      // Two touch pinch zoom
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = getTouchDistance(touch1, touch2);
      const center = getTouchCenter(touch1, touch2);
      
      // Calculate zoom based on distance change
      const zoomFactor = distance / state.initialDistance;
      const newZoom = Math.max(minZoom, Math.min(maxZoom, state.initialZoom * zoomFactor));
      
      // Calculate pan adjustment to keep zoom centered on touch center
      const zoomDelta = newZoom - currentZoom;
      const centerDeltaX = center.x - state.lastTouchCenter.x;
      const centerDeltaY = center.y - state.lastTouchCenter.y;
      
      const newPan = {
        x: currentPan.x + centerDeltaX - (center.x * zoomDelta),
        y: currentPan.y + centerDeltaY - (center.y * zoomDelta)
      };
      
      onZoom(newZoom);
      onPan(newPan);
    }

    e.preventDefault();
  }, [currentZoom, currentPan, onZoom, onPan, getTouchDistance, getTouchCenter, getTouchPosition, minZoom, maxZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const touches = e.touches;
    
    if (touches.length === 0) {
      // All touches ended
      gestureState.current = {
        ...gestureState.current,
        isPinching: false,
        isPanning: false
      };
      setIsGesturing(false);
    } else if (touches.length === 1 && gestureState.current.isPinching) {
      // Went from pinch to single touch - switch to pan
      const touch = touches[0];
      const position = getTouchPosition(touch, e.currentTarget);
      
      gestureState.current = {
        ...gestureState.current,
        isPinching: false,
        isPanning: true,
        lastTouchCenter: position,
        initialPan: currentPan
      };
    }

    e.preventDefault();
  }, [currentPan, getTouchPosition]);

  // Prevent context menu on long press
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isGesturing) {
      e.preventDefault();
    }
  }, [isGesturing]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onContextMenu: handleContextMenu
    },
    isGesturing
  };
};