import React from 'react';
import { Group, Line, Text, Circle, Arrow } from 'react-konva';

interface Dimension {
  id: string;
  type: 'linear' | 'angular' | 'area' | 'radius';
  startPoint: { x: number; y: number };
  endPoint?: { x: number; y: number };
  centerPoint?: { x: number; y: number };
  points?: Array<{ x: number; y: number }>;
  value: number;
  label: string;
  units: 'px' | 'ft' | 'in' | 'm' | 'cm';
  style: {
    showExtensionLines: boolean;
    extensionLineLength: number;
    textPosition: 'above' | 'below' | 'center';
    arrowStyle: 'arrow' | 'dot' | 'slash';
    color: string;
  };
}

interface DimensionRendererProps {
  dimensions: Dimension[];
  visible: boolean;
}

const DimensionRenderer: React.FC<DimensionRendererProps> = ({
  dimensions,
  visible
}) => {
  if (!visible) return null;

  const renderLinearDimension = (dimension: Dimension) => {
    if (!dimension.startPoint || !dimension.endPoint) return null;

    const { startPoint, endPoint, style, label } = dimension;
    const offset = 20; // Distance from the measured line

    // Calculate perpendicular offset for dimension line
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return null;

    // Unit vector perpendicular to the line
    const perpX = -dy / length;
    const perpY = dx / length;

    // Dimension line points (offset from the actual line)
    const dimStartX = startPoint.x + perpX * offset;
    const dimStartY = startPoint.y + perpY * offset;
    const dimEndX = endPoint.x + perpX * offset;
    const dimEndY = endPoint.y + perpY * offset;

    // Extension line points
    const extStartX1 = startPoint.x;
    const extStartY1 = startPoint.y;
    const extEndX1 = startPoint.x + perpX * (offset + style.extensionLineLength);
    const extEndY1 = startPoint.y + perpY * (offset + style.extensionLineLength);

    const extStartX2 = endPoint.x;
    const extStartY2 = endPoint.y;
    const extEndX2 = endPoint.x + perpX * (offset + style.extensionLineLength);
    const extEndY2 = endPoint.y + perpY * (offset + style.extensionLineLength);

    // Text position
    const textX = (dimStartX + dimEndX) / 2;
    const textY = (dimStartY + dimEndY) / 2;
    
    let textOffsetY = 0;
    if (style.textPosition === 'above') {
      textOffsetY = -8;
    } else if (style.textPosition === 'below') {
      textOffsetY = 8;
    }

    // Calculate text rotation to align with dimension line
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const textRotation = Math.abs(angle) > 90 ? angle + 180 : angle;

    return (
      <Group key={dimension.id}>
        {/* Extension lines */}
        {style.showExtensionLines && (
          <>
            <Line
              points={[extStartX1, extStartY1, extEndX1, extEndY1]}
              stroke={style.color}
              strokeWidth={1}
              dash={[2, 2]}
              listening={false}
            />
            <Line
              points={[extStartX2, extStartY2, extEndX2, extEndY2]}
              stroke={style.color}
              strokeWidth={1}
              dash={[2, 2]}
              listening={false}
            />
          </>
        )}

        {/* Dimension line */}
        <Line
          points={[dimStartX, dimStartY, dimEndX, dimEndY]}
          stroke={style.color}
          strokeWidth={2}
          listening={false}
        />

        {/* Arrow heads or end markers */}
        {style.arrowStyle === 'arrow' && (
          <>
            <Arrow
              points={[dimStartX + dx * 0.05, dimStartY + dy * 0.05, dimStartX, dimStartY]}
              fill={style.color}
              stroke={style.color}
              strokeWidth={1}
              pointerLength={6}
              pointerWidth={4}
              listening={false}
            />
            <Arrow
              points={[dimEndX - dx * 0.05, dimEndY - dy * 0.05, dimEndX, dimEndY]}
              fill={style.color}
              stroke={style.color}
              strokeWidth={1}
              pointerLength={6}
              pointerWidth={4}
              listening={false}
            />
          </>
        )}

        {style.arrowStyle === 'dot' && (
          <>
            <Circle
              x={dimStartX}
              y={dimStartY}
              radius={3}
              fill={style.color}
              listening={false}
            />
            <Circle
              x={dimEndX}
              y={dimEndY}
              radius={3}
              fill={style.color}
              listening={false}
            />
          </>
        )}

        {style.arrowStyle === 'slash' && (
          <>
            <Line
              points={[
                dimStartX - perpX * 4,
                dimStartY - perpY * 4,
                dimStartX + perpX * 4,
                dimStartY + perpY * 4
              ]}
              stroke={style.color}
              strokeWidth={2}
              listening={false}
            />
            <Line
              points={[
                dimEndX - perpX * 4,
                dimEndY - perpY * 4,
                dimEndX + perpX * 4,
                dimEndY + perpY * 4
              ]}
              stroke={style.color}
              strokeWidth={2}
              listening={false}
            />
          </>
        )}

        {/* Dimension text */}
        <Text
          x={textX}
          y={textY + textOffsetY}
          text={label}
          fontSize={12}
          fontFamily="Arial"
          fill={style.color}
          align="center"
          verticalAlign="middle"
          rotation={textRotation}
          offsetX={label.length * 3} // Approximate text width offset
          offsetY={6}
          listening={false}
        />
      </Group>
    );
  };

  const renderAngularDimension = (dimension: Dimension) => {
    if (!dimension.centerPoint || !dimension.startPoint || !dimension.endPoint) return null;

    const { centerPoint, startPoint, endPoint, style, label } = dimension;
    const radius = 30; // Arc radius for angle display

    // Calculate angles
    const angle1 = Math.atan2(startPoint.y - centerPoint.y, startPoint.x - centerPoint.x);
    const angle2 = Math.atan2(endPoint.y - centerPoint.y, endPoint.x - centerPoint.x);
    
    let startAngle = angle1 * 180 / Math.PI;
    let endAngle = angle2 * 180 / Math.PI;
    
    // Ensure we draw the smaller angle
    if (Math.abs(endAngle - startAngle) > 180) {
      if (startAngle < endAngle) {
        startAngle += 360;
      } else {
        endAngle += 360;
      }
    }

    // Arc points for drawing
    const arcPoints: number[] = [];
    const steps = 20;
    const angleStep = (endAngle - startAngle) / steps;
    
    for (let i = 0; i <= steps; i++) {
      const currentAngle = (startAngle + i * angleStep) * Math.PI / 180;
      arcPoints.push(
        centerPoint.x + Math.cos(currentAngle) * radius,
        centerPoint.y + Math.sin(currentAngle) * radius
      );
    }

    // Text position (middle of arc)
    const midAngle = (startAngle + endAngle) / 2 * Math.PI / 180;
    const textX = centerPoint.x + Math.cos(midAngle) * (radius + 15);
    const textY = centerPoint.y + Math.sin(midAngle) * (radius + 15);

    return (
      <Group key={dimension.id}>
        {/* Center point */}
        <Circle
          x={centerPoint.x}
          y={centerPoint.y}
          radius={2}
          fill={style.color}
          listening={false}
        />

        {/* Radius lines */}
        <Line
          points={[
            centerPoint.x,
            centerPoint.y,
            centerPoint.x + Math.cos(angle1) * radius,
            centerPoint.y + Math.sin(angle1) * radius
          ]}
          stroke={style.color}
          strokeWidth={1}
          dash={[3, 3]}
          listening={false}
        />
        <Line
          points={[
            centerPoint.x,
            centerPoint.y,
            centerPoint.x + Math.cos(angle2) * radius,
            centerPoint.y + Math.sin(angle2) * radius
          ]}
          stroke={style.color}
          strokeWidth={1}
          dash={[3, 3]}
          listening={false}
        />

        {/* Arc */}
        <Line
          points={arcPoints}
          stroke={style.color}
          strokeWidth={2}
          listening={false}
        />

        {/* Angle text */}
        <Text
          x={textX}
          y={textY}
          text={label}
          fontSize={12}
          fontFamily="Arial"
          fill={style.color}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>
    );
  };

  const renderAreaDimension = (dimension: Dimension) => {
    if (!dimension.points || dimension.points.length < 3) return null;

    const { points, style, label } = dimension;

    // Calculate centroid for text placement
    const centroidX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centroidY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Create polygon outline
    const polygonPoints = points.flatMap(p => [p.x, p.y]);

    return (
      <Group key={dimension.id}>
        {/* Polygon outline */}
        <Line
          points={[...polygonPoints, points[0].x, points[0].y]} // Close the polygon
          stroke={style.color}
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />

        {/* Corner points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            x={point.x}
            y={point.y}
            radius={3}
            fill={style.color}
            listening={false}
          />
        ))}

        {/* Area text */}
        <Text
          x={centroidX}
          y={centroidY}
          text={label}
          fontSize={12}
          fontFamily="Arial"
          fill={style.color}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>
    );
  };

  const renderRadiusDimension = (dimension: Dimension) => {
    if (!dimension.centerPoint || !dimension.endPoint) return null;

    const { centerPoint, endPoint, style, label } = dimension;

    // Calculate radius line
    const dx = endPoint.x - centerPoint.x;
    const dy = endPoint.y - centerPoint.y;
    const radius = Math.sqrt(dx * dx + dy * dy);

    // Text position (middle of radius line)
    const textX = centerPoint.x + dx * 0.5;
    const textY = centerPoint.y + dy * 0.5;

    return (
      <Group key={dimension.id}>
        {/* Center point */}
        <Circle
          x={centerPoint.x}
          y={centerPoint.y}
          radius={3}
          fill={style.color}
          listening={false}
        />

        {/* Radius line */}
        <Line
          points={[centerPoint.x, centerPoint.y, endPoint.x, endPoint.y]}
          stroke={style.color}
          strokeWidth={2}
          listening={false}
        />

        {/* End point */}
        <Circle
          x={endPoint.x}
          y={endPoint.y}
          radius={2}
          fill={style.color}
          listening={false}
        />

        {/* Radius text */}
        <Text
          x={textX}
          y={textY - 8}
          text={label}
          fontSize={12}
          fontFamily="Arial"
          fill={style.color}
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      </Group>
    );
  };

  return (
    <Group>
      {dimensions.map(dimension => {
        switch (dimension.type) {
          case 'linear':
            return renderLinearDimension(dimension);
          case 'angular':
            return renderAngularDimension(dimension);
          case 'area':
            return renderAreaDimension(dimension);
          case 'radius':
            return renderRadiusDimension(dimension);
          default:
            return null;
        }
      })}
    </Group>
  );
};

export default DimensionRenderer;