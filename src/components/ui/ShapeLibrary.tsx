"use client";
import React from 'react';
import { Sofa, Bed, Car, TreePine, Bath, ChefHat, Tv, Armchair } from 'lucide-react';

interface ShapeItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  category: 'furniture' | 'fixtures' | 'outdoor' | 'appliances';
  defaultProps: {
    width: number;
    height: number;
    fill: string;
    stroke: string;
  };
}

interface ShapeLibraryProps {
  onShapeSelect: (shape: ShapeItem) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const shapes: ShapeItem[] = [
  // Furniture
  {
    id: 'sofa',
    name: 'Sofa',
    icon: Sofa,
    category: 'furniture',
    defaultProps: { width: 120, height: 60, fill: '#8B4513', stroke: '#654321' }
  },
  {
    id: 'bed',
    name: 'Bed',
    icon: Bed,
    category: 'furniture',
    defaultProps: { width: 140, height: 200, fill: '#DEB887', stroke: '#CD853F' }
  },
  {
    id: 'armchair',
    name: 'Armchair',
    icon: Armchair,
    category: 'furniture',
    defaultProps: { width: 80, height: 80, fill: '#8B4513', stroke: '#654321' }
  },
  
  // Fixtures
  {
    id: 'bathtub',
    name: 'Bathtub',
    icon: Bath,
    category: 'fixtures',
    defaultProps: { width: 160, height: 80, fill: '#F0F8FF', stroke: '#4682B4' }
  },
  
  // Appliances
  {
    id: 'stove',
    name: 'Stove',
    icon: ChefHat,
    category: 'appliances',
    defaultProps: { width: 60, height: 60, fill: '#2F4F4F', stroke: '#1C1C1C' }
  },
  {
    id: 'tv',
    name: 'TV',
    icon: Tv,
    category: 'appliances',
    defaultProps: { width: 100, height: 60, fill: '#000000', stroke: '#333333' }
  },
  
  // Outdoor
  {
    id: 'tree',
    name: 'Tree',
    icon: TreePine,
    category: 'outdoor',
    defaultProps: { width: 40, height: 40, fill: '#228B22', stroke: '#006400' }
  },
  {
    id: 'car',
    name: 'Car',
    icon: Car,
    category: 'outdoor',
    defaultProps: { width: 180, height: 80, fill: '#4169E1', stroke: '#191970' }
  }
];

const categories = [
  { id: 'furniture', name: 'Furniture', icon: Sofa },
  { id: 'fixtures', name: 'Fixtures', icon: Bath },
  { id: 'appliances', name: 'Appliances', icon: ChefHat },
  { id: 'outdoor', name: 'Outdoor', icon: TreePine }
];

const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
  onShapeSelect,
  activeCategory = 'furniture',
  onCategoryChange
}) => {
  const filteredShapes = shapes.filter(shape => shape.category === activeCategory);

  return (
    <div className="w-64 panel flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <h3 className="text-lg font-semibold text-gray-900">Shape Library</h3>
      </div>

      {/* Categories */}
      <div className="p-2 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-1">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange?.(category.id)}
                className={`flex flex-col items-center p-2 rounded-md text-xs transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Icon size={20} />
                <span className="mt-1">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shapes */}
      <div className="panel-content custom-scrollbar p-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredShapes.map(shape => {
            const Icon = shape.icon;
            return (
              <button
                key={shape.id}
                onClick={() => onShapeSelect(shape)}
                className="flex flex-col items-center p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                title={`Add ${shape.name}`}
              >
                <Icon size={24} />
                <span className="mt-1 text-xs text-gray-700">{shape.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          Click on a shape to add it to the canvas
        </p>
      </div>
    </div>
  );
};

export default ShapeLibrary;