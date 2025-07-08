import { useCallback, useMemo } from 'react';
import { Point } from '@/types';

export interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'geometry' | 'architecture' | 'accessibility' | 'building_code';
  title: string;
  description: string;
  objectIds: string[];
  position?: Point;
  severity: 'critical' | 'high' | 'medium' | 'low';
  suggestion?: string;
  autoFix?: () => void;
}

export interface ValidationRule {
  id: string;
  name: string;
  category: ValidationIssue['category'];
  enabled: boolean;
  validate: (objects: any[], rooms: any[]) => ValidationIssue[];
}

interface UseValidationRulesProps {
  objects: any[];
  rooms: any[];
  enabled?: boolean;
}

export const useValidationRules = ({
  objects,
  rooms,
  enabled = true
}: UseValidationRulesProps) => {

  // Utility functions for geometric calculations
  const getDistance = useCallback((p1: Point, p2: Point): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  const getObjectBounds = useCallback((obj: any) => {
    const x = obj.position.x;
    const y = obj.position.y;
    const width = obj.properties?.width || 50;
    const height = obj.properties?.height || 50;
    
    return {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height,
      centerX: x + width / 2,
      centerY: y + height / 2,
      width,
      height
    };
  }, []);

  const doObjectsOverlap = useCallback((obj1: any, obj2: any): boolean => {
    const bounds1 = getObjectBounds(obj1);
    const bounds2 = getObjectBounds(obj2);
    
    return !(bounds1.right < bounds2.left || 
             bounds2.right < bounds1.left || 
             bounds1.bottom < bounds2.top || 
             bounds2.bottom < bounds1.top);
  }, [getObjectBounds]);

  const isPointInRoom = useCallback((point: Point, roomPoints: Point[]): boolean => {
    if (roomPoints.length < 3) return false;

    let inside = false;
    let j = roomPoints.length - 1;

    for (let i = 0; i < roomPoints.length; i++) {
      const xi = roomPoints[i].x;
      const yi = roomPoints[i].y;
      const xj = roomPoints[j].x;
      const yj = roomPoints[j].y;

      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
      j = i;
    }

    return inside;
  }, []);

  // Validation Rules
  const validationRules: ValidationRule[] = useMemo(() => [
    // Geometry Rules
    {
      id: 'overlapping-objects',
      name: 'Overlapping Objects',
      category: 'geometry',
      enabled: true,
      validate: (objects) => {
        const issues: ValidationIssue[] = [];
        
        for (let i = 0; i < objects.length; i++) {
          for (let j = i + 1; j < objects.length; j++) {
            const obj1 = objects[i];
            const obj2 = objects[j];
            
            // Skip if different types that can overlap (e.g., text over walls)
            if ((obj1.type === 'text' || obj2.type === 'text') ||
                (obj1.type === 'room' || obj2.type === 'room')) {
              continue;
            }
            
            if (doObjectsOverlap(obj1, obj2)) {
              const bounds1 = getObjectBounds(obj1);
              const bounds2 = getObjectBounds(obj2);
              
              issues.push({
                id: `overlap-${obj1.id}-${obj2.id}`,
                type: 'warning',
                category: 'geometry',
                title: 'Overlapping Objects',
                description: `${obj1.type} and ${obj2.type} are overlapping`,
                objectIds: [obj1.id, obj2.id],
                position: {
                  x: (bounds1.centerX + bounds2.centerX) / 2,
                  y: (bounds1.centerY + bounds2.centerY) / 2
                },
                severity: 'medium',
                suggestion: 'Move objects to prevent overlap or check if this is intentional'
              });
            }
          }
        }
        
        return issues;
      }
    },

    // Architecture Rules
    {
      id: 'door-placement',
      name: 'Door Placement',
      category: 'architecture',
      enabled: true,
      validate: (objects) => {
        const issues: ValidationIssue[] = [];
        const doors = objects.filter(obj => obj.type === 'door');
        const walls = objects.filter(obj => obj.type === 'wall');
        
        doors.forEach(door => {
          const doorBounds = getObjectBounds(door);
          
          // Check if door is on a wall
          const onWall = walls.some(wall => {
            const wallBounds = getObjectBounds(wall);
            return doObjectsOverlap(door, wall);
          });
          
          if (!onWall) {
            issues.push({
              id: `door-no-wall-${door.id}`,
              type: 'error',
              category: 'architecture',
              title: 'Door Not on Wall',
              description: 'Door must be placed on a wall',
              objectIds: [door.id],
              position: { x: doorBounds.centerX, y: doorBounds.centerY },
              severity: 'high',
              suggestion: 'Move door to intersect with a wall'
            });
          }
          
          // Check door width constraints
          const doorWidth = door.properties?.width || 36;
          if (doorWidth < 24) {
            issues.push({
              id: `door-too-narrow-${door.id}`,
              type: 'warning',
              category: 'architecture',
              title: 'Door Too Narrow',
              description: `Door width (${doorWidth}") is below minimum recommended (24")`,
              objectIds: [door.id],
              position: { x: doorBounds.centerX, y: doorBounds.centerY },
              severity: 'medium',
              suggestion: 'Increase door width to at least 24" for accessibility'
            });
          }
          
          if (doorWidth > 48) {
            issues.push({
              id: `door-too-wide-${door.id}`,
              type: 'info',
              category: 'architecture',
              title: 'Very Wide Door',
              description: `Door width (${doorWidth}") is unusually wide`,
              objectIds: [door.id],
              position: { x: doorBounds.centerX, y: doorBounds.centerY },
              severity: 'low',
              suggestion: 'Consider if this door width is intentional'
            });
          }
        });
        
        return issues;
      }
    },

    {
      id: 'window-placement',
      name: 'Window Placement',
      category: 'architecture',
      enabled: true,
      validate: (objects) => {
        const issues: ValidationIssue[] = [];
        const windows = objects.filter(obj => obj.type === 'window');
        const walls = objects.filter(obj => obj.type === 'wall');
        
        windows.forEach(window => {
          const windowBounds = getObjectBounds(window);
          
          // Check if window is on a wall
          const onWall = walls.some(wall => doObjectsOverlap(window, wall));
          
          if (!onWall) {
            issues.push({
              id: `window-no-wall-${window.id}`,
              type: 'error',
              category: 'architecture',
              title: 'Window Not on Wall',
              description: 'Window must be placed on a wall',
              objectIds: [window.id],
              position: { x: windowBounds.centerX, y: windowBounds.centerY },
              severity: 'high',
              suggestion: 'Move window to intersect with a wall'
            });
          }
          
          // Check for windows too close to corners
          walls.forEach(wall => {
            if (doObjectsOverlap(window, wall)) {
              const wallBounds = getObjectBounds(wall);
              const distanceFromStart = getDistance(
                { x: windowBounds.centerX, y: windowBounds.centerY },
                { x: wallBounds.left, y: wallBounds.top }
              );
              const distanceFromEnd = getDistance(
                { x: windowBounds.centerX, y: windowBounds.centerY },
                { x: wallBounds.right, y: wallBounds.bottom }
              );
              
              if (distanceFromStart < 12 || distanceFromEnd < 12) {
                issues.push({
                  id: `window-corner-${window.id}`,
                  type: 'warning',
                  category: 'architecture',
                  title: 'Window Too Close to Corner',
                  description: 'Window is very close to wall corner',
                  objectIds: [window.id, wall.id],
                  position: { x: windowBounds.centerX, y: windowBounds.centerY },
                  severity: 'medium',
                  suggestion: 'Move window at least 12" from wall corners for structural integrity'
                });
              }
            }
          });
        });
        
        return issues;
      }
    },

    // Room Rules
    {
      id: 'room-size',
      name: 'Room Size Validation',
      category: 'architecture',
      enabled: true,
      validate: (objects, rooms) => {
        const issues: ValidationIssue[] = [];
        
        rooms.forEach(room => {
          const area = room.properties?.area || 0;
          const areaInSqFt = area / 144; // Convert from sq inches to sq feet
          
          // Minimum room sizes (in sq ft)
          const minimumSizes = {
            bedroom: 70,
            bathroom: 30,
            kitchen: 70,
            'living room': 120,
            'dining room': 100
          };
          
          const roomType = room.name.toLowerCase();
          const matchedType = Object.keys(minimumSizes).find(type => 
            roomType.includes(type.replace(' ', ''))
          );
          
          if (matchedType && areaInSqFt < minimumSizes[matchedType as keyof typeof minimumSizes]) {
            const centerX = room.points.reduce((sum: number, p: Point) => sum + p.x, 0) / room.points.length;
            const centerY = room.points.reduce((sum: number, p: Point) => sum + p.y, 0) / room.points.length;
            
            issues.push({
              id: `room-too-small-${room.id}`,
              type: 'warning',
              category: 'architecture',
              title: 'Room Below Minimum Size',
              description: `${room.name} (${Math.round(areaInSqFt)} sq ft) is below minimum recommended size (${minimumSizes[matchedType as keyof typeof minimumSizes]} sq ft)`,
              objectIds: [room.id],
              position: { x: centerX, y: centerY },
              severity: 'medium',
              suggestion: `Expand room to at least ${minimumSizes[matchedType as keyof typeof minimumSizes]} sq ft`
            });
          }
        });
        
        return issues;
      }
    },

    // Accessibility Rules
    {
      id: 'door-clearance',
      name: 'Door Clearance',
      category: 'accessibility',
      enabled: true,
      validate: (objects) => {
        const issues: ValidationIssue[] = [];
        const doors = objects.filter(obj => obj.type === 'door');
        const otherObjects = objects.filter(obj => obj.type !== 'door' && obj.type !== 'wall');
        
        doors.forEach(door => {
          const doorBounds = getObjectBounds(door);
          const swingDirection = door.properties?.swingDirection || 'inward';
          const doorWidth = door.properties?.width || 36;
          
          // Calculate swing area
          let swingArea;
          if (swingDirection === 'inward') {
            swingArea = {
              left: doorBounds.left - doorWidth,
              right: doorBounds.right,
              top: doorBounds.top - doorWidth,
              bottom: doorBounds.bottom + doorWidth
            };
          } else {
            swingArea = {
              left: doorBounds.left,
              right: doorBounds.right + doorWidth,
              top: doorBounds.top - doorWidth,
              bottom: doorBounds.bottom + doorWidth
            };
          }
          
          // Check for objects in swing path
          otherObjects.forEach(obj => {
            const objBounds = getObjectBounds(obj);
            
            if (!(objBounds.right < swingArea.left || 
                  swingArea.right < objBounds.left || 
                  objBounds.bottom < swingArea.top || 
                  swingArea.bottom < objBounds.top)) {
              
              issues.push({
                id: `door-clearance-${door.id}-${obj.id}`,
                type: 'warning',
                category: 'accessibility',
                title: 'Door Swing Obstruction',
                description: `${obj.type} may obstruct door swing`,
                objectIds: [door.id, obj.id],
                position: { x: doorBounds.centerX, y: doorBounds.centerY },
                severity: 'medium',
                suggestion: 'Ensure clear swing path for door operation'
              });
            }
          });
        });
        
        return issues;
      }
    },

    // Building Code Rules
    {
      id: 'egress-requirements',
      name: 'Egress Requirements',
      category: 'building_code',
      enabled: true,
      validate: (objects, rooms) => {
        const issues: ValidationIssue[] = [];
        const doors = objects.filter(obj => obj.type === 'door');
        
        rooms.forEach(room => {
          // Check if room has at least one door
          const roomCenter = {
            x: room.points.reduce((sum: number, p: Point) => sum + p.x, 0) / room.points.length,
            y: room.points.reduce((sum: number, p: Point) => sum + p.y, 0) / room.points.length
          };
          
          const roomHasDoor = doors.some(door => {
            const doorBounds = getObjectBounds(door);
            return isPointInRoom({ x: doorBounds.centerX, y: doorBounds.centerY }, room.points);
          });
          
          if (!roomHasDoor && room.name.toLowerCase() !== 'closet') {
            issues.push({
              id: `no-egress-${room.id}`,
              type: 'error',
              category: 'building_code',
              title: 'No Egress Door',
              description: `${room.name} has no door for egress`,
              objectIds: [room.id],
              position: roomCenter,
              severity: 'critical',
              suggestion: 'Add at least one door to provide egress from the room'
            });
          }
        });
        
        return issues;
      }
    }
  ], [doObjectsOverlap, getObjectBounds, getDistance, isPointInRoom]);

  // Run all enabled validation rules
  const runValidation = useCallback((): ValidationIssue[] => {
    if (!enabled) return [];
    
    const allIssues: ValidationIssue[] = [];
    
    validationRules.forEach(rule => {
      if (rule.enabled) {
        try {
          const ruleIssues = rule.validate(objects, rooms);
          allIssues.push(...ruleIssues);
        } catch (error) {
          console.warn(`Validation rule ${rule.id} failed:`, error);
        }
      }
    });
    
    return allIssues;
  }, [enabled, validationRules, objects, rooms]);

  // Get issues by category
  const getIssuesByCategory = useCallback((category: ValidationIssue['category']) => {
    return runValidation().filter(issue => issue.category === category);
  }, [runValidation]);

  // Get issues by severity
  const getIssuesBySeverity = useCallback((severity: ValidationIssue['severity']) => {
    return runValidation().filter(issue => issue.severity === severity);
  }, [runValidation]);

  // Get issues for specific object
  const getIssuesForObject = useCallback((objectId: string) => {
    return runValidation().filter(issue => issue.objectIds.includes(objectId));
  }, [runValidation]);

  // Get validation summary
  const getValidationSummary = useCallback(() => {
    const issues = runValidation();
    
    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length,
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length
    };
  }, [runValidation]);

  return {
    // Validation execution
    runValidation,
    validationRules,
    
    // Issue filtering
    getIssuesByCategory,
    getIssuesBySeverity,
    getIssuesForObject,
    
    // Summary
    getValidationSummary,
    
    // Current state
    issues: runValidation(),
    summary: getValidationSummary()
  };
};