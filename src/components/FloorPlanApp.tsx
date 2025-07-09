"use client";
import React, { useState } from 'react';
import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { useToolContext } from '@/context/ToolContext';
import { useFileOperations } from '@/context/FileOperationsContext';
import ResponsiveToolbar from '@/components/ui/ResponsiveToolbar';
import PropertiesPanel from '@/components/ui/PropertiesPanel';
import SimpleCanvas from '@/components/canvas/SimpleCanvas';
import LayersPanel from '@/components/ui/LayersPanel';
import QuickActionsPanel from '@/components/ui/QuickActionsPanel';
import ExportDialog from '@/components/ui/ExportDialog';
import ImportDialog from '@/components/ui/ImportDialog';
import { Settings, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectData } from '@/types';

const FloorPlanApp: React.FC = () => {
  const { state, undo, redo, setZoom, dispatch, toggleGrid, toggleSnap, toggleGuides } = useFloorPlanContext();
  const { activeTool, setActiveTool } = useToolContext();
  const fileOperations = useFileOperations();
  
  // UI State
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [rightSidebarTab, setRightSidebarTab] = useState<'properties' | 'layers'>('properties');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Helper function to convert FloorPlanState to ProjectData
  const stateToProjectData = (): ProjectData => {
    return {
      version: '1.0.0',
      metadata: {
        name: state.project.name || 'Untitled Project',
        description: '',
        author: 'Floor Plan App User',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        scale: state.project.scale || 1,
        units: state.project.unitSystem === 'imperial' ? 'ft' : 'm'
      },
      objects: Object.values(state.objects) as any[],
      layers: Object.values(state.layers).map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        locked: layer.locked,
        color: layer.color
      })),
      measurements: Object.values(state.dimensions).map(dim => ({
        id: dim.id,
        type: dim.type,
        startPoint: dim.startPoint,
        endPoint: dim.endPoint,
        centerPoint: dim.centerPoint,
        points: dim.points,
        value: dim.value,
        label: dim.label,
        units: dim.units,
        style: dim.style
      })),
      settings: {
        unitSystem: state.project.unitSystem,
        displayFormat: 'decimal',
        precision: 2,
        gridSize: state.canvas.grid.size,
        gridVisible: state.canvas.grid.visible,
        snapToGrid: state.canvas.snap.snapToGrid,
        snapToObjects: true,
        backgroundImage: undefined
      }
    };
  };

  // Handlers
  const handleSave = async () => {
    try {
      const projectData = stateToProjectData();
      const timestamp = Date.now();
      const projectKey = `project-${timestamp}`;
      
      await fileOperations.saveProject(projectData, 'local');
      console.log('Project saved successfully');
      
      // Show success notification (you could add a toast notification here)
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleLoad = () => {
    setShowImportDialog(true);
  };

  const handleExport = () => {
    setShowExportDialog(true);
  };

  const handleProjectLoad = (projectData: ProjectData) => {
    try {
      // Convert ProjectData back to FloorPlanState format and dispatch LOAD_PROJECT
      dispatch({ type: 'LOAD_PROJECT', payload: projectData });
      setShowImportDialog(false);
      console.log('Project loaded successfully');
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project. Please try again.');
    }
  };

  const handleToggleGrid = () => {
    toggleGrid();
    console.log('Grid toggled:', !state.canvas.grid.visible);
  };

  const handleToggleSnap = () => {
    toggleSnap();
    console.log('Snap toggled:', !state.canvas.snap.enabled);
  };

  const handleToggleGuides = () => {
    toggleGuides();
    const guidesVisible = state.guides.length > 0 ? state.guides[0].visible : false;
    console.log('Guides toggled:', !guidesVisible);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(state.canvas.viewport.zoom * 1.2, 10));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(state.canvas.viewport.zoom * 0.8, 0.1));
  };

  const handleZoomFit = () => {
    setZoom(1);
    // TODO: Implement fit to screen logic
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Responsive Toolbar */}
      <ResponsiveToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        canUndo={state.history.canUndo}
        canRedo={state.history.canRedo}
        undo={undo}
        redo={redo}
        zoomLevel={state.canvas.viewport.zoom}
        gridVisible={state.canvas.grid.visible}
        snapToGrid={state.canvas.snap.snapToGrid}
        onToggleGrid={handleToggleGrid}
        onToggleSnap={handleToggleSnap}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative">
          <SimpleCanvas 
            onTextToolClick={(x, y) => {
              console.log('Text tool clicked at:', x, y);
            }}
            onRoomToolClick={(x, y) => {
              console.log('Room tool clicked at:', x, y);
            }}
          />
          
          {/* Quick Actions Panel - Overlay */}
          {showQuickActions && (
            <QuickActionsPanel
              onSave={handleSave}
              onLoad={handleLoad}
              onExport={handleExport}
              onToggleGrid={handleToggleGrid}
              onToggleSnap={handleToggleSnap}
              onToggleGuides={handleToggleGuides}
              gridVisible={state.canvas.grid.visible}
              snapToGrid={state.canvas.snap.snapToGrid}
              guidesVisible={true}
              className="absolute top-4 left-4 w-64 max-w-xs z-30"
            />
          )}

          {/* Quick Actions Toggle */}
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="absolute top-4 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 z-40 w-8 h-8 transition-all duration-200"
            style={{ 
              left: showQuickActions ? '272px' : '16px'
            }}
            title={showQuickActions ? 'Hide quick actions' : 'Show quick actions'}
          >
            {showQuickActions ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Project Title - Top Center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border px-4 py-2 z-20">
            <h1 className="text-lg font-semibold text-gray-800">
              {state.project.name}
            </h1>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`bg-white shadow-lg border-l border-gray-200 flex flex-col transition-all duration-300 ${
          showRightSidebar ? 'w-80' : 'w-0 overflow-hidden'
        }`}>
          {showRightSidebar && (
            <>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setRightSidebarTab('properties')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      rightSidebarTab === 'properties'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Settings size={16} />
                    <span>Properties</span>
                  </button>
                  <button
                    onClick={() => setRightSidebarTab('layers')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      rightSidebarTab === 'layers'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Layers size={16} />
                    <span>Layers</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowRightSidebar(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Hide sidebar"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-hidden">
                {rightSidebarTab === 'properties' && (
                  <div className="h-full">
                    <PropertiesPanel />
                  </div>
                )}
                {rightSidebarTab === 'layers' && (
                  <div className="h-full">
                    <LayersPanel 
          layers={Object.values(state.layers)}
          activeLayerId={Object.keys(state.layers)[0]}
          onLayerUpdate={() => {}}
          onLayerAdd={() => {}}
          onLayerDelete={() => {}}
          onLayerSelect={() => {}}
        />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar Toggle (when hidden) */}
        {!showRightSidebar && (
          <button
            onClick={() => setShowRightSidebar(true)}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 z-40 w-8 h-12"
            title="Show sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* File Operation Dialogs */}
      {showExportDialog && (
        <ExportDialog
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          projectData={stateToProjectData()}
        />
      )}

      {showImportDialog && (
        <ImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onProjectLoad={handleProjectLoad}
        />
      )}
    </div>
  );
};

export default FloorPlanApp;