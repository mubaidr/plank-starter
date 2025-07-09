import React from 'react';
import { useToolContext } from '@/context/ToolContext';
import { useFloorPlanContext } from '@/context/FloorPlanContext';

const StatusBar: React.FC = () => {
  const { activeTool, measurementSettings } = useToolContext();
  const { state } = useFloorPlanContext();

  // Get mouse position relative to canvas
  const mousePosition = state.canvas.interaction.currentMousePosition || { x: 0, y: 0 };

  // Get zoom level as percentage
  const zoomPercentage = Math.round(state.canvas.viewport.zoom * 100);

  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-label">Tool:</span>
        <span className="status-value">{activeTool}</span>
      </div>

      <div className="status-item">
        <span className="status-label">Position:</span>
        <span className="status-value">
          X: {mousePosition.x.toFixed(1)}, Y: {mousePosition.y.toFixed(1)}
        </span>
      </div>

      <div className="status-item">
        <span className="status-label">Zoom:</span>
        <span className="status-value">{zoomPercentage}%</span>
      </div>

      <div className="status-item">
        <span className="status-label">Units:</span>
        <span className="status-value">
          {measurementSettings.unit === 'inches' ? 'Imperial (in)' : 'Metric (m)'}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
