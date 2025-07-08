import React from 'react';
import { Circle, Line, Group } from 'react-konva';

interface SnapPoint {
  x: number;
  y: number;
  type: 'grid' | 'object-edge' | 'object-center' | 'object-corner' | 'intersection' | 'guide';
  objectId?: string;
  description: string;
}

interface SnapIndicatorsProps {
  snapPoints: SnapPoint[];
  activeSnapPoint?: SnapPoint;
  visible: boolean;
}

const SnapIndicators: React.FC<SnapIndicatorsProps> = ({
  snapPoints,
  activeSnapPoint,
  visible
}) => {
  if (!visible) return null;

  const getSnapPointColor = (type: string): string => {
    switch (type) {
      case 'grid':
        return '#10B981'; // Green
      case 'object-edge':
        return '#3B82F6'; // Blue
      case 'object-center':
        return '#8B5CF6'; // Purple
      case 'object-corner':
        return '#F59E0B'; // Amber
      case 'intersection':
        return '#EF4444'; // Red
      case 'guide':
        return '#06B6D4'; // Cyan
      default:
        return '#6B7280'; // Gray
    }
  };

  const getSnapPointSize = (type: string, isActive: boolean): number => {
    const baseSize = isActive ? 8 : 5;
    switch (type) {
      case 'intersection':
        return baseSize + 2;
      case 'object-center':
        return baseSize + 1;
      default:
        return baseSize;
    }
  };

  const renderSnapPoint = (snapPoint: SnapPoint, isActive: boolean = false) => {
    const color = getSnapPointColor(snapPoint.type);
    const size = getSnapPointSize(snapPoint.type, isActive);
    
    if (snapPoint.type === 'intersection') {
      // Render intersection as crosshairs
      return (
        <Group key={`${snapPoint.x}-${snapPoint.y}-${snapPoint.type}`}>
          <Line
            points={[snapPoint.x - size, snapPoint.y, snapPoint.x + size, snapPoint.y]}
            stroke={color}
            strokeWidth={2}
            listening={false}
          />
          <Line
            points={[snapPoint.x, snapPoint.y - size, snapPoint.x, snapPoint.y + size]}
            stroke={color}
            strokeWidth={2}
            listening={false}
          />
          {isActive && (
            <Circle
              x={snapPoint.x}
              y={snapPoint.y}
              radius={size + 3}
              stroke={color}
              strokeWidth={1}
              fill="transparent"
              listening={false}
            />
          )}
        </Group>
      );
    } else if (snapPoint.type === 'object-edge') {
      // Render edge snap as small square
      return (
        <Group key={`${snapPoint.x}-${snapPoint.y}-${snapPoint.type}`}>
          <Circle
            x={snapPoint.x}
            y={snapPoint.y}
            radius={size}
            fill={color}
            stroke="white"
            strokeWidth={1}
            listening={false}
          />
          {isActive && (
            <Circle
              x={snapPoint.x}
              y={snapPoint.y}
              radius={size + 4}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
              listening={false}
            />
          )}
        </Group>
      );
    } else if (snapPoint.type === 'object-corner') {
      // Render corner as diamond
      return (
        <Group key={`${snapPoint.x}-${snapPoint.y}-${snapPoint.type}`}>
          <Line
            points={[
              snapPoint.x, snapPoint.y - size,
              snapPoint.x + size, snapPoint.y,
              snapPoint.x, snapPoint.y + size,
              snapPoint.x - size, snapPoint.y,
              snapPoint.x, snapPoint.y - size
            ]}
            fill={color}
            stroke="white"
            strokeWidth={1}
            closed={true}
            listening={false}
          />
          {isActive && (
            <Circle
              x={snapPoint.x}
              y={snapPoint.y}
              radius={size + 4}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
              listening={false}
            />
          )}
        </Group>
      );
    } else if (snapPoint.type === 'object-center') {
      // Render center as circle with cross
      return (
        <Group key={`${snapPoint.x}-${snapPoint.y}-${snapPoint.type}`}>
          <Circle
            x={snapPoint.x}
            y={snapPoint.y}
            radius={size}
            fill={color}
            stroke="white"
            strokeWidth={1}
            listening={false}
          />
          <Line
            points={[snapPoint.x - size/2, snapPoint.y, snapPoint.x + size/2, snapPoint.y]}
            stroke="white"
            strokeWidth={1}
            listening={false}
          />
          <Line
            points={[snapPoint.x, snapPoint.y - size/2, snapPoint.x, snapPoint.y + size/2]}
            stroke="white"
            strokeWidth={1}
            listening={false}
          />
          {isActive && (
            <Circle
              x={snapPoint.x}
              y={snapPoint.y}
              radius={size + 4}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
              listening={false}
            />
          )}
        </Group>
      );
    } else if (snapPoint.type === 'guide') {
      // Render guide as triangle
      return (
        <Group key={`${snapPoint.x}-${snapPoint.y}-${snapPoint.type}`}>
          <Line
            points={[
              snapPoint.x, snapPoint.y - size,
              snapPoint.x + size, snapPoint.y + size,
              snapPoint.x - size, snapPoint.y + size,
              snapPoint.x, snapPoint.y - size
            ]}
            fill={color}
            stroke="white"
            strokeWidth={1}
            closed={true}
            listening={false}
          />
          {isActive && (
            <Circle
              x={snapPoint.x}
              y={snapPoint.y}
              radius={size + 4}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
              listening={false}
            />
          )}
        </Group>
      );
    } else {
      // Default: render as circle (grid points)
      return (
        <Group key={`${snapPoint.x}-${snapPoint.y}-${snapPoint.type}`}>
          <Circle
            x={snapPoint.x}
            y={snapPoint.y}
            radius={size}
            fill={color}
            stroke="white"
            strokeWidth={1}
            listening={false}
            opacity={snapPoint.type === 'grid' ? 0.6 : 1}
          />
          {isActive && (
            <Circle
              x={snapPoint.x}
              y={snapPoint.y}
              radius={size + 4}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
              listening={false}
            />
          )}
        </Group>
      );
    }
  };

  return (
    <Group>
      {/* Render all snap points */}
      {snapPoints.map(snapPoint => 
        renderSnapPoint(snapPoint, false)
      )}
      
      {/* Render active snap point with highlight */}
      {activeSnapPoint && renderSnapPoint(activeSnapPoint, true)}
    </Group>
  );
};

export default SnapIndicators;