import React from 'react';
import { useFloorPlanContext } from '@/context/FloorPlanContext';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Guide } from '@/types/floorPlanTypes';

const GuidesPanel = () => {
  const { state, addGuide, removeGuide, updateGuide } = useFloorPlanContext();

  const handleAddVerticalGuide = () => {
    addGuide({
      type: 'vertical',
      position: 100,
      color: '#3B82F6',
      visible: true
    });
  };

  const handleAddHorizontalGuide = () => {
    addGuide({
      type: 'horizontal',
      position: 100,
      color: '#3B82F6',
      visible: true
    });
  };

  const handleToggleGuideVisibility = (guide: Guide) => {
    updateGuide(guide.id, { visible: !guide.visible });
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
          <div key={guide.id} className={`flex items-center justify-between p-2 rounded ${
            guide.visible ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
          }`}>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border-2"
                style={{ backgroundColor: guide.visible ? guide.color : 'transparent', borderColor: guide.color }}
              />
              <div>
                <span className="font-medium">{guide.type === 'vertical' ? 'Vertical' : 'Horizontal'}</span>
                <span className="ml-2 text-gray-600">at {guide.position}px</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleToggleGuideVisibility(guide)}
                className="text-gray-500 hover:text-gray-700 p-1"
                title={guide.visible ? 'Hide guide' : 'Show guide'}
              >
                {guide.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={() => removeGuide(guide.id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete guide"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {state.guides.length === 0 && (
          <p className="text-gray-500 text-sm">No guides created yet. Click the buttons above to add vertical or horizontal guides.</p>
        )}
      </div>
    </div>
  );
};

export default GuidesPanel;
