import { useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  rotation?: number;
}

interface SnapPoint {
  x: number;
  y: number;
  type: 'grid' | 'object-edge' | 'object-center' | 'object-corner' | 'intersection' | 'guide';
  objectId?: string;
  description: string;
}

interface SnapResult {
  point: Point;
  snapPoints: SnapPoint[];
  isSnapped: boolean;
  snapType?: string;
}

interface UseSnapSystemProps {
  objects: CanvasObject[];
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  snapTolerance: number;
  guides: Array<{ x?: number; y?: number; type: 'vertical' | 'horizontal' }>;
}

export const useSnapSystem = ({
  objects,
  gridSize,
  snapToGrid,
  snapToObjects,
  snapTolerance = 10,
  guides = []
}: UseSnapSystemProps) => {
  
  // Generate grid snap points around a position
  const getGridSnapPoints = useCallback((x: number, y: number): SnapPoint[] => {
    if (!snapToGrid) return [];
    
    const gridX = Math.round(x / gridSize) * gridSize;
    const gridY = Math.round(y / gridSize) * gridSize;
    
    return [{
      x: gridX,
      y: gridY,
      type: 'grid',
      description: `Grid (${gridX}, ${gridY})`
    }];
  }, [gridSize, snapToGrid]);

  // Generate object snap points
  const getObjectSnapPoints = useCallback((targetX: number, targetY: number): SnapPoint[] => {
    if (!snapToObjects) return [];
    
    const snapPoints: SnapPoint[] = [];
    
    objects.forEach(obj => {
      // Skip if object is too far away to consider
      const distance = Math.sqrt(
        Math.pow(obj.x - targetX, 2) + Math.pow(obj.y - targetY, 2)
      );
      if (distance > snapTolerance * 5) return;
      
      if (obj.type === 'rectangle') {
        const width = obj.width || 0;
        const height = obj.height || 0;
        
        // Corners
        snapPoints.push(
          { x: obj.x, y: obj.y, type: 'object-corner', objectId: obj.id, description: 'Top-left corner' },
          { x: obj.x + width, y: obj.y, type: 'object-corner', objectId: obj.id, description: 'Top-right corner' },
          { x: obj.x, y: obj.y + height, type: 'object-corner', objectId: obj.id, description: 'Bottom-left corner' },
          { x: obj.x + width, y: obj.y + height, type: 'object-corner', objectId: obj.id, description: 'Bottom-right corner' }
        );
        
        // Centers
        snapPoints.push(
          { x: obj.x + width / 2, y: obj.y + height / 2, type: 'object-center', objectId: obj.id, description: 'Center' },
          { x: obj.x + width / 2, y: obj.y, type: 'object-edge', objectId: obj.id, description: 'Top edge center' },
          { x: obj.x + width / 2, y: obj.y + height, type: 'object-edge', objectId: obj.id, description: 'Bottom edge center' },
          { x: obj.x, y: obj.y + height / 2, type: 'object-edge', objectId: obj.id, description: 'Left edge center' },
          { x: obj.x + width, y: obj.y + height / 2, type: 'object-edge', objectId: obj.id, description: 'Right edge center' }
        );
      } else if (obj.type === 'circle') {
        const radius = obj.radius || 0;
        
        // Center and cardinal points
        snapPoints.push(
          { x: obj.x, y: obj.y, type: 'object-center', objectId: obj.id, description: 'Center' },
          { x: obj.x + radius, y: obj.y, type: 'object-edge', objectId: obj.id, description: 'Right edge' },
          { x: obj.x - radius, y: obj.y, type: 'object-edge', objectId: obj.id, description: 'Left edge' },
          { x: obj.x, y: obj.y + radius, type: 'object-edge', objectId: obj.id, description: 'Bottom edge' },
          { x: obj.x, y: obj.y - radius, type: 'object-edge', objectId: obj.id, description: 'Top edge' }
        );
      } else if (obj.type === 'line' || obj.type === 'wall') {
        const points = obj.points || [0, 0, 0, 0];
        const startX = obj.x + points[0];
        const startY = obj.y + points[1];
        const endX = obj.x + points[2];
        const endY = obj.y + points[3];
        
        // Line endpoints
        snapPoints.push(
          { x: startX, y: startY, type: 'object-corner', objectId: obj.id, description: 'Line start' },
          { x: endX, y: endY, type: 'object-corner', objectId: obj.id, description: 'Line end' }
        );
        
        // Line midpoint
        snapPoints.push({
          x: (startX + endX) / 2,
          y: (startY + endY) / 2,
          type: 'object-center',
          objectId: obj.id,
          description: 'Line midpoint'
        });
      }
    });
    
    return snapPoints;
  }, [objects, snapToObjects, snapTolerance]);

  // Generate guide snap points
  const getGuideSnapPoints = useCallback((targetX: number, targetY: number): SnapPoint[] => {
    const snapPoints: SnapPoint[] = [];
    
    guides.forEach((guide, index) => {
      if (guide.type === 'vertical' && guide.x !== undefined) {
        snapPoints.push({
          x: guide.x,
          y: targetY,
          type: 'guide',
          description: `Vertical guide ${index + 1}`
        });
      } else if (guide.type === 'horizontal' && guide.y !== undefined) {
        snapPoints.push({
          x: targetX,
          y: guide.y,
          type: 'guide',
          description: `Horizontal guide ${index + 1}`
        });
      }
    });
    
    return snapPoints;
  }, [guides]);

  // Find intersections between lines
  const getIntersectionSnapPoints = useCallback((targetX: number, targetY: number): SnapPoint[] => {
    if (!snapToObjects) return [];
    
    const snapPoints: SnapPoint[] = [];
    const lines = objects.filter(obj => obj.type === 'line' || obj.type === 'wall');
    
    // Check intersections between all line pairs
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const line1 = lines[i];
        const line2 = lines[j];
        
        const points1 = line1.points || [0, 0, 0, 0];
        const points2 = line2.points || [0, 0, 0, 0];
        
        const intersection = getLineIntersection(
          { x: line1.x + points1[0], y: line1.y + points1[1] },
          { x: line1.x + points1[2], y: line1.y + points1[3] },
          { x: line2.x + points2[0], y: line2.y + points2[1] },
          { x: line2.x + points2[2], y: line2.y + points2[3] }
        );
        
        if (intersection) {
          // Only add if intersection is close to target
          const distance = Math.sqrt(
            Math.pow(intersection.x - targetX, 2) + Math.pow(intersection.y - targetY, 2)
          );
          if (distance <= snapTolerance * 2) {
            snapPoints.push({
              x: intersection.x,
              y: intersection.y,
              type: 'intersection',
              description: 'Line intersection'
            });
          }
        }
      }
    }
    
    return snapPoints;
  }, [objects, snapToObjects, snapTolerance]);

  // Calculate line intersection
  const getLineIntersection = (p1: Point, p2: Point, p3: Point, p4: Point): Point | null => {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < 1e-10) return null; // Lines are parallel
    
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    const u = -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;
    
    // Check if intersection is within both line segments
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y)
      };
    }
    
    return null;
  };

  // Main snap function
  const snapPoint = useCallback((x: number, y: number): SnapResult => {
    const allSnapPoints: SnapPoint[] = [
      ...getGridSnapPoints(x, y),
      ...getObjectSnapPoints(x, y),
      ...getGuideSnapPoints(x, y),
      ...getIntersectionSnapPoints(x, y)
    ];
    
    // Find the closest snap point within tolerance
    let closestSnap: SnapPoint | null = null;
    let minDistance = snapTolerance;
    
    allSnapPoints.forEach(snapPoint => {
      const distance = Math.sqrt(
        Math.pow(snapPoint.x - x, 2) + Math.pow(snapPoint.y - y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSnap = snapPoint;
      }
    });
    
    if (closestSnap) {
      return {
        point: { x: closestSnap.x, y: closestSnap.y },
        snapPoints: [closestSnap],
        isSnapped: true,
        snapType: closestSnap.type
      };
    }
    
    return {
      point: { x, y },
      snapPoints: allSnapPoints,
      isSnapped: false
    };
  }, [
    getGridSnapPoints,
    getObjectSnapPoints,
    getGuideSnapPoints,
    getIntersectionSnapPoints,
    snapTolerance
  ]);

  // Check if two wall endpoints should auto-connect
  const shouldAutoConnect = useCallback((
    newWallStart: Point,
    newWallEnd: Point,
    existingObjects: CanvasObject[]
  ): { start?: CanvasObject; end?: CanvasObject } => {
    const walls = existingObjects.filter(obj => obj.type === 'wall' || obj.type === 'line');
    const connections: { start?: CanvasObject; end?: CanvasObject } = {};
    
    walls.forEach(wall => {
      const points = wall.points || [0, 0, 0, 0];
      const wallStart = { x: wall.x + points[0], y: wall.y + points[1] };
      const wallEnd = { x: wall.x + points[2], y: wall.y + points[3] };
      
      // Check if new wall start connects to existing wall
      if (getDistance(newWallStart, wallStart) <= snapTolerance ||
          getDistance(newWallStart, wallEnd) <= snapTolerance) {
        connections.start = wall;
      }
      
      // Check if new wall end connects to existing wall
      if (getDistance(newWallEnd, wallStart) <= snapTolerance ||
          getDistance(newWallEnd, wallEnd) <= snapTolerance) {
        connections.end = wall;
      }
    });
    
    return connections;
  }, [snapTolerance]);

  const getDistance = (p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  return {
    snapPoint,
    shouldAutoConnect,
    getObjectSnapPoints,
    getIntersectionSnapPoints
  };
};