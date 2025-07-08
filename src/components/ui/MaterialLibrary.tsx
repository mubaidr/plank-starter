"use client";
import React, { useState } from 'react';
import { Palette, Upload, X, Search } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  category: 'wall' | 'floor' | 'roof' | 'door' | 'window';
  color: string;
  texture?: string;
  properties: {
    roughness: number;
    metallic: number;
    opacity: number;
  };
}

interface MaterialLibraryProps {
  onMaterialSelect: (material: Material) => void;
  onClose: () => void;
}

const defaultMaterials: Material[] = [
  // Wall Materials
  { id: 'brick-red', name: 'Red Brick', category: 'wall', color: '#8B4513', properties: { roughness: 0.8, metallic: 0.0, opacity: 1.0 } },
  { id: 'concrete', name: 'Concrete', category: 'wall', color: '#A0A0A0', properties: { roughness: 0.9, metallic: 0.0, opacity: 1.0 } },
  { id: 'drywall', name: 'Drywall', category: 'wall', color: '#F5F5F5', properties: { roughness: 0.3, metallic: 0.0, opacity: 1.0 } },
  { id: 'wood-siding', name: 'Wood Siding', category: 'wall', color: '#DEB887', properties: { roughness: 0.7, metallic: 0.0, opacity: 1.0 } },
  
  // Floor Materials
  { id: 'hardwood', name: 'Hardwood', category: 'floor', color: '#8B4513', properties: { roughness: 0.4, metallic: 0.0, opacity: 1.0 } },
  { id: 'tile-ceramic', name: 'Ceramic Tile', category: 'floor', color: '#F0F8FF', properties: { roughness: 0.1, metallic: 0.0, opacity: 1.0 } },
  { id: 'carpet', name: 'Carpet', category: 'floor', color: '#708090', properties: { roughness: 1.0, metallic: 0.0, opacity: 1.0 } },
  { id: 'marble', name: 'Marble', category: 'floor', color: '#F8F8FF', properties: { roughness: 0.1, metallic: 0.1, opacity: 1.0 } },
  
  // Roof Materials
  { id: 'asphalt-shingle', name: 'Asphalt Shingle', category: 'roof', color: '#2F4F4F', properties: { roughness: 0.8, metallic: 0.0, opacity: 1.0 } },
  { id: 'clay-tile', name: 'Clay Tile', category: 'roof', color: '#CD853F', properties: { roughness: 0.6, metallic: 0.0, opacity: 1.0 } },
  { id: 'metal-roof', name: 'Metal Roofing', category: 'roof', color: '#708090', properties: { roughness: 0.2, metallic: 0.8, opacity: 1.0 } },
  
  // Door Materials
  { id: 'wood-door', name: 'Wood Door', category: 'door', color: '#8B4513', properties: { roughness: 0.5, metallic: 0.0, opacity: 1.0 } },
  { id: 'glass-door', name: 'Glass Door', category: 'door', color: '#E0FFFF', properties: { roughness: 0.0, metallic: 0.0, opacity: 0.3 } },
  
  // Window Materials
  { id: 'clear-glass', name: 'Clear Glass', category: 'window', color: '#E0FFFF', properties: { roughness: 0.0, metallic: 0.0, opacity: 0.2 } },
  { id: 'tinted-glass', name: 'Tinted Glass', category: 'window', color: '#696969', properties: { roughness: 0.0, metallic: 0.0, opacity: 0.4 } },
];

const MaterialLibrary: React.FC<MaterialLibraryProps> = ({ onMaterialSelect, onClose }) => {
  const [materials, setMaterials] = useState<Material[]>(defaultMaterials);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Materials' },
    { id: 'wall', name: 'Wall Materials' },
    { id: 'floor', name: 'Floor Materials' },
    { id: 'roof', name: 'Roof Materials' },
    { id: 'door', name: 'Door Materials' },
    { id: 'window', name: 'Window Materials' },
  ];

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCustomMaterialUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const texture = e.target?.result as string;
          const newMaterial: Material = {
            id: `custom-${Date.now()}`,
            name: file.name.split('.')[0],
            category: 'wall',
            color: '#808080',
            texture,
            properties: { roughness: 0.5, metallic: 0.0, opacity: 1.0 }
          };
          setMaterials(prev => [...prev, newMaterial]);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Material Library</h3>
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

            <div className="mt-6">
              <button
                onClick={handleCustomMaterialUpload}
                className="w-full flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                <Upload size={16} />
                <span>Upload Custom</span>
              </button>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="flex-1 p-4">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredMaterials.map(material => (
                <div
                  key={material.id}
                  onClick={() => onMaterialSelect(material)}
                  className="cursor-pointer border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div
                    className="w-full h-20 rounded-md mb-2 border"
                    style={{
                      backgroundColor: material.color,
                      backgroundImage: material.texture ? `url(${material.texture})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {material.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {material.category}
                  </div>
                  
                  {/* Material Properties */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Roughness:</span>
                      <span className="text-gray-700">{(material.properties.roughness * 100).toFixed(0)}%</span>
                    </div>
                    {material.properties.metallic > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Metallic:</span>
                        <span className="text-gray-700">{(material.properties.metallic * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {material.properties.opacity < 1 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Opacity:</span>
                        <span className="text-gray-700">{(material.properties.opacity * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Palette className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No materials found matching your criteria</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialLibrary;