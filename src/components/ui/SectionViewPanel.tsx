"use client";
import React, { useState } from 'react';
import { 
  Scissors, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Download, 
  Plus,
  X,
  Ruler,
  Palette,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { SectionLine, SectionView } from '@/hooks/useSectionLines';

interface SectionViewPanelProps {
  sectionLines: SectionLine[];
  sectionViews: SectionView[];
  onClose: () => void;
  onRemoveSectionLine: (id: string) => void;
  onUpdateSectionLine: (id: string, updates: Partial<SectionLine>) => void;
  onStartCreatingSection: () => void;
  onExportSection?: (sectionId: string) => void;
}

const SectionViewPanel: React.FC<SectionViewPanelProps> = ({
  sectionLines,
  sectionViews,
  onClose,
  onRemoveSectionLine,
  onUpdateSectionLine,
  onStartCreatingSection,
  onExportSection
}) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const startEditName = (section: SectionLine) => {
    setEditingSection(section.id);
    setEditName(section.name);
  };

  const finishEditName = () => {
    if (editingSection && editName.trim()) {
      onUpdateSectionLine(editingSection, { name: editName.trim() });
    }
    setEditingSection(null);
    setEditName('');
  };

  const cancelEditName = () => {
    setEditingSection(null);
    setEditName('');
  };

  const getSectionView = (sectionLineId: string) => {
    return sectionViews.find(view => view.sectionLineId === sectionLineId);
  };

  const getSectionLength = (section: SectionLine) => {
    const dx = section.endPoint.x - section.startPoint.x;
    const dy = section.endPoint.y - section.startPoint.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const formatLength = (length: number) => {
    return `${Math.round(length)}px`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Scissors className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Section Views</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Section List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Sections ({sectionLines.length})
                </h3>
                <button
                  onClick={onStartCreatingSection}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus size={14} />
                  <span>New</span>
                </button>
              </div>

              {sectionLines.length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No sections created yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Click "New" to create your first section
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sectionLines.map((section) => {
                    const sectionView = getSectionView(section.id);
                    const isExpanded = expandedSections.has(section.id);
                    const isSelected = selectedSection === section.id;

                    return (
                      <div
                        key={section.id}
                        className={`border rounded-lg transition-all ${
                          isSelected 
                            ? 'border-purple-300 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="p-3 cursor-pointer"
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: section.color }}
                              />
                              {editingSection === section.id ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') finishEditName();
                                    if (e.key === 'Escape') cancelEditName();
                                  }}
                                  onBlur={finishEditName}
                                  autoFocus
                                />
                              ) : (
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900">
                                    {section.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Length: {formatLength(getSectionLength(section))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateSectionLine(section.id, { visible: !section.visible });
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title={section.visible ? 'Hide section' : 'Show section'}
                              >
                                {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSectionExpansion(section.id);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            </div>
                          </div>

                          {/* Section Stats */}
                          {sectionView && (
                            <div className="mt-2 text-xs text-gray-500 grid grid-cols-3 gap-2">
                              <div>Walls: {sectionView.viewData.walls.length}</div>
                              <div>Doors: {sectionView.viewData.doors.length}</div>
                              <div>Windows: {sectionView.viewData.windows.length}</div>
                            </div>
                          )}
                        </div>

                        {/* Expanded Section Details */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="space-y-3">
                              {/* Section Properties */}
                              <div>
                                <h5 className="text-xs font-medium text-gray-600 mb-2">Properties</h5>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Color</span>
                                    <input
                                      type="color"
                                      value={section.color}
                                      onChange={(e) => onUpdateSectionLine(section.id, { color: e.target.value })}
                                      className="w-6 h-6 rounded border border-gray-300"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Line Weight</span>
                                    <input
                                      type="range"
                                      min="1"
                                      max="5"
                                      value={section.properties.lineWeight}
                                      onChange={(e) => onUpdateSectionLine(section.id, {
                                        properties: { ...section.properties, lineWeight: parseInt(e.target.value) }
                                      })}
                                      className="w-16"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600">Direction</span>
                                    <select
                                      value={section.direction}
                                      onChange={(e) => onUpdateSectionLine(section.id, { 
                                        direction: e.target.value as 'left-to-right' | 'right-to-left' 
                                      })}
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="left-to-right">Left to Right</option>
                                      <option value="right-to-left">Right to Left</option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => startEditName(section)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  <Edit3 size={12} />
                                  <span>Rename</span>
                                </button>
                                {onExportSection && (
                                  <button
                                    onClick={() => onExportSection(section.id)}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  >
                                    <Download size={12} />
                                    <span>Export</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => onRemoveSectionLine(section.id)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section View Display */}
          <div className="flex-1 overflow-y-auto">
            {selectedSection ? (
              <SectionViewRenderer 
                sectionLine={sectionLines.find(s => s.id === selectedSection)!}
                sectionView={getSectionView(selectedSection)!}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Section</h3>
                  <p className="text-gray-500">
                    Choose a section from the list to view its cross-section
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section View Renderer Component
const SectionViewRenderer: React.FC<{
  sectionLine: SectionLine;
  sectionView: SectionView;
}> = ({ sectionLine, sectionView }) => {
  if (!sectionView) return null;

  const { viewData } = sectionView;
  const maxHeight = viewData.height;
  const scale = 2; // Scale factor for display

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{sectionView.name}</h3>
        <p className="text-sm text-gray-600">
          Section through {sectionLine.name} • Scale: 1:{scale}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
        <svg
          width="800"
          height="400"
          viewBox={`0 0 800 400`}
          className="border border-gray-200 bg-white rounded"
        >
          {/* Ground line */}
          <line
            x1="0"
            y1="380"
            x2="800"
            y2="380"
            stroke="#8B5CF6"
            strokeWidth="2"
          />
          <text x="10" y="375" fontSize="12" fill="#6B7280">Ground Level</text>

          {/* Render walls */}
          {viewData.walls.map((wall, index) => {
            const x = 100 + index * 150; // Distribute walls across view
            const wallHeight = (wall.height / maxHeight) * 300;
            const wallThickness = wall.thickness * 2;

            return (
              <g key={wall.id}>
                {/* Wall */}
                <rect
                  x={x}
                  y={380 - wallHeight}
                  width={wallThickness}
                  height={wallHeight}
                  fill="#E5E7EB"
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                {/* Wall label */}
                <text
                  x={x + wallThickness / 2}
                  y={390}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor="middle"
                >
                  {wall.material}
                </text>
                {/* Height dimension */}
                <text
                  x={x + wallThickness + 5}
                  y={380 - wallHeight / 2}
                  fontSize="10"
                  fill="#6B7280"
                >
                  {wall.height}"
                </text>
              </g>
            );
          })}

          {/* Render doors */}
          {viewData.doors.map((door, index) => {
            const x = 200 + index * 200;
            const doorHeight = (door.height / maxHeight) * 300;
            const doorWidth = door.width / 2;

            return (
              <g key={door.id}>
                {/* Door opening */}
                <rect
                  x={x}
                  y={380 - doorHeight}
                  width={doorWidth}
                  height={doorHeight}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                {/* Door label */}
                <text
                  x={x + doorWidth / 2}
                  y={390}
                  fontSize="10"
                  fill="#F59E0B"
                  textAnchor="middle"
                >
                  Door {door.width}"×{door.height}"
                </text>
              </g>
            );
          })}

          {/* Render windows */}
          {viewData.windows.map((window, index) => {
            const x = 300 + index * 200;
            const windowHeight = (window.height / maxHeight) * 300;
            const windowWidth = window.width / 2;
            const sillHeight = (window.sillHeight / maxHeight) * 300;

            return (
              <g key={window.id}>
                {/* Window opening */}
                <rect
                  x={x}
                  y={380 - sillHeight - windowHeight}
                  width={windowWidth}
                  height={windowHeight}
                  fill="#DBEAFE"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                {/* Window sill */}
                <line
                  x1={x}
                  y1={380 - sillHeight}
                  x2={x + windowWidth}
                  y2={380 - sillHeight}
                  stroke="#3B82F6"
                  strokeWidth="3"
                />
                {/* Window label */}
                <text
                  x={x + windowWidth / 2}
                  y={390}
                  fontSize="10"
                  fill="#3B82F6"
                  textAnchor="middle"
                >
                  Window {window.width}"×{window.height}"
                </text>
              </g>
            );
          })}

          {/* Height reference */}
          <line
            x1="750"
            y1="80"
            x2="750"
            y2="380"
            stroke="#6B7280"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
          <text
            x="755"
            y="230"
            fontSize="12"
            fill="#6B7280"
          >
            {maxHeight}"
          </text>
        </svg>
      </div>

      {/* Section Statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700">Walls</div>
          <div className="text-2xl font-bold text-gray-900">{viewData.walls.length}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700">Openings</div>
          <div className="text-2xl font-bold text-gray-900">
            {viewData.doors.length + viewData.windows.length}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700">Max Height</div>
          <div className="text-2xl font-bold text-gray-900">{maxHeight}"</div>
        </div>
      </div>
    </div>
  );
};

export default SectionViewPanel;