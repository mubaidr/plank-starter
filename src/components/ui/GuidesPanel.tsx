"use client";
import React, { useState } from 'react';
import { Ruler, Plus, Trash2, Eye, EyeOff, Lock, Unlock, X, Move } from 'lucide-react';
import { Guide } from '@/hooks/useSnapToGuides';

interface GuidesPanelProps {
  guides: Guide[];
  onGuidesChange: (guides: Guide[]) => void;
  onClose: () => void;
  snapTolerance: number;
  onSnapToleranceChange: (tolerance: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const GuidesPanel: React.FC<GuidesPanelProps> = ({
  guides,
  onGuidesChange,
  onClose,
  snapTolerance,
  onSnapToleranceChange,
  enabled,
  onEnabledChange
}) => {
  const [newGuideType, setNewGuideType] = useState<'horizontal' | 'vertical'>('vertical');
  const [newGuidePosition, setNewGuidePosition] = useState<string>('');
  const [editingGuide, setEditingGuide] = useState<string | null>(null);
  const [editPosition, setEditPosition] = useState<string>('');

  const addGuide = () => {
    const position = parseFloat(newGuidePosition);
    if (isNaN(position)) return;

    const newGuide: Guide = {
      id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: newGuideType,
      position,
      color: '#3B82F6',
      isTemporary: false,
      label: `${newGuideType} ${position}`
    };

    onGuidesChange([...guides, newGuide]);
    setNewGuidePosition('');
  };

  const removeGuide = (guideId: string) => {
    onGuidesChange(guides.filter(guide => guide.id !== guideId));
  };

  const updateGuide = (guideId: string, updates: Partial<Guide>) => {
    onGuidesChange(guides.map(guide => 
      guide.id === guideId ? { ...guide, ...updates } : guide
    ));
  };

  const startEdit = (guide: Guide) => {
    setEditingGuide(guide.id);
    setEditPosition(guide.position.toString());
  };

  const finishEdit = () => {
    if (editingGuide) {
      const position = parseFloat(editPosition);
      if (!isNaN(position)) {
        updateGuide(editingGuide, { position });
      }
    }
    setEditingGuide(null);
    setEditPosition('');
  };

  const cancelEdit = () => {
    setEditingGuide(null);
    setEditPosition('');
  };

  const clearAllGuides = () => {
    onGuidesChange([]);
  };

  const clearTemporaryGuides = () => {
    onGuidesChange(guides.filter(guide => !guide.isTemporary));
  };

  const permanentGuides = guides.filter(guide => !guide.isTemporary);
  const temporaryGuides = guides.filter(guide => guide.isTemporary);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Ruler className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Snap to Guides</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Enable/Disable Snap to Guides */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Enable Snap to Guides
            </label>
            <button
              onClick={() => onEnabledChange(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Snap Tolerance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Snap Tolerance (pixels)
            </label>
            <input
              type="number"
              value={snapTolerance}
              onChange={(e) => onSnapToleranceChange(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="50"
            />
          </div>

          {/* Add New Guide */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Guide</h3>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <select
                  value={newGuideType}
                  onChange={(e) => setNewGuideType(e.target.value as 'horizontal' | 'vertical')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
                <input
                  type="number"
                  value={newGuidePosition}
                  onChange={(e) => setNewGuidePosition(e.target.value)}
                  placeholder="Position"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addGuide}
                  disabled={!newGuidePosition}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Permanent Guides */}
          {permanentGuides.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Guides ({permanentGuides.length})</h3>
                <button
                  onClick={clearAllGuides}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {permanentGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: guide.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {guide.type === 'horizontal' ? 'H' : 'V'} - {guide.label || `${guide.position}px`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {editingGuide === guide.id ? (
                          <div className="flex space-x-1 mt-1">
                            <input
                              type="number"
                              value={editPosition}
                              onChange={(e) => setEditPosition(e.target.value)}
                              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') finishEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                              autoFocus
                            />
                            <button
                              onClick={finishEdit}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          `Position: ${guide.position}px`
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(guide)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit position"
                      >
                        <Move size={14} />
                      </button>
                      <button
                        onClick={() => removeGuide(guide.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Remove guide"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Temporary Guides */}
          {temporaryGuides.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Temporary Guides ({temporaryGuides.length})</h3>
                <button
                  onClick={clearTemporaryGuides}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear Temp
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {temporaryGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="flex items-center space-x-2 p-2 bg-red-50 rounded-md"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: guide.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {guide.type === 'horizontal' ? 'H' : 'V'} - Temp
                      </div>
                      <div className="text-xs text-gray-500">
                        Position: {guide.position}px
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => updateGuide(guide.id, { isTemporary: false, color: '#3B82F6' })}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        title="Make permanent"
                      >
                        Keep
                      </button>
                      <button
                        onClick={() => removeGuide(guide.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Remove guide"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Keyboard Shortcuts</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• <kbd className="bg-blue-200 px-1 rounded">Ctrl+H</kbd> - Create horizontal guide at cursor</div>
              <div>• <kbd className="bg-blue-200 px-1 rounded">Ctrl+V</kbd> - Create vertical guide at cursor</div>
              <div>• <kbd className="bg-blue-200 px-1 rounded">Ctrl+G</kbd> - Clear temporary guides</div>
              <div>• <kbd className="bg-blue-200 px-1 rounded">Esc</kbd> - Cancel guide creation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesPanel;