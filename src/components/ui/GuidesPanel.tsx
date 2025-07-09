import React from 'react';
import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { Plus, Trash2 } from 'lucide-react';

interface Guide {
  id: string;
  type: 'vertical' | 'horizontal';
  position: number;
}

const GuidesPanel = () => {
  const { state, addGuide, removeGuide } = useFloorPlanContext();

  const handleAddVerticalGuide = () => {
    addGuide({
      id: `guide-${Date.now()}`,
      type: 'vertical',
      position: 100
    });
  };

  const handleAddHorizontalGuide = () => {
    addGuide({
      id: `guide-${Date.now()}`,
      type: 'horizontal',
      position: 100
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Guides</h2>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={handleAddVerticalGuide}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={16} className="mr-1 inline" /> Vertical
        </button>
        <button
          onClick={handleAddHorizontalGuide}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={16} className="mr-1 inline" /> Horizontal
        </button>
      </div>

      <div className="space-y-2">
        {state.guides.map((guide: Guide) => (
          <div key={guide.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div>
              <span className="font-medium">{guide.type === 'vertical' ? 'Vertical' : 'Horizontal'}</span>
              <span className="ml-2 text-gray-600">at {guide.position}px</span>
            </div>
            <button
              onClick={() => removeGuide(guide.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {state.guides.length === 0 && (
          <p className="text-gray-500 text-sm">No guides created yet</p>
        )}
      </div>
    </div>
  );
};

export default GuidesPanel;
