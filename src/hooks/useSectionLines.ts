import { useCallback, useState } from 'react';
import { Point } from '@/types';

export interface SectionLine {
  id: string;
  name: string;
  startPoint: Point;
  endPoint: Point;
  color: string;
  visible: boolean;
  direction: 'left-to-right' | 'right-to-left';
  properties: {
    lineWeight: number;
    arrowSize: number;
    labelOffset: number;
    showDimensions: boolean;
  };
}

export interface SectionView {
  id: string;
  sectionLineId: string;
  name: string;
  scale: number;
  showMaterials: boolean;
  showDimensions: boolean;
  viewData: {
    walls: any[];
    doors: any[];
    windows: any[];
    height: number;
  };
}

interface UseSectionLinesProps {
  objects: any[];
  rooms: any[];
  enabled?: boolean;
}

export const useSectionLines = ({
  objects,
  rooms,
  enabled = true
}: UseSectionLinesProps) => {
  const [sectionLines, setSectionLines] = useState<SectionLine[]>([]);
  const [sectionViews, setSectionViews] = useState<SectionView[]>([]);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [currentSectionLine, setCurrentSectionLine] = useState<Partial<SectionLine> | null>(null);

  // Start creating a new section line
  const startSectionLine = useCallback((startPoint: Point) => {
    if (!enabled) return;

    const newSectionLine: Partial<SectionLine> = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `Section ${sectionLines.length + 1}`,
      startPoint,
      endPoint: startPoint,
      color: '#FF6B6B',
      visible: true,
      direction: 'left-to-right',
      properties: {
        lineWeight: 2,
        arrowSize: 12,
        labelOffset: 20,
        showDimensions: true
      }
    };

    setCurrentSectionLine(newSectionLine);
    setIsCreatingSection(true);
  }, [enabled, sectionLines.length]);

  // Update section line end point while dragging
  const updateSectionLine = useCallback((endPoint: Point) => {
    if (!isCreatingSection || !currentSectionLine) return;

    setCurrentSectionLine(prev => ({
      ...prev,
      endPoint
    }));
  }, [isCreatingSection, currentSectionLine]);

  // Complete section line creation
  const completeSectionLine = useCallback(() => {
    if (!currentSectionLine || !currentSectionLine.startPoint || !currentSectionLine.endPoint) return;

    // Ensure minimum length
    const distance = Math.sqrt(
      Math.pow(currentSectionLine.endPoint.x - currentSectionLine.startPoint.x, 2) +
      Math.pow(currentSectionLine.endPoint.y - currentSectionLine.startPoint.y, 2)
    );

    if (distance < 20) {
      cancelSectionLine();
      return;
    }

    const completedSectionLine = currentSectionLine as SectionLine;
    setSectionLines(prev => [...prev, completedSectionLine]);
    
    // Generate section view
    generateSectionView(completedSectionLine);
    
    setCurrentSectionLine(null);
    setIsCreatingSection(false);
  }, [currentSectionLine]);

  // Cancel section line creation
  const cancelSectionLine = useCallback(() => {
    setCurrentSectionLine(null);
    setIsCreatingSection(false);
  }, []);

  // Generate section view from section line
  const generateSectionView = useCallback((sectionLine: SectionLine) => {
    const sectionView: SectionView = {
      id: `view-${sectionLine.id}`,
      sectionLineId: sectionLine.id,
      name: `${sectionLine.name} View`,
      scale: 1,
      showMaterials: true,
      showDimensions: true,
      viewData: calculateSectionData(sectionLine)
    };

    setSectionViews(prev => [...prev, sectionView]);
  }, []);

  // Calculate section data by intersecting with objects
  const calculateSectionData = useCallback((sectionLine: SectionLine) => {
    const walls: any[] = [];
    const doors: any[] = [];
    const windows: any[] = [];
    let maxHeight = 96; // Default 8 feet

    // Get walls that intersect with section line
    const wallObjects = objects.filter(obj => obj.type === 'wall');
    
    wallObjects.forEach(wall => {
      const intersection = getLineIntersection(sectionLine, wall);
      if (intersection) {
        const wallHeight = wall.properties?.height || 96;
        maxHeight = Math.max(maxHeight, wallHeight);
        
        walls.push({
          id: wall.id,
          position: intersection,
          height: wallHeight,
          thickness: wall.properties?.thickness || 6,
          material: wall.properties?.material || 'Drywall'
        });
      }
    });

    // Get doors that intersect with section line
    const doorObjects = objects.filter(obj => obj.type === 'door');
    
    doorObjects.forEach(door => {
      const intersection = getLineIntersection(sectionLine, door);
      if (intersection) {
        doors.push({
          id: door.id,
          position: intersection,
          width: door.properties?.width || 36,
          height: door.properties?.height || 80,
          type: door.properties?.type || 'single'
        });
      }
    });

    // Get windows that intersect with section line
    const windowObjects = objects.filter(obj => obj.type === 'window');
    
    windowObjects.forEach(window => {
      const intersection = getLineIntersection(sectionLine, window);
      if (intersection) {
        windows.push({
          id: window.id,
          position: intersection,
          width: window.properties?.width || 48,
          height: window.properties?.height || 36,
          sillHeight: window.properties?.sillHeight || 30
        });
      }
    });

    return {
      walls,
      doors,
      windows,
      height: maxHeight
    };
  }, [objects]);

  // Calculate line intersection with object bounds
  const getLineIntersection = useCallback((sectionLine: SectionLine, obj: any) => {
    const objBounds = {
      left: obj.position.x,
      right: obj.position.x + (obj.properties?.width || 50),
      top: obj.position.y,
      bottom: obj.position.y + (obj.properties?.height || 50)
    };

    // Check if section line intersects with object bounds
    const intersection = lineRectIntersection(
      sectionLine.startPoint,
      sectionLine.endPoint,
      objBounds
    );

    return intersection;
  }, []);

  // Line-rectangle intersection calculation
  const lineRectIntersection = useCallback((
    lineStart: Point,
    lineEnd: Point,
    rect: { left: number; right: number; top: number; bottom: number }
  ) => {
    // Simplified intersection - check if line passes through rectangle
    const minX = Math.min(lineStart.x, lineEnd.x);
    const maxX = Math.max(lineStart.x, lineEnd.x);
    const minY = Math.min(lineStart.y, lineEnd.y);
    const maxY = Math.max(lineStart.y, lineEnd.y);

    if (maxX < rect.left || minX > rect.right || maxY < rect.top || minY > rect.bottom) {
      return null;
    }

    // Return intersection point (simplified - center of object)
    return {
      x: (rect.left + rect.right) / 2,
      y: (rect.top + rect.bottom) / 2
    };
  }, []);

  // Remove section line and its view
  const removeSectionLine = useCallback((sectionLineId: string) => {
    setSectionLines(prev => prev.filter(line => line.id !== sectionLineId));
    setSectionViews(prev => prev.filter(view => view.sectionLineId !== sectionLineId));
  }, []);

  // Update section line properties
  const updateSectionLineProperties = useCallback((
    sectionLineId: string, 
    updates: Partial<SectionLine>
  ) => {
    setSectionLines(prev => prev.map(line => 
      line.id === sectionLineId ? { ...line, ...updates } : line
    ));

    // Regenerate section view if needed
    if (updates.startPoint || updates.endPoint) {
      const updatedLine = sectionLines.find(line => line.id === sectionLineId);
      if (updatedLine) {
        const newSectionView = {
          ...sectionViews.find(view => view.sectionLineId === sectionLineId)!,
          viewData: calculateSectionData({ ...updatedLine, ...updates } as SectionLine)
        };
        setSectionViews(prev => prev.map(view => 
          view.sectionLineId === sectionLineId ? newSectionView : view
        ));
      }
    }
  }, [sectionLines, sectionViews, calculateSectionData]);

  // Get section line path for SVG rendering
  const getSectionLinePath = useCallback((sectionLine: SectionLine) => {
    const { startPoint, endPoint } = sectionLine;
    return `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
  }, []);

  // Get arrow points for section line direction
  const getArrowPoints = useCallback((sectionLine: SectionLine) => {
    const { startPoint, endPoint, properties, direction } = sectionLine;
    const arrowSize = properties.arrowSize;
    
    // Calculate arrow direction
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return [];
    
    const unitX = dx / length;
    const unitY = dy / length;
    
    // Perpendicular vector
    const perpX = -unitY;
    const perpY = unitX;
    
    // Arrow points
    const arrowTip = direction === 'left-to-right' ? endPoint : startPoint;
    const arrowBase = direction === 'left-to-right' ? startPoint : endPoint;
    
    const arrow1 = {
      x: arrowTip.x - unitX * arrowSize + perpX * arrowSize * 0.5,
      y: arrowTip.y - unitY * arrowSize + perpY * arrowSize * 0.5
    };
    
    const arrow2 = {
      x: arrowTip.x - unitX * arrowSize - perpX * arrowSize * 0.5,
      y: arrowTip.y - unitY * arrowSize - perpY * arrowSize * 0.5
    };
    
    return [arrowTip, arrow1, arrow2];
  }, []);

  return {
    // State
    sectionLines,
    sectionViews,
    isCreatingSection,
    currentSectionLine,
    
    // Section line management
    startSectionLine,
    updateSectionLine,
    completeSectionLine,
    cancelSectionLine,
    removeSectionLine,
    updateSectionLineProperties,
    
    // Section view management
    generateSectionView,
    
    // Rendering helpers
    getSectionLinePath,
    getArrowPoints
  };
};