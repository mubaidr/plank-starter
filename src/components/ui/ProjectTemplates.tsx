"use client";
import React, { useState } from 'react';
import { FileText, Home, Building, Warehouse, X } from 'lucide-react';

interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial';
  icon: React.ComponentType<{ size?: number }>;
  objects: CanvasObject[];
  settings: {
    gridSize: number;
    units: string;
    layers: Layer[];
  };
}

interface ProjectTemplatesProps {
  onTemplateSelect: (template: ProjectTemplate) => void;
  onClose: () => void;
}

const defaultTemplates: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start with an empty canvas',
    category: 'residential',
    icon: FileText,
    objects: [],
    settings: {
      gridSize: 20,
      units: 'ft',
      layers: [
        { id: 'layer-1', name: 'Walls', visible: true, locked: false, color: '#1E40AF' },
        { id: 'layer-2', name: 'Doors & Windows', visible: true, locked: false, color: '#059669' },
        { id: 'layer-3', name: 'Furniture', visible: true, locked: false, color: '#DC2626' }
      ]
    }
  },
  {
    id: 'single-family-home',
    name: 'Single Family Home',
    description: 'Basic residential floor plan template',
    category: 'residential',
    icon: Home,
    objects: [
      // Outer walls
      { id: 'wall-1', type: 'line', x: 100, y: 100, points: [0, 0, 400, 0], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 6, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-2', type: 'line', x: 500, y: 100, points: [0, 0, 0, 300], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 6, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-3', type: 'line', x: 500, y: 400, points: [0, 0, -400, 0], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 6, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-4', type: 'line', x: 100, y: 400, points: [0, 0, 0, -300], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 6, rotation: 0, layerId: 'layer-1' },
      // Interior wall
      { id: 'wall-5', type: 'line', x: 300, y: 100, points: [0, 0, 0, 300], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 4, rotation: 0, layerId: 'layer-1' },
      // Doors
      { id: 'door-1', type: 'door', x: 280, y: 200, width: 40, height: 8, fill: '#8B4513', stroke: '#654321', strokeWidth: 2, rotation: 0, doorType: 'single', layerId: 'layer-2' },
      // Windows
      { id: 'window-1', type: 'window', x: 200, y: 96, width: 80, height: 8, fill: '#87CEEB', stroke: '#4682B4', strokeWidth: 2, rotation: 0, windowType: 'standard', layerId: 'layer-2' }
    ],
    settings: {
      gridSize: 20,
      units: 'ft',
      layers: [
        { id: 'layer-1', name: 'Walls', visible: true, locked: false, color: '#1E40AF' },
        { id: 'layer-2', name: 'Doors & Windows', visible: true, locked: false, color: '#059669' },
        { id: 'layer-3', name: 'Furniture', visible: true, locked: false, color: '#DC2626' }
      ]
    }
  },
  {
    id: 'office-space',
    name: 'Office Space',
    description: 'Commercial office layout template',
    category: 'commercial',
    icon: Building,
    objects: [
      // Main office perimeter
      { id: 'wall-1', type: 'line', x: 50, y: 50, points: [0, 0, 600, 0], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 8, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-2', type: 'line', x: 650, y: 50, points: [0, 0, 0, 400], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 8, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-3', type: 'line', x: 650, y: 450, points: [0, 0, -600, 0], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 8, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-4', type: 'line', x: 50, y: 450, points: [0, 0, 0, -400], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 8, rotation: 0, layerId: 'layer-1' },
      // Office divisions
      { id: 'wall-5', type: 'line', x: 250, y: 50, points: [0, 0, 0, 400], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 4, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-6', type: 'line', x: 450, y: 50, points: [0, 0, 0, 200], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 4, rotation: 0, layerId: 'layer-1' },
      // Doors
      { id: 'door-1', type: 'door', x: 320, y: 46, width: 60, height: 8, fill: '#8B4513', stroke: '#654321', strokeWidth: 2, rotation: 0, doorType: 'double', layerId: 'layer-2' }
    ],
    settings: {
      gridSize: 25,
      units: 'ft',
      layers: [
        { id: 'layer-1', name: 'Walls', visible: true, locked: false, color: '#1E40AF' },
        { id: 'layer-2', name: 'Doors & Windows', visible: true, locked: false, color: '#059669' },
        { id: 'layer-3', name: 'Furniture', visible: true, locked: false, color: '#DC2626' },
        { id: 'layer-4', name: 'Equipment', visible: true, locked: false, color: '#7C3AED' }
      ]
    }
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    description: 'Industrial warehouse template',
    category: 'industrial',
    icon: Warehouse,
    objects: [
      // Large warehouse space
      { id: 'wall-1', type: 'line', x: 50, y: 50, points: [0, 0, 800, 0], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 10, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-2', type: 'line', x: 850, y: 50, points: [0, 0, 0, 500], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 10, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-3', type: 'line', x: 850, y: 550, points: [0, 0, -800, 0], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 10, rotation: 0, layerId: 'layer-1' },
      { id: 'wall-4', type: 'line', x: 50, y: 550, points: [0, 0, 0, -500], fill: 'transparent', stroke: '#1E40AF', strokeWidth: 10, rotation: 0, layerId: 'layer-1' },
      // Loading dock
      { id: 'door-1', type: 'door', x: 400, y: 546, width: 100, height: 8, fill: '#8B4513', stroke: '#654321', strokeWidth: 2, rotation: 0, doorType: 'sliding', layerId: 'layer-2' }
    ],
    settings: {
      gridSize: 50,
      units: 'ft',
      layers: [
        { id: 'layer-1', name: 'Structure', visible: true, locked: false, color: '#1E40AF' },
        { id: 'layer-2', name: 'Doors & Gates', visible: true, locked: false, color: '#059669' },
        { id: 'layer-3', name: 'Equipment', visible: true, locked: false, color: '#DC2626' },
        { id: 'layer-4', name: 'Storage', visible: true, locked: false, color: '#F59E0B' }
      ]
    }
  }
];

const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({ onTemplateSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'residential', name: 'Residential' },
    { id: 'commercial', name: 'Commercial' },
    { id: 'industrial', name: 'Industrial' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? defaultTemplates 
    : defaultTemplates.filter(t => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Project Templates</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex">
          {/* Categories Sidebar */}
          <div className="w-48 border-r border-gray-200 p-4">
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-2 gap-6 max-h-96 overflow-y-auto">
              {filteredTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    onClick={() => onTemplateSelect(template)}
                    className="cursor-pointer border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon size={32} className="text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 capitalize">
                            {template.category}
                          </span>
                          <div className="text-xs text-gray-500">
                            {template.objects.length} objects
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No templates found in this category</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTemplates;