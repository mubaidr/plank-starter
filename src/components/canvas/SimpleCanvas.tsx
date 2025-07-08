"use client";
import React from 'react';
import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { useToolContext } from '@/context/ToolContext';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { useLassoSelection } from '@/hooks/useLassoSelection';
import { useSnapToGuides, Guide } from '@/hooks/useSnapToGuides';
import { useManualRoomDefinition, RoomBoundary } from '@/hooks/useManualRoomDefinition';
import RoomManagementPanel from '@/components/ui/RoomManagementPanel';
import GuidesPanel from '@/components/ui/GuidesPanel';
import { useValidationRules } from '@/hooks/useValidationRules';
import ValidationPanel from '@/components/ui/ValidationPanel';
import ValidationIndicator from '@/components/ui/ValidationIndicator';
import ValidationMarkers from '@/components/ui/ValidationMarkers';
import StatusBar from '@/components/ui/StatusBar';
import FloatingPanels from '@/components/ui/FloatingPanels';
import { useSectionLines } from '@/hooks/useSectionLines';
import SectionViewPanel from '@/components/ui/SectionViewPanel';

interface SimpleCanvasProps {
  onTextToolClick?: (x: number, y: number) => void;
  onRoomToolClick?: (x: number, y: number) => void;
}

const SimpleCanvas: React.FC<SimpleCanvasProps> = ({
  onTextToolClick,
  onRoomToolClick
}) => {
  const { state, addObject, setZoom, setPan, selectObjects } = useFloorPlanContext();
  const { activeTool } = useToolContext();
  
  // Guides state
  const [guides, setGuides] = React.useState<Guide[]>([]);
  const [snapTolerance, setSnapTolerance] = React.useState(10);
  const [snapToGuidesEnabled, setSnapToGuidesEnabled] = React.useState(true);
  const [currentMousePos, setCurrentMousePos] = React.useState<{ x: number; y: number } | null>(null);
  
  // Room definition state
  const [rooms, setRooms] = React.useState<RoomBoundary[]>([]);
  const [showRoomPanel, setShowRoomPanel] = React.useState(false);
  const [showGuidesPanel, setShowGuidesPanel] = React.useState(false);
  
  // Validation state
  const [showValidationPanel, setShowValidationPanel] = React.useState(false);
  const [showValidationMarkers, setShowValidationMarkers] = React.useState(true);
  const [validationEnabled, setValidationEnabled] = React.useState(true);
  
  // Section views state
  const [showSectionPanel, setShowSectionPanel] = React.useState(false);

  const objects = Object.values(state.objects);
  const zoom = state.canvas.viewport.zoom;
  const pan = state.canvas.viewport.pan;
  const gridVisible = state.canvas.grid.visible;
  const gridSize = state.canvas.grid.size;

  // Touch gesture support
  const { touchHandlers, isGesturing } = useTouchGestures({
    onZoom: setZoom,
    onPan: setPan,
    currentZoom: zoom,
    currentPan: pan,
    minZoom: 0.1,
    maxZoom: 10
  });

  // Lasso selection support
  const { lassoState, lassoHandlers, getLassoPath, isLassoActive } = useLassoSelection({
    onSelectionComplete: selectObjects,
    objects: objects.map(obj => ({
      id: obj.id,
      position: obj.position,
      properties: obj.properties
    })),
    isEnabled: activeTool === 'lasso'
  });

  // Snap to guides support
  const {
    snapToGuides,
    getSnapIndicators,
    createGuideFromMouse,
    isCreatingGuide,
    setIsCreatingGuide,
    handleKeyDown
  } = useSnapToGuides({
    guides,
    onGuidesChange: setGuides,
    snapTolerance,
    enabled: snapToGuidesEnabled
  });

  // Manual room definition support
  const {
    roomState,
    isDefiningRoom,
    currentRoom,
    startRoomDefinition,
    addPointToRoom,
    completeRoom,
    cancelRoomDefinition,
    removeRoom,
    updateRoomProperties,
    updateRoomName,
    startEditingRoom,
    moveRoomPoint,
    removeRoomPoint,
    getRoomAtPoint,
    getRoomPath,
    handleKeyDown: handleRoomKeyDown
  } = useManualRoomDefinition({
    onRoomsChange: setRooms,
    rooms,
    snapToGuides: snapToGuidesEnabled ? snapToGuides : undefined,
    enabled: activeTool === 'room' || isDefiningRoom
  });

  // Validation system
  const {
    issues,
    summary,
    validationRules,
    runValidation,
    getIssuesForObject
  } = useValidationRules({
    objects,
    rooms,
    enabled: validationEnabled
  });

  // Section lines system
  const {
    sectionLines,
    sectionViews,
    isCreatingSection,
    currentSectionLine,
    startSectionLine,
    updateSectionLine,
    completeSectionLine,
    cancelSectionLine,
    removeSectionLine,
    updateSectionLineProperties,
    getSectionLinePath,
    getArrowPoints
  } = useSectionLines({
    objects,
    rooms,
    enabled: activeTool === 'section' || isCreatingSection
  });

  // Validation handlers
  const handleIssueClick = React.useCallback((issue: any) => {
    // Focus on the issue location
    if (issue.position) {
      // Could implement camera movement to focus on issue
      console.log('Focusing on issue:', issue);
    }
    
    // Select related objects
    if (issue.objectIds.length > 0) {
      selectObjects(issue.objectIds);
    }
  }, [selectObjects]);

  const handleRuleToggle = React.useCallback((ruleId: string, enabled: boolean) => {
    // Update validation rule state
    console.log('Toggle rule:', ruleId, enabled);
    // This would need to be implemented in the validation hook
  }, []);

  const handleAutoFix = React.useCallback((issue: any) => {
    if (issue.autoFix) {
      issue.autoFix();
      // Re-run validation after auto-fix
      runValidation();
    }
  }, [runValidation]);

  // Keyboard event handling for guides and rooms
  React.useEffect(() => {
    const handleKeyDownEvent = (e: KeyboardEvent) => {
      handleKeyDown(e);
      handleRoomKeyDown(e);
    };

    window.addEventListener('keydown', handleKeyDownEvent);
    return () => window.removeEventListener('keydown', handleKeyDownEvent);
  }, [handleKeyDown, handleRoomKeyDown]);

  // Mouse wheel zoom support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, zoom * zoomFactor));
    setZoom(newZoom);
  };

  // Mouse move tracking for guides
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setCurrentMousePos({ x, y });

    // Handle guide creation
    if (isCreatingGuide) {
      createGuideFromMouse(e, isCreatingGuide);
      setIsCreatingGuide(null);
    }

    // Handle section line creation
    if (isCreatingSection && currentSectionLine) {
      updateSectionLine({ x, y });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't handle clicks during touch gestures or lasso selection
    if (isGesturing || isLassoActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let x = (e.clientX - rect.left - pan.x) / zoom;
    let y = (e.clientY - rect.top - pan.y) / zoom;

    // Apply snap to guides if enabled
    if (snapToGuidesEnabled) {
      const snapResult = snapToGuides({ x, y });
      if (snapResult.snapped) {
        x = snapResult.snapPoint.x;
        y = snapResult.snapPoint.y;
      }
    }

    // Handle room definition clicks
    if (isDefiningRoom) {
      addPointToRoom({ x, y });
      return;
    }

    // Handle section line creation
    if (activeTool === 'section') {
      if (!isCreatingSection) {
        startSectionLine({ x, y });
      } else {
        completeSectionLine();
      }
      return;
    }

    if (activeTool === 'text' && onTextToolClick) {
      onTextToolClick(x, y);
    } else if (activeTool === 'room' && onRoomToolClick) {
      onRoomToolClick(x, y);
    } else if (activeTool === 'rectangle') {
      // Create a simple rectangle
      const newObject = {
        id: `rect-${Date.now()}`,
        type: 'rectangle' as const,
        position: { x, y },
        rotation: 0,
        scale: { x: 1, y: 1 },
        visible: true,
        locked: false,
        layerId: 'layer-1',
        properties: {
          width: 100,
          height: 60,
          fill: '#3B82F6',
          stroke: '#1E40AF',
          strokeWidth: 2
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      };
      addObject(newObject);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 relative overflow-hidden">
      {/* Grid */}
      {gridVisible && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ccc 1px, transparent 1px),
              linear-gradient(to bottom, #ccc 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`
          }}
        />
      )}

      {/* Canvas */}
      <div
        className={`w-full h-full ${activeTool === 'lasso' ? 'cursor-crosshair' : 'cursor-crosshair'}`}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        {...(activeTool === 'lasso' ? lassoHandlers : touchHandlers)}
        style={{ 
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          touchAction: 'none' // Prevent default touch behaviors
        }}
      >
        {/* Render objects */}
        {objects.map((obj) => (
          <div
            key={obj.id}
            className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-50"
            style={{
              left: obj.position.x,
              top: obj.position.y,
              width: obj.properties?.width || 100,
              height: obj.properties?.height || 60,
              transform: `rotate(${obj.rotation}deg)`
            }}
          >
            <div className="text-xs p-1 text-blue-800">
              {obj.type} {obj.id.split('-')[1]}
            </div>
          </div>
        ))}

        {/* Validation Markers */}
        <ValidationMarkers
          issues={issues}
          visible={showValidationMarkers}
          onIssueClick={handleIssueClick}
          zoom={zoom}
          pan={pan}
        />

        {/* Room Overlays */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Completed rooms */}
          {rooms.map((room) => (
            <g key={room.id}>
              <path
                d={getRoomPath(room)}
                fill={room.color}
                fillOpacity="0.3"
                stroke={room.color}
                strokeWidth="2"
                strokeDasharray={room.isComplete ? "none" : "5,5"}
              />
              {/* Room label */}
              {room.isComplete && room.points.length > 0 && (
                <text
                  x={room.points.reduce((sum, p) => sum + p.x, 0) / room.points.length}
                  y={room.points.reduce((sum, p) => sum + p.y, 0) / room.points.length}
                  fill={room.color}
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ filter: 'drop-shadow(1px 1px 1px rgba(255,255,255,0.8))' }}
                >
                  {room.name}
                </text>
              )}
              {/* Room control points when editing */}
              {currentRoom?.id === room.id && room.points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#FF6B6B"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="cursor-pointer"
                />
              ))}
            </g>
          ))}

          {/* Current room being defined */}
          {currentRoom && (
            <g>
              <path
                d={getRoomPath(currentRoom)}
                fill={currentRoom.color}
                fillOpacity="0.2"
                stroke={currentRoom.color}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              {/* Control points */}
              {currentRoom.points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={index === 0 ? "#10B981" : "#3B82F6"}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              ))}
              {/* Preview line to mouse */}
              {currentMousePos && currentRoom.points.length > 0 && (
                <line
                  x1={currentRoom.points[currentRoom.points.length - 1].x}
                  y1={currentRoom.points[currentRoom.points.length - 1].y}
                  x2={currentMousePos.x}
                  y2={currentMousePos.y}
                  stroke={currentRoom.color}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.7"
                />
              )}
              {/* Close indicator */}
              {currentRoom.points.length >= 3 && currentMousePos && (
                (() => {
                  const startPoint = currentRoom.points[0];
                  const distance = Math.sqrt(
                    Math.pow(currentMousePos.x - startPoint.x, 2) + 
                    Math.pow(currentMousePos.y - startPoint.y, 2)
                  );
                  return distance < 20 ? (
                    <circle
                      cx={startPoint.x}
                      cy={startPoint.y}
                      r="8"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                  ) : null;
                })()
              )}
            </g>
          )}
        </svg>

        {/* Section Lines Overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Completed section lines */}
          {sectionLines.map((sectionLine) => {
            if (!sectionLine.visible) return null;
            
            const arrowPoints = getArrowPoints(sectionLine);
            
            return (
              <g key={sectionLine.id}>
                {/* Section line */}
                <path
                  d={getSectionLinePath(sectionLine)}
                  stroke={sectionLine.color}
                  strokeWidth={sectionLine.properties.lineWeight}
                  strokeDasharray="8,4"
                  markerEnd="url(#arrowhead)"
                />
                
                {/* Arrow */}
                {arrowPoints.length === 3 && (
                  <polygon
                    points={arrowPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill={sectionLine.color}
                  />
                )}
                
                {/* Section label */}
                <text
                  x={(sectionLine.startPoint.x + sectionLine.endPoint.x) / 2}
                  y={(sectionLine.startPoint.y + sectionLine.endPoint.y) / 2 - sectionLine.properties.labelOffset}
                  fill={sectionLine.color}
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  style={{ filter: 'drop-shadow(1px 1px 1px rgba(255,255,255,0.8))' }}
                >
                  {sectionLine.name}
                </text>
              </g>
            );
          })}

          {/* Current section line being created */}
          {currentSectionLine && currentSectionLine.startPoint && currentSectionLine.endPoint && (
            <g>
              <path
                d={getSectionLinePath(currentSectionLine as any)}
                stroke={currentSectionLine.color}
                strokeWidth={currentSectionLine.properties?.lineWeight || 2}
                strokeDasharray="8,4"
                opacity="0.7"
              />
              
              {/* Start point indicator */}
              <circle
                cx={currentSectionLine.startPoint.x}
                cy={currentSectionLine.startPoint.y}
                r="4"
                fill={currentSectionLine.color}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              
              {/* End point indicator */}
              <circle
                cx={currentSectionLine.endPoint.x}
                cy={currentSectionLine.endPoint.y}
                r="4"
                fill={currentSectionLine.color}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Guides Overlay */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Render guides */}
          {guides.map((guide) => (
            <g key={guide.id}>
              {guide.type === 'horizontal' ? (
                <line
                  x1="0"
                  y1={guide.position}
                  x2="100%"
                  y2={guide.position}
                  stroke={guide.color}
                  strokeWidth={guide.isTemporary ? "2" : "1"}
                  strokeDasharray={guide.isTemporary ? "4,4" : "8,4"}
                  opacity={guide.isTemporary ? 0.8 : 0.6}
                />
              ) : (
                <line
                  x1={guide.position}
                  y1="0"
                  x2={guide.position}
                  y2="100%"
                  stroke={guide.color}
                  strokeWidth={guide.isTemporary ? "2" : "1"}
                  strokeDasharray={guide.isTemporary ? "4,4" : "8,4"}
                  opacity={guide.isTemporary ? 0.8 : 0.6}
                />
              )}
              {/* Guide label */}
              {guide.label && (
                <text
                  x={guide.type === 'vertical' ? guide.position + 5 : 5}
                  y={guide.type === 'horizontal' ? guide.position - 5 : 15}
                  fill={guide.color}
                  fontSize="12"
                  fontFamily="Arial, sans-serif"
                >
                  {guide.label}
                </text>
              )}
            </g>
          ))}

          {/* Snap indicators */}
          {currentMousePos && snapToGuidesEnabled && (
            <>
              {getSnapIndicators(currentMousePos).map((indicator, index) => (
                <g key={index}>
                  {indicator.type === 'line' ? (
                    <line
                      x1={indicator.x1}
                      y1={indicator.y1}
                      x2={indicator.x2}
                      y2={indicator.y2}
                      stroke={indicator.color}
                      strokeWidth={indicator.strokeWidth}
                      strokeDasharray={indicator.strokeDasharray}
                    />
                  ) : (
                    <circle
                      cx={indicator.cx}
                      cy={indicator.cy}
                      r={indicator.r}
                      fill={indicator.fill}
                      stroke={indicator.stroke}
                      strokeWidth={indicator.strokeWidth}
                    />
                  )}
                </g>
              ))}
            </>
          )}
        </svg>

        {/* Lasso Selection Overlay */}
        {isLassoActive && lassoState.points.length > 1 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          >
            <path
              d={getLassoPath()}
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="rgba(59, 130, 246, 0.1)"
              vectorEffect="non-scaling-stroke"
            />
            {lassoState.points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#3B82F6"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}
      </div>



      {/* Room Management Panel */}
      {showRoomPanel && (
        <RoomManagementPanel
          rooms={rooms}
          currentRoom={currentRoom}
          isDefiningRoom={isDefiningRoom}
          onStartRoomDefinition={startRoomDefinition}
          onCompleteRoom={completeRoom}
          onCancelRoomDefinition={cancelRoomDefinition}
          onRemoveRoom={removeRoom}
          onUpdateRoomName={updateRoomName}
          onUpdateRoomProperties={updateRoomProperties}
          onStartEditingRoom={startEditingRoom}
          onClose={() => setShowRoomPanel(false)}
        />
      )}

      {/* Guides Management Panel */}
      {showGuidesPanel && (
        <GuidesPanel
          guides={guides}
          onGuidesChange={setGuides}
          onClose={() => setShowGuidesPanel(false)}
          snapTolerance={snapTolerance}
          onSnapToleranceChange={setSnapTolerance}
          enabled={snapToGuidesEnabled}
          onEnabledChange={setSnapToGuidesEnabled}
        />
      )}

      {/* Validation Panel */}
      {showValidationPanel && (
        <ValidationPanel
          issues={issues}
          validationRules={validationRules}
          summary={summary}
          onClose={() => setShowValidationPanel(false)}
          onIssueClick={handleIssueClick}
          onRuleToggle={handleRuleToggle}
          onAutoFix={handleAutoFix}
        />
      )}

      {/* Section View Panel */}
      {showSectionPanel && (
        <SectionViewPanel
          sectionLines={sectionLines}
          sectionViews={sectionViews}
          onClose={() => setShowSectionPanel(false)}
          onRemoveSectionLine={removeSectionLine}
          onUpdateSectionLine={updateSectionLineProperties}
          onStartCreatingSection={() => {
            setShowSectionPanel(false);
            // Note: User needs to select section tool first
          }}
          onExportSection={(sectionId) => {
            console.log('Export section:', sectionId);
            // TODO: Implement section export
          }}
        />
      )}

      {/* Floating Panels */}
      <FloatingPanels
        activeTool={activeTool}
        onOpenRoomPanel={() => setShowRoomPanel(true)}
        onOpenGuidesPanel={() => setShowGuidesPanel(true)}
        onOpenSectionPanel={() => setShowSectionPanel(true)}
        onOpenValidationPanel={() => setShowValidationPanel(true)}
        validationEnabled={validationEnabled}
        onToggleValidation={() => setValidationEnabled(!validationEnabled)}
        validationSummary={{
          total: summary.total,
          critical: summary.critical,
          high: summary.high
        }}
      />

      {/* Status Bar */}
      <StatusBar
        activeTool={activeTool}
        objectCount={objects.length}
        zoom={zoom}
        pan={pan}
        gridVisible={gridVisible}
        gridSize={gridSize}
        guidesEnabled={snapToGuidesEnabled}
        guidesCount={guides.length}
        snapTolerance={snapTolerance}
        roomsCount={rooms.length}
        totalArea={rooms.reduce((sum, room) => sum + (room.properties.area || 0), 0)}
        validationEnabled={validationEnabled}
        validationIssues={summary.total}
        criticalIssues={summary.critical + summary.high}
        isGesturing={isGesturing}
        isCreatingGuide={isCreatingGuide}
        isDefiningRoom={isDefiningRoom}
        currentRoomName={currentRoom?.name}
        currentRoomPoints={currentRoom?.points.length}
      />
    </div>
  );
};

export default SimpleCanvas;