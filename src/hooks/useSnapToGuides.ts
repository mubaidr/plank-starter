import { useCallback, useState } from 'react';
import { Point } from '@/types';

export interface Guide {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number; // x for vertical guides, y for horizontal guides
  color: string;
  isTemporary: boolean;
  label?: string;
}

interface SnapResult {
  snapped: boolean;
  snapPoint: Point;
  snapGuide?: Guide;
  snapDistance: number;
}

interface UseSnapToGuidesProps {
  guides: Guide[];
  onGuidesChange: (guides: Guide[]) => void;
  snapTolerance?: number;
  enabled?: boolean;
}

export const useSnapToGuides = ({
  guides,
  onGuidesChange,
  snapTolerance = 10,
  enabled = true
}: UseSnapToGuidesProps) => {
  const [isDraggingGuide, setIsDraggingGuide] = useState<string | null>(null);
  const [isCreatingGuide, setIsCreatingGuide] = useState<'horizontal' | 'vertical' | null>(null);

  // Add a new guide
  const addGuide = useCallback((type: 'horizontal' | 'vertical', position: number, isTemporary = false) => {
    const newGuide: Guide = {
      id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      color: isTemporary ? '#FF6B6B' : '#3B82F6',
      isTemporary,
      label: isTemporary ? 'Temp' : undefined
    };
    
    onGuidesChange([...guides, newGuide]);
    return newGuide.id;
  }, [guides, onGuidesChange]);

  // Remove a guide
  const removeGuide = useCallback((guideId: string) => {
    onGuidesChange(guides.filter(guide => guide.id !== guideId));
  }, [guides, onGuidesChange]);

  // Update guide position
  const updateGuidePosition = useCallback((guideId: string, position: number) => {
    onGuidesChange(guides.map(guide => 
      guide.id === guideId ? { ...guide, position } : guide
    ));
  }, [guides, onGuidesChange]);

  // Make a temporary guide permanent
  const makeGuidePermanent = useCallback((guideId: string, label?: string) => {
    onGuidesChange(guides.map(guide => 
      guide.id === guideId 
        ? { ...guide, isTemporary: false, color: '#3B82F6', label }
        : guide
    ));
  }, [guides, onGuidesChange]);

  // Remove all temporary guides
  const clearTemporaryGuides = useCallback(() => {
    onGuidesChange(guides.filter(guide => !guide.isTemporary));
  }, [guides, onGuidesChange]);

  // Snap a point to the nearest guide
  const snapToGuides = useCallback((point: Point): SnapResult => {
    if (!enabled || guides.length === 0) {
      return {
        snapped: false,
        snapPoint: point,
        snapDistance: 0
      };
    }

    let closestSnap: SnapResult = {
      snapped: false,
      snapPoint: point,
      snapDistance: Infinity
    };

    // Check horizontal guides (snap Y coordinate)
    for (const guide of guides.filter(g => g.type === 'horizontal')) {
      const distance = Math.abs(point.y - guide.position);
      if (distance <= snapTolerance && distance < closestSnap.snapDistance) {
        closestSnap = {
          snapped: true,
          snapPoint: { x: point.x, y: guide.position },
          snapGuide: guide,
          snapDistance: distance
        };
      }
    }

    // Check vertical guides (snap X coordinate)
    for (const guide of guides.filter(g => g.type === 'vertical')) {
      const distance = Math.abs(point.x - guide.position);
      if (distance <= snapTolerance && distance < closestSnap.snapDistance) {
        closestSnap = {
          snapped: true,
          snapPoint: { x: guide.position, y: point.y },
          snapGuide: guide,
          snapDistance: distance
        };
      }
    }

    // If we found both horizontal and vertical snaps within tolerance, snap to intersection
    const horizontalSnap = guides
      .filter(g => g.type === 'horizontal')
      .find(g => Math.abs(point.y - g.position) <= snapTolerance);
    
    const verticalSnap = guides
      .filter(g => g.type === 'vertical')
      .find(g => Math.abs(point.x - g.position) <= snapTolerance);

    if (horizontalSnap && verticalSnap) {
      const hDistance = Math.abs(point.y - horizontalSnap.position);
      const vDistance = Math.abs(point.x - verticalSnap.position);
      const totalDistance = hDistance + vDistance;

      if (totalDistance < closestSnap.snapDistance) {
        closestSnap = {
          snapped: true,
          snapPoint: { x: verticalSnap.position, y: horizontalSnap.position },
          snapGuide: hDistance < vDistance ? horizontalSnap : verticalSnap,
          snapDistance: totalDistance
        };
      }
    }

    return closestSnap;
  }, [enabled, guides, snapTolerance]);

  // Create guide from mouse position
  const createGuideFromMouse = useCallback((
    e: React.MouseEvent<HTMLElement>,
    type: 'horizontal' | 'vertical'
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = type === 'horizontal' 
      ? e.clientY - rect.top 
      : e.clientX - rect.left;
    
    return addGuide(type, position, true);
  }, [addGuide]);

  // Handle guide dragging
  const startDragGuide = useCallback((guideId: string) => {
    setIsDraggingGuide(guideId);
  }, []);

  const dragGuide = useCallback((
    e: React.MouseEvent<HTMLElement>,
    guideId: string
  ) => {
    if (isDraggingGuide !== guideId) return;

    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const position = guide.type === 'horizontal' 
      ? e.clientY - rect.top 
      : e.clientX - rect.left;

    updateGuidePosition(guideId, position);
  }, [isDraggingGuide, guides, updateGuidePosition]);

  const endDragGuide = useCallback(() => {
    setIsDraggingGuide(null);
  }, []);

  // Get snap indicators for visual feedback
  const getSnapIndicators = useCallback((point: Point) => {
    const snapResult = snapToGuides(point);
    if (!snapResult.snapped || !snapResult.snapGuide) return [];

    const indicators = [];
    const guide = snapResult.snapGuide;

    if (guide.type === 'horizontal') {
      // Show horizontal snap line
      indicators.push({
        type: 'line' as const,
        x1: 0,
        y1: guide.position,
        x2: 9999, // Full width
        y2: guide.position,
        color: '#FF6B6B',
        strokeWidth: 2,
        strokeDasharray: '4,4'
      });
    } else {
      // Show vertical snap line
      indicators.push({
        type: 'line' as const,
        x1: guide.position,
        y1: 0,
        x2: guide.position,
        y2: 9999, // Full height
        color: '#FF6B6B',
        strokeWidth: 2,
        strokeDasharray: '4,4'
      });
    }

    // Add snap point indicator
    indicators.push({
      type: 'circle' as const,
      cx: snapResult.snapPoint.x,
      cy: snapResult.snapPoint.y,
      r: 4,
      fill: '#FF6B6B',
      stroke: '#FFFFFF',
      strokeWidth: 2
    });

    return indicators;
  }, [snapToGuides]);

  // Keyboard shortcuts for guide management
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'h':
        case 'H':
          e.preventDefault();
          setIsCreatingGuide('horizontal');
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          setIsCreatingGuide('vertical');
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          clearTemporaryGuides();
          break;
      }
    }
    
    if (e.key === 'Escape') {
      setIsCreatingGuide(null);
      clearTemporaryGuides();
    }
  }, [clearTemporaryGuides]);

  return {
    // State
    guides,
    isDraggingGuide,
    isCreatingGuide,
    
    // Guide management
    addGuide,
    removeGuide,
    updateGuidePosition,
    makeGuidePermanent,
    clearTemporaryGuides,
    
    // Snapping
    snapToGuides,
    getSnapIndicators,
    
    // Interaction
    createGuideFromMouse,
    startDragGuide,
    dragGuide,
    endDragGuide,
    setIsCreatingGuide,
    
    // Keyboard handling
    handleKeyDown
  };
};